"""
SkillPulse - Model 2: SkillMapper (MiniLM Contrastive Embedder)
Fine-tunes sentence-transformers/all-MiniLM-L6-v2 on semantic skill pairs.
Pre-computes taxonomy embeddings and exports model to ONNX for sub-15ms search.
"""

import os
import json
import sys
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import AutoTokenizer, AutoModel, get_linear_schedule_with_warmup

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "checkpoints" / "skillmapper_minilm"
ONNX_DIR = BASE_DIR / "onnx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ONNX_DIR.mkdir(parents=True, exist_ok=True)

class MapperDataset(Dataset):
    def __init__(self, data_path, tokenizer, max_length=64):
        with open(data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        q_enc = self.tokenizer(
            item["query"],
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )
        s_enc = self.tokenizer(
            item["canonical_skill"],
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )
        return {
            "q_input_ids": q_enc["input_ids"].squeeze(0),
            "q_attention_mask": q_enc["attention_mask"].squeeze(0),
            "s_input_ids": s_enc["input_ids"].squeeze(0),
            "s_attention_mask": s_enc["attention_mask"].squeeze(0),
            "score": torch.tensor(item["score"], dtype=torch.float)
        }


class MeanPoolingModel(nn.Module):
    def __init__(self, base_model):
        super().__init__()
        self.base = base_model

    def mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

    def forward(self, input_ids, attention_mask):
        outputs = self.base(input_ids=input_ids, attention_mask=attention_mask)
        embeddings = self.mean_pooling(outputs, attention_mask)
        return F.normalize(embeddings, p=2, dim=1)


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[SkillMapper] Training on device: {device}")

    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    print(f"[SkillMapper] Loading base model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    base = AutoModel.from_pretrained(model_name)
    model = MeanPoolingModel(base).to(device)

    train_dataset = MapperDataset(DATA_DIR / "mapper_train.json", tokenizer)
    val_dataset = MapperDataset(DATA_DIR / "mapper_val.json", tokenizer)

    batch_size = 32 if torch.cuda.is_available() else 16
    epochs = 4
    lr = 2e-5

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)

    optimizer = AdamW(model.parameters(), lr=lr)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * 0.1),
        num_training_steps=total_steps
    )
    criterion = nn.CosineEmbeddingLoss()

    print(f"[SkillMapper] Starting training for {epochs} epochs...")

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0

        for step, batch in enumerate(train_loader):
            q_ids = batch["q_input_ids"].to(device)
            q_mask = batch["q_attention_mask"].to(device)
            s_ids = batch["s_input_ids"].to(device)
            s_mask = batch["s_attention_mask"].to(device)
            scores = batch["score"].to(device)

            # Targets: 1 for positive (> 0.5), -1 for negative (<= 0.5)
            targets = torch.where(scores > 0.5, torch.tensor(1.0, device=device), torch.tensor(-1.0, device=device))

            optimizer.zero_grad()
            q_emb = model(q_ids, q_mask)
            s_emb = model(s_ids, s_mask)

            loss = criterion(q_emb, s_emb, targets)
            loss.backward()
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()

            if (step + 1) % 25 == 0 or (step + 1) == len(train_loader):
                print(f"  Epoch {epoch}/{epochs} | Step {step+1}/{len(train_loader)} | Loss: {loss.item():.4f}")

        # Evaluation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                q_ids = batch["q_input_ids"].to(device)
                q_mask = batch["q_attention_mask"].to(device)
                s_ids = batch["s_input_ids"].to(device)
                s_mask = batch["s_attention_mask"].to(device)
                scores = batch["score"].to(device)
                targets = torch.where(scores > 0.5, torch.tensor(1.0, device=device), torch.tensor(-1.0, device=device))

                q_emb = model(q_ids, q_mask)
                s_emb = model(s_ids, s_mask)
                val_loss += criterion(q_emb, s_emb, targets).item()

        print(f"[Epoch {epoch} Results] Train Loss: {total_loss/len(train_loader):.4f} | Val Loss: {val_loss/len(val_loader):.4f}")

    print(f"[SkillMapper] Saving model to {OUTPUT_DIR}...")
    model.base.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Pre-compute canonical taxonomy embeddings
    print("[SkillMapper] Pre-computing canonical taxonomy embeddings for instant cosine indexing...")
    with open(DATA_DIR / "canonical_taxonomy.json", "r", encoding="utf-8") as f:
        taxonomy = json.load(f)

    taxonomy_names = [s["name"] for s in taxonomy]
    enc = tokenizer(taxonomy_names, padding=True, truncation=True, return_tensors="pt").to(device)
    model.eval()
    with torch.no_grad():
        tax_embeddings = model(enc["input_ids"], enc["attention_mask"]).cpu().numpy()

    np.save(OUTPUT_DIR / "taxonomy_embeddings.npy", tax_embeddings)
    with open(OUTPUT_DIR / "taxonomy_metadata.json", "w", encoding="utf-8") as f:
        json.dump(taxonomy, f, indent=2)

    # Export to ONNX
    print("[SkillMapper] Exporting to ONNX format...")
    onnx_path = ONNX_DIR / "skillmapper_minilm.onnx"
    dummy_input_ids = torch.ones((1, 64), dtype=torch.long, device=device)
    dummy_mask = torch.ones((1, 64), dtype=torch.long, device=device)

    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_mask),
        str(onnx_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["embeddings"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "seq_len"},
            "attention_mask": {0: "batch_size", 1: "seq_len"},
            "embeddings": {0: "batch_size"}
        },
        opset_version=14
    )
def export_saved_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[SkillMapper] Loading saved checkpoint from {OUTPUT_DIR} for ONNX export...")
    tokenizer = AutoTokenizer.from_pretrained(OUTPUT_DIR)
    base = AutoModel.from_pretrained(OUTPUT_DIR)
    model = MeanPoolingModel(base).to(device)

    # Pre-compute canonical taxonomy embeddings
    print("[SkillMapper] Pre-computing canonical taxonomy embeddings for instant cosine indexing...")
    with open(DATA_DIR / "canonical_taxonomy.json", "r", encoding="utf-8") as f:
        taxonomy = json.load(f)

    taxonomy_names = [s["name"] for s in taxonomy]
    enc = tokenizer(taxonomy_names, padding=True, truncation=True, return_tensors="pt").to(device)
    model.eval()
    with torch.no_grad():
        tax_embeddings = model(enc["input_ids"], enc["attention_mask"]).cpu().numpy()

    np.save(OUTPUT_DIR / "taxonomy_embeddings.npy", tax_embeddings)
    with open(OUTPUT_DIR / "taxonomy_metadata.json", "w", encoding="utf-8") as f:
        json.dump(taxonomy, f, indent=2)

    # Export to ONNX
    print("[SkillMapper] Exporting to ONNX format...")
    onnx_path = ONNX_DIR / "skillmapper_minilm.onnx"
    dummy_input_ids = torch.ones((1, 64), dtype=torch.long, device=device)
    dummy_mask = torch.ones((1, 64), dtype=torch.long, device=device)

    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_mask),
        str(onnx_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["embeddings"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "seq_len"},
            "attention_mask": {0: "batch_size", 1: "seq_len"},
            "embeddings": {0: "batch_size"}
        },
        opset_version=14
    )
    print(f"[SkillMapper] Model exported successfully to: {onnx_path}")
    print("[SkillMapper] Completed successfully!")


if __name__ == "__main__":
    if (OUTPUT_DIR / "model.safetensors").exists() or (OUTPUT_DIR / "pytorch_model.bin").exists():
        export_saved_model()
    else:
        train()

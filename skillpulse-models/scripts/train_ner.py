"""
SkillPulse - Model 1: SkillExtractor (DistilBERT NER)
Fine-tunes distilbert-base-uncased on BIO-tagged student evidence.
Optimized for NVIDIA GeForce GTX 1650 (4 GB VRAM) with FP16 mixed precision.
"""

import os
import sys
import json
import torch
import numpy as np
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForTokenClassification,
    get_linear_schedule_with_warmup
)

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

# Set directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "checkpoints" / "skillextractor_ner"
ONNX_DIR = BASE_DIR / "onnx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ONNX_DIR.mkdir(parents=True, exist_ok=True)

# BIO Tags
LABEL_LIST = [
    "O",
    "B-SKILL", "I-SKILL",
    "B-TECH", "I-TECH",
    "B-ISSUER", "I-ISSUER",
    "B-DATE", "I-DATE",
    "B-ROLE", "I-ROLE",
    "B-ACHIEVEMENT", "I-ACHIEVEMENT"
]
LABEL2ID = {label: i for i, label in enumerate(LABEL_LIST)}
ID2LABEL = {i: label for i, label in enumerate(LABEL_LIST)}

class NERDataset(Dataset):
    def __init__(self, data_path, tokenizer, max_length=128):
        with open(data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        tokens = item["tokens"]
        tags = item["ner_tags"]

        encoding = self.tokenizer(
            tokens,
            is_split_into_words=True,
            return_offsets_mapping=True,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )

        labels = []
        word_ids = encoding.word_ids(batch_index=0)
        previous_word_idx = None

        for word_idx in word_ids:
            if word_idx is None:
                labels.append(-100)
            elif word_idx != previous_word_idx:
                tag = tags[word_idx] if word_idx < len(tags) else "O"
                labels.append(LABEL2ID.get(tag, LABEL2ID["O"]))
            else:
                tag = tags[word_idx] if word_idx < len(tags) else "O"
                label_id = LABEL2ID.get(tag, LABEL2ID["O"])
                # If subword of B-X, could be I-X
                if tag.startswith("B-"):
                    sub_tag = "I-" + tag[2:]
                    label_id = LABEL2ID.get(sub_tag, label_id)
                labels.append(label_id)
            previous_word_idx = word_idx

        item_dict = {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(labels, dtype=torch.long)
        }
        return item_dict


def compute_metrics(predictions, true_labels):
    correct = 0
    total = 0
    for preds, labels in zip(predictions, true_labels):
        for p, l in zip(preds, labels):
            if l != -100:
                if p == l:
                    correct += 1
                total += 1
    accuracy = correct / max(total, 1)
    return {"token_accuracy": accuracy}


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[SkillExtractor] Training on device: {device}")
    if torch.cuda.is_available():
        print(f"[SkillExtractor] GPU: {torch.cuda.get_device_name(0)} (VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB)")

    model_name = "distilbert-base-uncased"
    print(f"[SkillExtractor] Loading tokenizer & model: {model_name}")
    tokenizer = DistilBertTokenizerFast.from_pretrained(model_name)
    model = DistilBertForTokenClassification.from_pretrained(
        model_name,
        num_labels=len(LABEL_LIST),
        id2label=ID2LABEL,
        label2id=LABEL2ID
    ).to(device)

    train_dataset = NERDataset(DATA_DIR / "ner_train.json", tokenizer)
    val_dataset = NERDataset(DATA_DIR / "ner_val.json", tokenizer)

    # GTX 1650 configs
    batch_size = 16 if torch.cuda.is_available() else 8
    epochs = 5
    lr = 3e-5

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)

    optimizer = AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * 0.1),
        num_training_steps=total_steps
    )

    scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())

    print(f"[SkillExtractor] Starting training for {epochs} epochs (Batch size: {batch_size}, Steps: {total_steps})...")

    best_acc = 0.0

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()

            with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                loss = outputs.loss

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()

            total_loss += loss.item()

            if (step + 1) % 25 == 0 or (step + 1) == len(train_loader):
                print(f"  Epoch {epoch}/{epochs} | Step {step+1}/{len(train_loader)} | Loss: {loss.item():.4f}")

        avg_train_loss = total_loss / len(train_loader)

        # Validation
        model.eval()
        val_preds = []
        val_labels = []
        val_loss = 0.0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["labels"].to(device)

                with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                    outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
                    val_loss += outputs.loss.item()
                    logits = outputs.logits

                preds = torch.argmax(logits, dim=-1).cpu().numpy()
                val_preds.extend(preds)
                val_labels.extend(labels.cpu().numpy())

        metrics = compute_metrics(val_preds, val_labels)
        print(f"[Epoch {epoch} Results] Train Loss: {avg_train_loss:.4f} | Val Loss: {val_loss/len(val_loader):.4f} | Token Acc: {metrics['token_accuracy']:.4f}")

        if metrics["token_accuracy"] > best_acc:
            best_acc = metrics["token_accuracy"]
            print(f"  * New best accuracy: {best_acc:.4f} -> Saving checkpoint to {OUTPUT_DIR}")
            model.save_pretrained(OUTPUT_DIR)
            tokenizer.save_pretrained(OUTPUT_DIR)

    # Export to ONNX
    print("[SkillExtractor] Exporting to ONNX format for high-speed inference...")
    onnx_path = ONNX_DIR / "skillextractor_ner.onnx"
    dummy_input_ids = torch.ones((1, 128), dtype=torch.long, device=device)
    dummy_mask = torch.ones((1, 128), dtype=torch.long, device=device)

    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_mask),
        str(onnx_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "seq_len"},
            "attention_mask": {0: "batch_size", 1: "seq_len"},
            "logits": {0: "batch_size", 1: "seq_len"}
        },
        opset_version=14
    )
    print(f"[SkillExtractor] Model exported successfully to: {onnx_path}")

    # Save metadata
    with open(OUTPUT_DIR / "labels.json", "w", encoding="utf-8") as f:
        json.dump({"label_list": LABEL_LIST, "id2label": ID2LABEL, "label2id": LABEL2ID}, f, indent=2)

    print("[SkillExtractor] Training and ONNX export complete!")


if __name__ == "__main__":
    train()

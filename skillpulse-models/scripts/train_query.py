"""
SkillPulse - Model 3: QueryParser (Joint Intent Classification + Slot Filling)
DistilBERT multi-head architecture for parsing natural language search and talent queries.
Head 1: Intent Classification (6 classes)
Head 2: Token Slot Filling (BIO tags)
"""

import os
import json
import torch
import torch.nn as nn
import sys
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import DistilBertTokenizerFast, DistilBertModel, get_linear_schedule_with_warmup

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "checkpoints" / "queryparser_joint"
ONNX_DIR = BASE_DIR / "onnx"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ONNX_DIR.mkdir(parents=True, exist_ok=True)

INTENTS = [
    "FIND_STUDENTS", "FIND_TEAMS", "SKILL_GAP_ANALYSIS",
    "VERIFY_EVIDENCE", "LEADERBOARD", "EXPORT_REPORT"
]
INTENT2ID = {name: i for i, name in enumerate(INTENTS)}
ID2INTENT = {i: name for i, name in enumerate(INTENTS)}

SLOTS = [
    "O",
    "B-SKILL", "I-SKILL",
    "B-PROFICIENCY", "I-PROFICIENCY",
    "B-COLLEGE", "I-COLLEGE",
    "B-DEPT", "I-DEPT",
    "B-YEAR", "I-YEAR",
    "B-MIN_VERIFIED", "I-MIN_VERIFIED"
]
SLOT2ID = {name: i for i, name in enumerate(SLOTS)}
ID2SLOT = {i: name for i, name in enumerate(SLOTS)}


class JointDistilBert(nn.Module):
    def __init__(self, num_intents, num_slots):
        super().__init__()
        self.distilbert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        hidden_size = self.distilbert.config.hidden_size
        self.dropout = nn.Dropout(0.2)
        self.intent_classifier = nn.Linear(hidden_size, num_intents)
        self.slot_classifier = nn.Linear(hidden_size, num_slots)

    def forward(self, input_ids, attention_mask):
        outputs = self.distilbert(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state  # [batch_size, seq_len, hidden_size]
        cls_output = sequence_output[:, 0, :]        # [batch_size, hidden_size]

        sequence_output = self.dropout(sequence_output)
        cls_output = self.dropout(cls_output)

        intent_logits = self.intent_classifier(cls_output)
        slot_logits = self.slot_classifier(sequence_output)

        return intent_logits, slot_logits


class QueryDataset(Dataset):
    def __init__(self, data_path, tokenizer, max_length=64):
        with open(data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        tokens = item["tokens"]
        slots = item["slots"]
        intent = item["intent"]

        encoding = self.tokenizer(
            tokens,
            is_split_into_words=True,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )

        word_ids = encoding.word_ids(batch_index=0)
        labels = []
        prev_w = None
        for w in word_ids:
            if w is None:
                labels.append(-100)
            elif w != prev_w:
                s = slots[w] if w < len(slots) else "O"
                labels.append(SLOT2ID.get(s, 0))
            else:
                s = slots[w] if w < len(slots) else "O"
                slot_id = SLOT2ID.get(s, 0)
                if s.startswith("B-"):
                    slot_id = SLOT2ID.get("I-" + s[2:], slot_id)
                labels.append(slot_id)
            prev_w = w

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "intent_label": torch.tensor(INTENT2ID[intent], dtype=torch.long),
            "slot_labels": torch.tensor(labels, dtype=torch.long)
        }


def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[QueryParser] Training on device: {device}")

    tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")
    model = JointDistilBert(num_intents=len(INTENTS), num_slots=len(SLOTS)).to(device)

    train_dataset = QueryDataset(DATA_DIR / "query_train.json", tokenizer)
    val_dataset = QueryDataset(DATA_DIR / "query_val.json", tokenizer)

    batch_size = 16 if torch.cuda.is_available() else 8
    epochs = 6
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

    intent_loss_fn = nn.CrossEntropyLoss()
    slot_loss_fn = nn.CrossEntropyLoss(ignore_index=-100)

    print(f"[QueryParser] Starting joint training for {epochs} epochs...")

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            mask = batch["attention_mask"].to(device)
            intent_targets = batch["intent_label"].to(device)
            slot_targets = batch["slot_labels"].to(device)

            optimizer.zero_grad()
            intent_logits, slot_logits = model(input_ids, mask)

            loss_intent = intent_loss_fn(intent_logits, intent_targets)
            loss_slot = slot_loss_fn(slot_logits.view(-1, len(SLOTS)), slot_targets.view(-1))
            loss = loss_intent + 1.5 * loss_slot

            loss.backward()
            optimizer.step()
            scheduler.step()

            total_loss += loss.item()

            if (step + 1) % 25 == 0 or (step + 1) == len(train_loader):
                print(f"  Epoch {epoch}/{epochs} | Step {step+1}/{len(train_loader)} | Total Loss: {loss.item():.4f} (Intent: {loss_intent.item():.3f}, Slot: {loss_slot.item():.3f})")

        # Validation
        model.eval()
        val_intent_correct = 0
        val_slot_correct = 0
        val_slot_total = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                mask = batch["attention_mask"].to(device)
                intent_targets = batch["intent_label"].to(device)
                slot_targets = batch["slot_labels"].to(device)

                intent_logits, slot_logits = model(input_ids, mask)

                val_intent_correct += (torch.argmax(intent_logits, dim=-1) == intent_targets).sum().item()

                slot_preds = torch.argmax(slot_logits, dim=-1)
                active_mask = slot_targets != -100
                val_slot_correct += ((slot_preds == slot_targets) & active_mask).sum().item()
                val_slot_total += active_mask.sum().item()

        intent_acc = val_intent_correct / len(val_dataset)
        slot_acc = val_slot_correct / max(val_slot_total, 1)

        print(f"[Epoch {epoch} Results] Intent Acc: {intent_acc*100:.2f}% | Slot Acc: {slot_acc*100:.2f}%")

    print(f"[QueryParser] Saving model to {OUTPUT_DIR}...")
    torch.save(model.state_dict(), OUTPUT_DIR / "pytorch_model.bin")
    tokenizer.save_pretrained(OUTPUT_DIR)

    with open(OUTPUT_DIR / "intent_slot_metadata.json", "w", encoding="utf-8") as f:
        json.dump({
            "intents": INTENTS,
            "intent2id": INTENT2ID,
            "id2intent": ID2INTENT,
            "slots": SLOTS,
            "slot2id": SLOT2ID,
            "id2slot": ID2SLOT
        }, f, indent=2)

    # Export to ONNX
    print("[QueryParser] Exporting to ONNX format...")
    onnx_path = ONNX_DIR / "queryparser_joint.onnx"
    dummy_input_ids = torch.ones((1, 64), dtype=torch.long, device=device)
    dummy_mask = torch.ones((1, 64), dtype=torch.long, device=device)

    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_mask),
        str(onnx_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["intent_logits", "slot_logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "seq_len"},
            "attention_mask": {0: "batch_size", 1: "seq_len"},
            "intent_logits": {0: "batch_size"},
            "slot_logits": {0: "batch_size", 1: "seq_len"}
        },
        opset_version=14
    )
    print(f"[QueryParser] Model exported successfully to: {onnx_path}")
    print("[QueryParser] Completed successfully!")


if __name__ == "__main__":
    train()

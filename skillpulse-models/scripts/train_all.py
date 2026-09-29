"""
SkillPulse - Master Model Training Pipeline
Orchestrates end-to-end training of all 3 custom models on NVIDIA GTX 1650:
1. SkillExtractor NER (DistilBERT)
2. SkillMapper Embedder (all-MiniLM-L6-v2)
3. QueryParser Intent+Slot (DistilBERT Joint)
Exports all 3 models to ONNX for CPU inference serving.
"""

import time
import sys
import json
from pathlib import Path

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
sys.path.append(str(SCRIPTS_DIR))

import train_ner
import train_mapper
import train_query

def main():
    print("=" * 70)
    print("       SKILLPULSE CUSTOM AI MODEL TRAINING PIPELINE")
    print("=" * 70)
    start_total = time.time()
    
    # Check GPU
    import torch
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU Device: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB")
    print("-" * 70)

    # 1. SkillExtractor NER
    print("\n>>> [1/3] Training SkillExtractor (DistilBERT Token Classifier)...")
    t0 = time.time()
    try:
        train_ner.train()
        print(f">>> [1/3] SkillExtractor complete in {time.time() - t0:.1f}s")
    except Exception as e:
        print(f"ERROR in SkillExtractor training: {e}")
        import traceback
        traceback.print_exc()

    # 2. SkillMapper Contrastive
    print("\n>>> [2/3] Training SkillMapper (MiniLM-L6 Contrastive Embedder)...")
    t0 = time.time()
    try:
        train_mapper.train()
        print(f">>> [2/3] SkillMapper complete in {time.time() - t0:.1f}s")
    except Exception as e:
        print(f"ERROR in SkillMapper training: {e}")
        import traceback
        traceback.print_exc()

    # 3. QueryParser Joint
    print("\n>>> [3/3] Training QueryParser (DistilBERT Intent + Slot)...")
    t0 = time.time()
    try:
        train_query.train()
        print(f">>> [3/3] QueryParser complete in {time.time() - t0:.1f}s")
    except Exception as e:
        print(f"ERROR in QueryParser training: {e}")
        import traceback
        traceback.print_exc()

    total_time = time.time() - start_total
    print("\n" + "=" * 70)
    print(f"  ALL MODELS SUCCESSFULLY TRAINED & EXPORTED TO ONNX in {total_time/60:.2f} minutes!")
    print("=" * 70)

    # Write training status report
    status = {
        "status": "COMPLETED",
        "total_time_seconds": total_time,
        "models": {
            "skillextractor_ner": "checkpoints/skillextractor_ner",
            "skillmapper_minilm": "checkpoints/skillmapper_minilm",
            "queryparser_joint": "checkpoints/queryparser_joint"
        },
        "onnx_models": [
            "onnx/skillextractor_ner.onnx",
            "onnx/skillmapper_minilm.onnx",
            "onnx/queryparser_joint.onnx"
        ]
    }
    with open(BASE_DIR / "training_status.json", "w", encoding="utf-8") as f:
        json.dump(status, f, indent=2)

if __name__ == "__main__":
    main()

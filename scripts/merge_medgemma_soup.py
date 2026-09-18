"""
Model Soup Weight-Averaging Tool for MedGemma LoRA Checkpoints.
Usage in terminal:
    python scripts/merge_medgemma_soup.py --checkpoints checkpoints/medgemma_run1 checkpoints/medgemma_run2 --output_dir models/medgemma_soup
"""

import os
import sys
import argparse
import torch
from peft import PeftModel, LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

def parse_args():
    parser = argparse.ArgumentParser(description="Average multiple fine-tuned LoRA checkpoints into a Model Soup.")
    parser.add_argument("--base_model", type=str, default="google/gemma-2-2b-it", help="Base model identifier")
    parser.add_argument("--checkpoints", nargs="+", required=True, help="List of checkpoint directories to soup together")
    parser.add_argument("--output_dir", type=str, default="models/medgemma_soup", help="Destination folder for the souped adapter")
    parser.add_argument("--merge_base", action="store_true", help="Merge LoRA weights directly into the full 16-bit base model")
    return parser.parse_args()

def main():
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    print(f"\n=======================================================")
    print(f"        MEDGEMMA UNIFORM MODEL SOUP MERGER             ")
    print(f"=======================================================")
    print(f"Base Model:  {args.base_model}")
    print(f"Checkpoints ({len(args.checkpoints)}):")
    for i, c in enumerate(args.checkpoints, 1):
        print(f"  [{i}] {c}")
    print(f"Target Dir:  {args.output_dir}\n")

    for c in args.checkpoints:
        if not os.path.exists(c):
            print(f"Error: Checkpoint directory not found: {c}")
            sys.exit(1)

    # 1. Load Base Model Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)

    # 2. Extract and average weights across all checkpoints
    print("[1/3] Loading and computing uniform weight average across checkpoints...")
    k = len(args.checkpoints)
    
    # Load first checkpoint
    first_ckpt = args.checkpoints[0]
    first_adapter_path = os.path.join(first_ckpt, "adapter_model.bin")
    if not os.path.exists(first_adapter_path):
        first_adapter_path = os.path.join(first_ckpt, "adapter_model.safetensors")

    is_safetensors = first_adapter_path.endswith(".safetensors")
    if is_safetensors:
        from safetensors.torch import load_file
        soup_weights = {key: val.clone().float() for key, val in load_file(first_adapter_path).items()}
    else:
        soup_weights = {key: val.clone().float() for key, val in torch.load(first_adapter_path, map_location="cpu").items()}

    # Add remaining checkpoints
    for c in args.checkpoints[1:]:
        print(f"  + Adding weights from {c}...")
        c_path = os.path.join(c, "adapter_model.safetensors") if is_safetensors else os.path.join(c, "adapter_model.bin")
        if not os.path.exists(c_path):
            c_path = os.path.join(c, "adapter_model.bin")
            
        if c_path.endswith(".safetensors"):
            from safetensors.torch import load_file
            c_weights = load_file(c_path)
        else:
            c_weights = torch.load(c_path, map_location="cpu")

        for key in soup_weights:
            if key in c_weights:
                soup_weights[key] += c_weights[key].float()
            else:
                print(f"Warning: Key {key} not found in {c}. Skipping.")

    # Divide by k (Uniform Soup Formula: W_soup = (W_1 + W_2 + ... + W_k) / k)
    print(f"[2/3] Applying Model Soup formula: W_soup = sum(W_i) / {k}...")
    for key in soup_weights:
        soup_weights[key] = (soup_weights[key] / k).to(torch.bfloat16)

    # 3. Save the Souped Adapter
    print(f"[3/3] Saving souped adapter to {args.output_dir}...")
    if is_safetensors:
        from safetensors.torch import save_file
        save_file(soup_weights, os.path.join(args.output_dir, "adapter_model.safetensors"))
    else:
        torch.save(soup_weights, os.path.join(args.output_dir, "adapter_model.bin"))

    # Copy adapter config & tokenizer
    import shutil
    shutil.copyfile(os.path.join(first_ckpt, "adapter_config.json"), os.path.join(args.output_dir, "adapter_config.json"))
    tokenizer.save_pretrained(args.output_dir)

    print("\n Model Soup creation complete!")
    print(f"Souped adapter saved at: {args.output_dir}\n")

if __name__ == "__main__":
    main()

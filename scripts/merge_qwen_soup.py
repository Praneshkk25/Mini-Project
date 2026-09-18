"""
Model Soup Weight-Averaging Tool for Qwen 2.5 LoRA Checkpoints.
Averages weights across multiple fine-tuned candidate checkpoints:
    W_soup = (W_1 + W_2 + ... + W_k) / k

Usage in terminal:
    python scripts/merge_qwen_soup.py --checkpoints checkpoints/qwen_triage checkpoints/qwen_discharge checkpoints/qwen_telemetry --output_dir models/qwen-triage-adapter
"""

import os
import sys
import shutil
import argparse
import torch
from transformers import AutoTokenizer

def parse_args():
    parser = argparse.ArgumentParser(description="Average multiple fine-tuned Qwen 2.5 LoRA checkpoints into a Model Soup.")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-1.5B-Instruct", help="Base model identifier")
    parser.add_argument("--checkpoints", nargs="+", required=True, help="List of checkpoint directories to soup together")
    parser.add_argument("--output_dir", type=str, default="models/qwen-triage-adapter", help="Destination folder for the souped adapter")
    parser.add_argument("--merge_base", action="store_true", help="Merge souped LoRA weights directly into the full base model for GGUF/Ollama export")
    parser.add_argument("--merged_model_dir", type=str, default="models/qwen_soup_merged_base", help="Destination if --merge_base is selected")
    return parser.parse_args()


def load_adapter_weights(checkpoint_dir: str):
    """Load adapter weights from either .safetensors or .bin."""
    safetensors_path = os.path.join(checkpoint_dir, "adapter_model.safetensors")
    bin_path = os.path.join(checkpoint_dir, "adapter_model.bin")

    if os.path.exists(safetensors_path):
        from safetensors.torch import load_file
        return {k: v.clone().float() for k, v in load_file(safetensors_path).items()}, True
    elif os.path.exists(bin_path):
        return {k: v.clone().float() for k, v in torch.load(bin_path, map_location="cpu").items()}, False
    else:
        raise FileNotFoundError(f"Neither adapter_model.safetensors nor adapter_model.bin found in {checkpoint_dir}")


def main():
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    print("================================================================")
    print("         QWEN 2.5 UNIFORM MODEL SOUP WEIGHT AVERAGING           ")
    print("================================================================")
    print(f"Base Model:         {args.base_model}")
    print(f"Candidate Models ({len(args.checkpoints)}):")
    for i, ckpt in enumerate(args.checkpoints, 1):
        print(f"  [{i}] {ckpt}")
    print(f"Target Output Dir:  {args.output_dir}\n")

    for ckpt in args.checkpoints:
        if not os.path.exists(ckpt):
            print(f"Error: Candidate checkpoint not found: {ckpt}")
            sys.exit(1)

    # 1. Load Base Tokenizer
    print("[1/4] Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)

    # 2. Extract and Average Weights
    k = len(args.checkpoints)
    print(f"[2/4] Computing Model Soup average across {k} checkpoints...")
    
    first_ckpt = args.checkpoints[0]
    soup_weights, is_safetensors = load_adapter_weights(first_ckpt)
    print(f"      Initialized soup base from: {first_ckpt} ({len(soup_weights)} tensors)")

    for c in args.checkpoints[1:]:
        print(f"      + Adding candidate weights from {c}...")
        c_weights, _ = load_adapter_weights(c)
        for key in soup_weights:
            if key in c_weights:
                soup_weights[key] += c_weights[key]
            else:
                print(f"      Warning: Key '{key}' missing in {c}. Skipping.")

    # Divide by k
    print(f"[3/4] Applying uniform average: W_soup = sum(W_i) / {k}...")
    for key in soup_weights:
        soup_weights[key] = (soup_weights[key] / k).to(torch.bfloat16)

    # 3. Save Souped Adapter
    print(f"[4/4] Writing souped adapter to {args.output_dir}...")
    if is_safetensors:
        from safetensors.torch import save_file
        save_file(soup_weights, os.path.join(args.output_dir, "adapter_model.safetensors"))
    else:
        torch.save(soup_weights, os.path.join(args.output_dir, "adapter_model.bin"))

    # Copy adapter configuration and save tokenizer
    shutil.copyfile(
        os.path.join(first_ckpt, "adapter_config.json"),
        os.path.join(args.output_dir, "adapter_config.json")
    )
    tokenizer.save_pretrained(args.output_dir)

    print("\n Model Soup successfully synthesized!")
    print(f"Souped adapter saved at: {args.output_dir}")

    # Optional base model full merge
    if args.merge_base:
        print("\nMerging souped adapter directly into 16-bit base model...")
        from transformers import AutoModelForCausalLM
        from peft import PeftModel

        base_model = AutoModelForCausalLM.from_pretrained(
            args.base_model,
            torch_dtype=torch.float16,
            device_map="cpu",
            trust_remote_code=True
        )
        peft_model = PeftModel.from_pretrained(base_model, args.output_dir)
        merged_model = peft_model.merge_and_unload()
        
        os.makedirs(args.merged_model_dir, exist_ok=True)
        merged_model.save_pretrained(args.merged_model_dir)
        tokenizer.save_pretrained(args.merged_model_dir)
        print(f" Fully merged 16-bit model saved to: {args.merged_model_dir}")


if __name__ == "__main__":
    main()

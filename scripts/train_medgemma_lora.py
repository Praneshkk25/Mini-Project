"""
Fine-tune MedGemma / Gemma with LoRA on AuraHealth Clinical Soup Dataset.
Usage in terminal:
    python scripts/train_medgemma_lora.py --run_name run1 --lr 2e-4 --epochs 3 --lora_r 16
"""

import os
import sys
import json
import argparse
import torch
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer

def parse_args():
    parser = argparse.ArgumentParser(description="LoRA Fine-tuning for MedGemma")
    parser.add_argument("--base_model", type=str, default="google/gemma-2-2b-it", help="Base model identifier")
    parser.add_argument("--data_path", type=str, default="data/medgemma_soup_training_dataset.json", help="Path to training JSON")
    parser.add_argument("--run_name", type=str, default="run1", help="Name of this run (e.g., run1, run2, run3)")
    parser.add_argument("--output_dir", type=str, default="checkpoints", help="Directory to save checkpoints")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per device train batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lora_r", type=int, default=16, help="LoRA rank")
    parser.add_argument("--lora_alpha", type=int, default=32, help="LoRA alpha")
    parser.add_argument("--max_samples", type=int, default=None, help="Optional limit on samples for fast test runs")
    return parser.parse_args()

def format_prompt(sample):
    instruction = sample.get("instruction", "")
    input_text = sample.get("input", "")
    output_text = sample.get("output", "")
    
    if input_text:
        prompt = f"<bos><start_of_turn>user\n{instruction}\n\nClinical Case Context:\n{input_text}<end_of_turn>\n<start_of_turn>model\n{output_text}<end_of_turn>"
    else:
        prompt = f"<bos><start_of_turn>user\n{instruction}<end_of_turn>\n<start_of_turn>model\n{output_text}<end_of_turn>"
    return {"text": prompt}

def main():
    args = parse_args()
    save_path = os.path.join(args.output_dir, f"medgemma_{args.run_name}")
    os.makedirs(save_path, exist_ok=True)
    
    print(f"=== Starting LoRA Training Run: {args.run_name} ===")
    print(f"Base Model:    {args.base_model}")
    print(f"Dataset:       {args.data_path}")
    print(f"Learning Rate: {args.lr}")
    print(f"LoRA Rank (r): {args.lora_r}")
    print(f"Epochs:        {args.epochs}")
    print(f"Output Target: {save_path}\n")

    # 1. Load Dataset
    if not os.path.exists(args.data_path):
        print(f"Error: Dataset file not found at {args.data_path}")
        sys.exit(1)

    with open(args.data_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    if args.max_samples:
        raw_data = raw_data[:args.max_samples]

    dataset = Dataset.from_list(raw_data)
    dataset = dataset.map(format_prompt)
    print(f"Loaded {len(dataset)} training examples.")

    # 2. Tokenizer & Base Model
    print("Loading base tokenizer and model weights...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else "cpu",
        trust_remote_code=True
    )

    # 3. LoRA Configuration
    lora_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 4. Training Arguments
    training_args = TrainingArguments(
        output_dir=save_path,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        warmup_ratio=0.05,
        num_train_epochs=args.epochs,
        learning_rate=args.lr,
        fp16=torch.cuda.is_available() and not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_available() and torch.cuda.is_bf16_supported(),
        logging_steps=25,
        save_strategy="epoch",
        optim="adamw_torch",
        report_to="none"
    )

    # 5. Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_args
    )

    print("\nStarting training loop...")
    trainer.train()

    print(f"\nSaving fine-tuned adapter to {save_path}...")
    model.save_pretrained(save_path)
    tokenizer.save_pretrained(save_path)
    print(f" Run {args.run_name} completed successfully!\n")

if __name__ == "__main__":
    main()

import os
import sys
import json
import argparse
import torch
from torch.utils.data import Dataset as TorchDataset

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune Qwen 2.5 LoRA candidate for Model Souping")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-1.5B-Instruct", help="Base model identifier")
    parser.add_argument("--dataset", type=str, default="data/qwen_soup_triage.jsonl", help="Path to training dataset (.jsonl or .json)")
    parser.add_argument("--run_name", type=str, default="triage", help="Run identifier (e.g. triage, discharge, telemetry, run1)")
    parser.add_argument("--output_dir", type=str, default="checkpoints", help="Root directory for checkpoints")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=1, help="Per device train batch size")
    parser.add_argument("--grad_accum", type=int, default=8, help="Gradient accumulation steps")
    parser.add_argument("--lora_r", type=int, default=16, help="LoRA rank")
    parser.add_argument("--lora_alpha", type=int, default=32, help="LoRA alpha scaling factor")
    parser.add_argument("--max_length", type=int, default=1024, help="Maximum sequence token length")
    parser.add_argument("--max_samples", type=int, default=None, help="Optional sample limit for rapid validation")
    parser.add_argument("--no_quant", action="store_true", help="Disable 4-bit quantization (requires >12GB VRAM)")
    return parser.parse_args()


class ClinicalDataset(TorchDataset):
    """Pure PyTorch Dataset that requires zero pyarrow DLLs."""
    def __init__(self, texts, tokenizer, max_length=1024):
        self.examples = []
        for t in texts:
            enc = tokenizer(
                t,
                truncation=True,
                max_length=max_length,
                padding="max_length",
                return_tensors="pt"
            )
            input_ids = enc["input_ids"].squeeze(0)
            attention_mask = enc["attention_mask"].squeeze(0)
            labels = input_ids.clone()
            labels[labels == tokenizer.pad_token_id] = -100
            self.examples.append({
                "input_ids": input_ids,
                "attention_mask": attention_mask,
                "labels": labels
            })

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        return self.examples[idx]


def load_raw_dataset(file_path: str, max_samples: int = None):
    """Load JSON or JSONL dataset into list of raw examples."""
    records = []
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found at: {file_path}")

    if file_path.endswith(".jsonl"):
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
                    if max_samples and len(records) >= max_samples:
                        break
    else:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                records = data[:max_samples] if max_samples else data
            else:
                records = [data]
    return records


def main():
    args = parse_args()
    save_path = os.path.join(args.output_dir, f"qwen_{args.run_name}")
    os.makedirs(save_path, exist_ok=True)

    print("================================================================")
    print(f"       QWEN 2.5 MODEL SOUP CANDIDATE RUN: [{args.run_name.upper()}]")
    print("================================================================")
    print(f"Base Model:      {args.base_model}")
    print(f"Dataset:         {args.dataset}")
    print(f"Learning Rate:   {args.lr}")
    print(f"LoRA Rank (r):   {args.lora_r} | Alpha: {args.lora_alpha}")
    print(f"Batch Size:      {args.batch_size} (Grad Accum: {args.grad_accum})")
    print(f"Epochs:          {args.epochs}")
    print(f"Save Path:       {save_path}\n")

    from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments
    from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training

    # 1. Load Tokenizer
    print("[1/5] Loading Qwen tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.base_model, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 2. Ingest and Format Dataset
    print(f"[2/5] Ingesting and formatting {args.dataset}...")
    raw_records = load_raw_dataset(args.dataset, args.max_samples)

    formatted_texts = []
    for rec in raw_records:
        if "messages" in rec:
            chat_text = tokenizer.apply_chat_template(rec["messages"], tokenize=False, add_generation_prompt=False)
            formatted_texts.append(chat_text)
        elif "instruction" in rec:
            inst = rec.get("instruction", "")
            inp = rec.get("input", "")
            out = rec.get("output", "")
            user_turn = f"{inst}\n\nContext:\n{inp}" if inp else inst
            messages = [
                {"role": "system", "content": "You are Qwen Clinical Assistant, an expert medical AI model."},
                {"role": "user", "content": user_turn},
                {"role": "assistant", "content": out}
            ]
            chat_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)
            formatted_texts.append(chat_text)

    # Use pure PyTorch dataset (no pyarrow DLL dependency)
    print("      -> Building native PyTorch tensor dataset (bypassing pyarrow)...")
    train_dataset = ClinicalDataset(formatted_texts, tokenizer, max_length=args.max_length)
    print(f"      -> Ready with {len(train_dataset):,} formatted training examples.")

    # 3. Load Model with Memory-Optimized Quantization
    print(f"[3/5] Initializing base model {args.base_model}...")
    device_map = "auto" if torch.cuda.is_available() else "cpu"
    
    quantization_config = None
    if torch.cuda.is_available() and not args.no_quant:
        try:
            from transformers import BitsAndBytesConfig
            print("      -> Applying 4-bit NF4 Quantization (BitsAndBytes)...")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
            )
        except Exception as e:
            print(f"      -> BitsAndBytes warning: {e}. Falling back to float16.")

    model = AutoModelForCausalLM.from_pretrained(
        args.base_model,
        quantization_config=quantization_config,
        device_map=device_map,
        torch_dtype=torch.bfloat16 if (torch.cuda.is_available() and torch.cuda.is_bf16_supported()) else torch.float16,
        trust_remote_code=True
    )
    model.config.use_cache = False

    if quantization_config is not None:
        model = prepare_model_for_kbit_training(model)

    # 4. Attach LoRA Adapter
    print("[4/5] Configuring PEFT LoRA adapter...")
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

    # 5. Execute Training
    print(f"[5/5] Launching training loop for {args.epochs} epochs...")
    is_bf16 = torch.cuda.is_available() and torch.cuda.is_bf16_supported()
    is_fp16 = torch.cuda.is_available() and not is_bf16

    training_args = TrainingArguments(
        output_dir=save_path,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        warmup_ratio=0.05,
        learning_rate=args.lr,
        logging_steps=10,
        save_strategy="epoch",
        bf16=is_bf16,
        fp16=is_fp16,
        optim="paged_adamw_8bit" if torch.cuda.is_available() else "adamw_torch",
        report_to="none"
    )

    trainer = Trainer(
        model=model,
        train_dataset=train_dataset,
        args=training_args
    )

    trainer.train()

    # Save final checkpoint
    print(f"\nTraining complete! Saving LoRA candidate weights to {save_path}...")
    model.save_pretrained(save_path)
    tokenizer.save_pretrained(save_path)
    print(f" Candidate [{args.run_name}] ready for Model Souping!\n")


if __name__ == "__main__":
    main()


import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    DataCollatorForSeq2Seq
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer, SFTConfig

def train():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    dataset_path = os.path.join(project_root, "data", "train_dataset.jsonl")
    output_dir = os.path.join(project_root, "models", "qwen-triage-adapter")
    
    # 1. Check if dataset exists, if not generate it
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating sample training data...")
        from generate_dataset import main as run_generator
        run_generator()
        
    print(f"Loading dataset from: {dataset_path}")
    dataset = load_dataset("json", data_files=dataset_path, split="train")

    # 2. Configure model path and quantization
    # We default to Qwen 2.5 7B/14B. Adjust based on VRAM size (7B is safer for single GPU training).
    model_id = "Qwen/Qwen2.5-1.5B-Instruct" 
    print(f"Loading base model: {model_id} with 4-bit quantization...")
    
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16
    )

    # Load tokenizer and base model
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )

    # Disable cache for training
    model.config.use_cache = False

    # Prepare model for PEFT training
    model = prepare_model_for_kbit_training(model)

    # 3. Setup LoRA configuration
    peft_config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    # 4. Formatter helper for Qwen messages structure
    def format_prompts(example):
        formatted = []
        for i in range(len(example['messages'])):
            dialog = example['messages'][i]
            # Convert dialogues list into a single instruction sequence
            chat = tokenizer.apply_chat_template(dialog, tokenize=False, add_generation_prompt=False)
            formatted.append(chat)
        return {"text": formatted}

    dataset = dataset.map(format_prompts, batched=True)

    # 5. Training Arguments (using SFTConfig for modern TRL compatibility)
    training_args = SFTConfig(
        output_dir=output_dir,
        dataset_text_field="text",
        max_length=512,
        num_train_epochs=3,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=4,
        optim="paged_adamw_32bit",
        save_steps=10,
        logging_steps=1,
        learning_rate=2e-4,
        weight_decay=0.001,
        bf16=True,
        max_grad_norm=0.3,
        warmup_steps=1,
        lr_scheduler_type="constant"
    )

    # 6. Initialize SFTTrainer (let SFTTrainer handle data collation for dataset_text_field)
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        processing_class=tokenizer,
        args=training_args
    )

    print("Starting fine-tuning process...")
    trainer.train()

    # 7. Save the LoRA Adapter model
    print(f"Fine-tuning complete! Saving adapter weights to: {output_dir}")
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("Fine-tuned model saved successfully!")

if __name__ == "__main__":
    train()

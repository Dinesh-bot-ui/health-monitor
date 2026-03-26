from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

LLM_MODELS = {}

def load_model(name, model_id):
    print(f"[*] Loading {name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float32,
        device_map=None
    )
    model.to("cpu")
    LLM_MODELS[name] = (tokenizer, model)
    print(f"[OK] {name} loaded on CPU")

def init_llms():
    load_model("phi-2", "microsoft/phi-2")
    # load_model("mistral", "mistralai/Mistral-7B-Instruct-v0.2")
    load_model("TinyLlama", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
    # load_model("llama", "meta-llama/Meta-Llama-3-8B-Instruct")
    # load_model("medical", "m42-health/med42-llama3-8b")

def get_model(name):
    return LLM_MODELS.get(name)
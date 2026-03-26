from models.load_llm import get_model

def generate_diet_plan(data):
    tokenizer, model = get_model("llama")

    prompt = f"""
    Create diet plan:
    {data}
    """

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=200)

    return tokenizer.decode(outputs[0], skip_special_tokens=True)
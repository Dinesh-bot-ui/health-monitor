from models.load_llm import get_model

def medical_validation(data):
    tokenizer, model = get_model("medical")

    prompt = f"""
    Validate medical risk:
    {data}
    """

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=100)

    return tokenizer.decode(outputs[0], skip_special_tokens=True)
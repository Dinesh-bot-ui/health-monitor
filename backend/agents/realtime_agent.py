from models.load_llm import get_model

def realtime_analysis(data):
    tokenizer, model = get_model("phi-2")

    prompt = f"""
    You are a health assistant.

    Vitals:
    Heart Rate: {data['hr']}
    SpO2: {data['spo2']}
    BP: {data['bpS']}/{data['bpD']}
    HRV: {data['hrv']}

    Give 3 short actionable recommendations.
    """

    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=80)

    text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return text.split("\n")
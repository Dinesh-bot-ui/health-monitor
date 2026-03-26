def calculate_health_score(data):
    score = 100

    # Heart Rate
    if data["heart_rate"] < 60 or data["heart_rate"] > 100:
        score -= 15

    # BP
    if data["systolic_bp"] > 130 or data["diastolic_bp"] > 85:
        score -= 15

    # SpO2
    if data["spo2"] < 95:
        score -= 20

    # Temperature
    if data["temperature"] > 37.5:
        score -= 10

    # Final status
    if score >= 80:
        status = "Good"
    elif score >= 50:
        status = "Moderate"
    else:
        status = "Risk"

    return score, status
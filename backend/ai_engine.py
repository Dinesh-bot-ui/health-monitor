def predict_risk(data):
    risk_score = 0

    # Heart Rate
    if data["heart_rate"] > 100:
        risk_score += 2

    # BP
    if data["systolic_bp"] > 140:
        risk_score += 3

    # SpO2
    if data["spo2"] < 94:
        risk_score += 3

    # Temperature
    if data["temperature"] > 38:
        risk_score += 2

    # Final prediction
    if risk_score >= 6:
        return "HIGH RISK"
    elif risk_score >= 3:
        return "MODERATE RISK"
    else:
        return "LOW RISK"
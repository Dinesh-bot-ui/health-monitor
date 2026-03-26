def evaluate_rules(data):
    alerts = []

    hr = data.get("hr")
    spo2 = data.get("spo2")
    temp = data.get("temp")

    if hr and hr > 110:
        alerts.append("⚠️ High Heart Rate")

    if hr and hr < 50:
        alerts.append("⚠️ Low Heart Rate")

    if spo2 and spo2 < 92:
        alerts.append("🚨 Low Oxygen Level")

    if temp and temp > 38:
        alerts.append("🌡️ High Temperature")

    return alerts
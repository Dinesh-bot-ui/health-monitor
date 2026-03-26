import random

def generate_vital_data():
    return {
        "heart_rate": random.randint(55, 120),
        "systolic_bp": random.randint(100, 150),
        "diastolic_bp": random.randint(60, 100),
        "spo2": round(random.uniform(90, 100), 1),
        "temperature": round(random.uniform(36.0, 38.5), 1)
    }


def generate_activity():
    return {
        "steps": random.randint(1000, 12000),
        "screen_time": round(random.uniform(2, 10), 1),
        "calories": random.randint(1500, 3500)
    }
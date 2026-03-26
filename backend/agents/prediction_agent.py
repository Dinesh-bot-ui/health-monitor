from models.load_ml import get_ml_model
import numpy as np

def predict_future(data):
    model = get_ml_model("prediction")

    hr = data.get("hr", 70)

    prediction = model.predict(np.array([[hr]]))[0]

    return {
        "predicted_hr": float(prediction)
    }
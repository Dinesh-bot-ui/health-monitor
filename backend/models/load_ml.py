import numpy as np
from sklearn.linear_model import LinearRegression

ML_MODELS = {}

def load_prediction_model():
    model = LinearRegression()
    ML_MODELS["prediction"] = model

def train_dummy():
    X = np.array([[1], [2], [3], [4]])
    y = np.array([70, 75, 80, 85])
    ML_MODELS["prediction"].fit(X, y)

def init_ml():
    load_prediction_model()
    train_dummy()

def get_ml_model(name):
    return ML_MODELS.get(name)
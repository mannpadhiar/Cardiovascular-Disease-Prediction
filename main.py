from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

class InputData(BaseModel):
    features: list[float]

@app.post("/predict")
def predict(data: InputData):
    columns = ['age', 'gender', 'ap_hi', 'ap_lo', 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'BMI', 'pulse_pressure']
    X = pd.DataFrame([data.features], columns=columns)
    # X[0][2] = convert_num_to_cat_ap_hi(X[0][2])
    # X[0][3] = convert_num_to_cat_ap_lo(X[0][3])
    pred = model.predict(X)
    return {"prediction": float(pred[0])}

@app.get("/")
def home():
    return {"status": "FastAPI is live on Render!"}

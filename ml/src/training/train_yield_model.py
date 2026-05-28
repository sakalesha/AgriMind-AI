import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

def train_model():
    print("🚜 Starting Yield Model Retraining (Grounded-Synthetic)...")
    
    # 1. Load Real-World Grounded Data
    data_path = "ml/data/real_world_yield_data.csv"
    if not os.path.exists(data_path):
        print(f"❌ Error: Real-world training data not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    print(f"✅ Loaded {len(df)} training samples.")

    # 2. Preprocessing
    le = LabelEncoder()
    df['crop_encoded'] = le.fit_transform(df['crop'])
    
    # Feature columns (must match API exact order)
    # [crop_encoded, N, P, K, temp, humidity, ph, rainfall]
    X = df[['crop_encoded', 'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['yield']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    # 3. Model Training
    print("⏳ Fitting Random Forest Regressor (Ensemble of 100 trees)...")
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"✅ Training Complete. Test R² Score: {score:.4f}")

    # 4. Export
    os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)
    joblib.dump(model, os.path.join(BASE_DIR, 'models', 'yield_model.pkl'))
    joblib.dump(le, os.path.join(BASE_DIR, 'models', 'yield_label_encoder.pkl'))
    print("✅ Exported: yield_model.pkl, yield_label_encoder.pkl")

if __name__ == "__main__":
    train_model()

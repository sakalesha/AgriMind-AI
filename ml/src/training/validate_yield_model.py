import os
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'yield_model.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, '..', 'models', 'yield_label_encoder.pkl')
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'real_world_validation.csv')

def run_validation():
    print("🚀 Starting Yield Model Stress Test...")
    
    # 1. Load Data
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: Validation data not found at {DATA_PATH}")
        return
    
    df = pd.read_csv(DATA_PATH)
    actual_yields = df['actual_yield'].values
    
    # 2. Load Models
    try:
        model = joblib.load(MODEL_PATH)
        le = joblib.load(ENCODER_PATH)
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return

    # 3. Preparation
    predictions = []
    
    # Encode crop names
    try:
        df['crop_encoded'] = le.transform(df['crop'].str.capitalize())
    except Exception as e:
        print(f"⚠️ Warning: Some crops were not found in the encoder: {e}")
        # Only keep crops that are in the encoder
        known_crops = set(le.classes_)
        df = df[df['crop'].str.capitalize().isin(known_crops)].copy()
        df['crop_encoded'] = le.transform(df['crop'].str.capitalize())
        actual_yields = df['actual_yield'].values
        print(f"✅ Filtered to {len(df)} known crops.")

    # 4. Inferences
    # Training layout: [crop_encoded, N, P, K, temp, humidity, ph, rainfall]
    features = df[['crop_encoded', 'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']].values
    
    preds = model.predict(features)
    
    # 5. Metrics
    mae = mean_absolute_error(actual_yields, preds)
    mse = mean_squared_error(actual_yields, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(actual_yields, preds)
    
    print("\n" + "="*30)
    print("      VALIDATION RESULTS")
    print("="*30)
    print(f"Total Samples: {len(df)}")
    print(f"Mean Absolute Error: {mae:.4f} T/Ha")
    print(f"Root Mean Sq Error: {rmse:.4f} T/Ha")
    print(f"R² Score:            {r2:.4f}")
    print("="*30)
    
    # Generate a Markdown report
    report_path = os.path.join(BASE_DIR, '..', '..', 'docs', 'validation_report.md')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Yield Model Validation Report\n\n")
        f.write(f"Generated on: {pd.Timestamp.now()}\n\n")
        
        f.write("## Performance Metrics\n")
        f.write(f"- **R² Score**: {r2:.4f}\n")
        f.write(f"- **Mean Absolute Error (MAE)**: {mae:.2f} T/Ha\n")
        f.write(f"- **RMSE**: {rmse:.2f} T/Ha\n\n")
        
        f.write("## Observations\n")
        if r2 < 0.7:
            f.write("> [!CAUTION]\n")
            f.write("> The R² score dropped significantly compared to the training R² (0.9973). This is a strong indicator of **Synthetic Data Bias**.\n\n")
        elif r2 < 0.9:
            f.write("> [!WARNING]\n")
            f.write("> Performance on real-world reference data is good but lower than synthetic test sets. This shows the model is reasonably robust but requires careful presentation to users.\n\n")
        else:
            f.write("> [!NOTE]\n")
            f.write("> The model generalizes surprisingly well to reference ranges. Still, real field data is recommended for final verification.\n\n")
            
        f.write("## Detailed Comparison\n\n")
        f.write("| Crop | Actual Yield (T/Ha) | Predicted Yield (T/Ha) | Error |\n")
        f.write("| :--- | :--- | :--- | :--- |\n")
        for i, row in df.iterrows():
            crop = row['crop']
            actual = row['actual_yield']
            pred = preds[i]
            error = pred - actual
            f.write(f"| {crop} | {actual:.2f} | {pred:.2f} | {error:+.2f} |\n")
            
    print(f"\n✅ Report generated at: docs/validation_report.md")

if __name__ == "__main__":
    run_validation()

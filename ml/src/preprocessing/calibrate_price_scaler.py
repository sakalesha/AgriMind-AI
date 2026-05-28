import joblib
import json
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORY_PATH = os.path.join(BASE_DIR, 'models', 'crop_price_history.json')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'price_scaler.pkl')

def calibrate_scaler():
    print("⚖️ Starting Price Scaler Calibration (₹/Ton Scale)...")
    
    if not os.path.exists(HISTORY_PATH):
        print("❌ Error: Price history not found.")
        return

    with open(HISTORY_PATH, 'r') as f:
        history = json.load(f)

    # Flatten all prices to get the global min/max for the scaler
    all_prices = []
    for crop in history:
        all_prices.extend(history[crop])
    
    all_prices = np.array(all_prices).reshape(-1, 1)
    
    # Create new scaler anchored in reality (₹10,000 to ₹300,000 range)
    # We use a broad range to ensure future price hikes are still within the [0,1] box
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(all_prices)
    
    print(f"✅ Scaler Calibrated. Min: ₹{scaler.data_min_[0]:,.0f}, Max: ₹{scaler.data_max_[0]:,.0f}")
    
    # Save the updated scaler
    joblib.dump(scaler, SCALER_PATH)
    print(f"✅ Exported: {SCALER_PATH}")

if __name__ == "__main__":
    calibrate_scaler()

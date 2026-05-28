import pandas as pd
import numpy as np
import os

# --- Anchors for 22 Crops (N, P, K, Temp, Humidity, pH, Rainfall, BaseYield) ---
# Based on ICAR/FAO/Agricultural Department ground-truth ranges
anchors = {
    'Rice':        [90, 42, 43, 24.0, 82.0, 6.5, 202.9, 4.2],
    'Maize':       [140, 65, 50, 22.0, 65.0, 6.2, 85.0,  5.8],
    'Chickpea':    [40, 67, 79, 18.0, 16.0, 7.3, 80.0,  2.5],
    'Kidneybeans': [20, 67, 20, 20.0, 21.0, 5.7, 105.0, 1.5],
    'Pigeonpeas':  [20, 67, 20, 27.0, 48.0, 5.7, 149.0, 1.8],
    'Mothbeans':   [21, 51, 18, 28.0, 53.0, 6.8, 51.0,  1.0],
    'Mungbean':    [20, 47, 20, 28.0, 85.0, 6.7, 48.0,  1.2],
    'Blackgram':   [15, 61, 18, 29.0, 65.0, 7.1, 67.0,  1.3],
    'Lentil':      [18, 68, 19, 24.0, 64.0, 6.9, 45.0,  1.4],
    'Pomegranate': [100, 50, 50, 22.0, 90.0, 6.4, 107.0, 22.0],
    'Banana':      [200, 100, 300, 27.0, 80.0, 5.9, 104.0, 50.0],
    'Mango':       [150, 100, 150, 32.0, 50.0, 5.7, 98.0,  12.0],
    'Grapes':      [120, 60, 120, 23.0, 81.0, 6.0, 69.0,  28.0],
    'Watermelon':  [80, 50, 50, 25.0, 85.0, 6.4, 50.0,  38.0],
    'Muskmelon':   [80, 50, 50, 28.0, 92.0, 6.3, 24.0,  28.0],
    'Apple':       [121, 60, 60, 22.0, 92.0, 5.9, 112.0, 35.0],
    'Orange':      [120, 60, 80, 22.0, 92.0, 7.0, 110.0, 20.0],
    'Papaya':      [181, 120, 180, 33.0, 92.0, 6.7, 142.0, 65.0],
    'Coconut':     [27, 17, 30, 26.0, 94.0, 5.9, 175.0, 14.0],
    'Cotton':      [100, 50, 50, 23.0, 79.0, 6.9, 182.0, 2.8],
    'Jute':        [50, 40, 60, 24.0, 80.0, 6.7, 174.0, 3.2],
    'Coffee':      [120, 80, 80, 26.0, 57.0, 6.8, 158.0, 1.5]
}

def generate_data(n_samples=10000):
    data = []
    crops = list(anchors.keys())
    
    for _ in range(n_samples):
        crop = np.random.choice(crops)
        anchor = anchors[crop]
        
        # Apply biological noise (15% variance)
        # Features: N, P, K, Temp, Humidity, pH, Rainfall
        n = max(0, anchor[0] + np.random.normal(0, anchor[0] * 0.15))
        p = max(0, anchor[1] + np.random.normal(0, anchor[1] * 0.15))
        k = max(0, anchor[2] + np.random.normal(0, anchor[2] * 0.15))
        temp = anchor[3] + np.random.normal(0, 3.0)
        hum  = np.clip(anchor[4] + np.random.normal(0, 10.0), 10, 100)
        ph   = np.clip(anchor[5] + np.random.normal(0, 0.5), 3.5, 9.5)
        rain = max(0, anchor[6] + np.random.normal(0, anchor[6] * 0.2))
        
        # Predict Yield based on NPK efficacy (Simplified biological model)
        # If NPK is way below anchor, yield drops. If it's way above, it plateaus.
        npk_ratio = (n/anchor[0] + p/anchor[1] + k/anchor[2]) / 3.0
        yield_val = anchor[7] * (0.5 + 0.5 * np.tanh(2.0 * (npk_ratio - 0.5)))
        
        # Add random external noise (Pests, weather, unmeasured)
        yield_val = max(0.1, yield_val + np.random.normal(0, yield_val * 0.1))
        
        data.append([crop, round(n, 2), round(p, 2), round(k, 2), round(temp, 2), round(hum, 2), round(ph, 2), round(rain, 2), round(yield_val, 2)])

    columns = ['crop', 'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'yield']
    return pd.DataFrame(data, columns=columns)

if __name__ == "__main__":
    import os
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    df = generate_data(12000)
    save_path = os.path.join(BASE_DIR, '..', 'data', 'grounded_yield_data.csv')
    os.makedirs(os.path.join(BASE_DIR, '..', 'data'), exist_ok=True)
    df.to_csv(save_path, index=False)
    print(f"✅ Generated {len(df)} rows of grounded-synthetic data at {save_path}")
    print(f"Mean Yield: {df['yield'].mean():.2f} T/Ha")
    print(f"Rice Mean Yield: {df[df['crop']=='Rice']['yield'].mean():.2f} T/Ha (Should be ~4.2)")

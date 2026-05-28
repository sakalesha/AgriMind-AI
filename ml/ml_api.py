from flask import Flask, request, jsonify
import joblib
import numpy as np
import os
import json
import sys

app = Flask(__name__)

# --- Load Models & Transformers ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Add src/utils to path to find price_scraper
sys.path.append(os.path.join(BASE_DIR, 'src', 'utils'))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'crop_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'models', 'label_encoder.pkl')

price_model = None
price_scaler = None
price_history = {}

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    print("SUCCESS: Original models loaded")
    
    YIELD_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'yield_model.pkl')
    YIELD_ENCODER_PATH = os.path.join(BASE_DIR, 'models', 'yield_label_encoder.pkl')
    
    yield_model = joblib.load(YIELD_MODEL_PATH)
    yield_label_encoder = joblib.load(YIELD_ENCODER_PATH)
    print("SUCCESS: Yield models loaded")
    
    PRICE_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'lstm_price_model.h5')
    PRICE_SCALER_PATH = os.path.join(BASE_DIR, 'models', 'price_scaler.pkl')
    HISTORY_PATH = os.path.join(BASE_DIR, 'models', 'crop_price_history.json')
    
    if os.path.exists(PRICE_MODEL_PATH):
        try:
            from tensorflow.keras.models import load_model
            price_model = load_model(PRICE_MODEL_PATH)
            price_scaler = joblib.load(PRICE_SCALER_PATH)
            with open(HISTORY_PATH, 'r') as f:
                price_history = json.load(f)
            print("SUCCESS: LSTM Price model loaded")
        except Exception as tf_err:
            print(f"WARNING: TensorFlow load failed: {tf_err}")
    else:
        print("WARNING: LSTM Price model not found")
except Exception as e:
    print(f"ERROR loading model: {e}")

def get_irrigation_level(rainfall, humidity):
    if rainfall < 60: return 'High'
    elif humidity > 70: return 'Low'
    else: return 'Medium'

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        input_data = [
            data['N'], data['P'], data['K'], 
            data['temperature'], data['humidity'], 
            data['ph'], data['rainfall']
        ]
        
        input_array = np.array([input_data])
        scaled_input = scaler.transform(input_array)
        
        prediction_encoded = model.predict(scaled_input)
        crop_name = label_encoder.inverse_transform(prediction_encoded)[0]
        
        irrigation = get_irrigation_level(data['rainfall'], data['humidity'])
        
        return jsonify({
            'status': 'success',
            'crop': crop_name,
            'irrigation': irrigation
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/predict_yield', methods=['POST'])
def predict_yield():
    try:
        data = request.json
        crop_name = data['crop'].capitalize() # Ensure format matches training data
        
        # Encode crop name
        crop_encoded = yield_label_encoder.transform([crop_name])[0]
        
        # Prepare input array (order must match training layout: crop_encoded, N, P, K, temp, humidity, ph, rainfall)
        input_data = [
            crop_encoded,
            data['N'], data['P'], data['K'], 
            data['temperature'], data['humidity'], 
            data['ph'], data['rainfall']
        ]
        
        input_array = np.array([input_data])
        
        # Predict yield
        predicted_yield = yield_model.predict(input_array)[0]
        
        # Calculate prediction intervals using individual trees
        all_tree_predictions = [tree.predict(input_array)[0] for tree in yield_model.estimators_]
        lower_bound = np.percentile(all_tree_predictions, 10)
        upper_bound = np.percentile(all_tree_predictions, 90)
        
        return jsonify({
            'status': 'success',
            'yield': round(predicted_yield, 2),
            'interval': [round(lower_bound, 2), round(upper_bound, 2)]
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

from price_scraper import fetch_realtime_price, fetch_all_realtime_prices

@app.route('/api/prices/all', methods=['GET'])
def get_all_prices():
    try:
        # 1. Get Live Prices for all crops concurrently
        all_live_prices = fetch_all_realtime_prices()
        
        result = []
        for crop_name, price_data in all_live_prices.items():
            live_price = price_data['price_ton']
            best_mandi = price_data['best_mandi']
            
            if not os.path.exists(PRICE_MODEL_PATH) or crop_name not in price_history:
                 trend = "Stable"
                 result.append({
                     'crop': crop_name,
                     'current_price': live_price,
                     'predicted_price': live_price,
                     'trend': trend,
                     'best_mandi': best_mandi
                 })
                 continue

            # 2. Prepare Sequence (last 4 months + today's live price = length 5)
            history_sequence = price_history[crop_name]
            # Drop the oldest, add Live as the most recent
            current_sequence = history_sequence[1:] + [live_price]
            
            # 3. Scale Data
            seq_array = np.array(current_sequence).reshape(-1, 1)
            scaled_seq = price_scaler.transform(seq_array)
            
            # 4. Predict
            lstm_input = scaled_seq.reshape((1, 5, 1))
            scaled_prediction = price_model.predict(lstm_input)
            
            # 5. Inverse Transform
            predicted_price = price_scaler.inverse_transform(scaled_prediction)[0][0]
            
            # Determine trend
            if predicted_price > live_price * 1.02:
                trend = "Up"
            elif predicted_price < live_price * 0.98:
                trend = "Down"
            else:
                trend = "Stable"
                
            result.append({
                'crop': crop_name,
                'current_price': float(round(live_price, 2)),
                'predicted_price': float(round(predicted_price, 2)),
                'trend': trend
            })
            
        return jsonify({
            'status': 'success',
            'data': result
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/predict_price_trend', methods=['POST'])
def predict_price_trend():
    try:
        data = request.json
        crop_name = data.get('crop', '').lower()
        
        # 1. Get Live Price
        live_price = fetch_realtime_price(crop_name)
        
        if not os.path.exists(PRICE_MODEL_PATH) or crop_name not in price_history:
             # Fallback if model not trained
             trend = "Stable"
             return jsonify({
                 'status': 'success',
                 'current_price': live_price,
                 'predicted_price': live_price,
                 'trend': trend
             })

        # 2. Prepare Sequence (last 4 months + today's live price = length 5)
        history_sequence = price_history[crop_name]
        # Drop the oldest, add Live as the most recent
        current_sequence = history_sequence[1:] + [live_price]
        
        # 3. Scale Data
        seq_array = np.array(current_sequence).reshape(-1, 1)
        scaled_seq = price_scaler.transform(seq_array)
        
        # 4. Predict
        lstm_input = scaled_seq.reshape((1, 5, 1))
        scaled_prediction = price_model.predict(lstm_input)
        
        # 5. Inverse Transform
        predicted_price = price_scaler.inverse_transform(scaled_prediction)[0][0]
        
        # Determine trend
        if predicted_price > live_price * 1.02:
            trend = "Up"
        elif predicted_price < live_price * 0.98:
            trend = "Down"
        else:
            trend = "Stable"
            
        return jsonify({
            'status': 'success',
            'current_price': float(round(live_price, 2)),
            'predicted_price': float(round(predicted_price, 2)),
            'trend': trend
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# For Render, run as a standalone server
if __name__ == '__main__':
    port = int(os.environ.get("ML_SERVICE_PORT", 5001))
    print(f"INFO: Python ML service starting on port {port}...")
    app.run(host='0.0.0.0', port=port)

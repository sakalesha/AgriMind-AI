### 1. Crop Recommendation Model (Machine Learning Classifier)
*   **Algorithm:** Random Forest Classifier (an ensemble of decision trees).
*   **Dataset:** The Kaggle Crop Recommendation dataset. It contains 2,200 rows mapping soil conditions to 22 different crop categories.
*   **Features (7):** Nitrogen (N), Phosphorus (P), Potassium (K), temperature, humidity, pH, and rainfall.
*   **Preprocessing Pipeline:**
    *   **`StandardScaler`:** Standardizes the 7 soil/weather features to have a mean of $0$ and a variance of $1$. This ensures that features with larger ranges (like rainfall) do not dominate features with smaller ranges (like pH).
    *   **`LabelEncoder`:** Converts the 22 target crop name strings (e.g., *"rice"*, *"maize"*) into integers ($0\text{--}21$) for the classifier to predict.
*   **Training & Serialization:** The dataset was split 80/20 into training and testing sets. The Random Forest model was fit using `scikit-learn` and exported to the [ml/models/](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/models) directory as `crop_model.pkl` along with `scaler.pkl` and `label_encoder.pkl` using `joblib`.

---

### 2. Yield Prediction Model (Machine Learning Regressor)
*   **Algorithm:** Random Forest Regressor (ensemble of 100 decision trees).
*   **Dataset:** A custom grounded dataset ([real_world_yield_data.csv](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/data/real_world_yield_data.csv)) that combines real-world baseline yields in India with synthetic soil/climate variances.
*   **Features (8):** The 7 soil parameters + the **encoded crop name** (integer from `yield_label_encoder.pkl`). Because yield varies drastically by crop, the recommended crop name is a required input feature.
*   **Training & Metrics:** The data was split 85/15. The regressor was fit with 100 estimators using `n_jobs=-1` for multi-core processing. It achieved a test $R^2$ score of **0.9973** (indicating that the model explains $99.73\%$ of the variance in crop yield).
*   **Serialization:** Exported to the models directory as `yield_model.pkl` and `yield_label_encoder.pkl`.

---

### 3. Irrigation Advisory (Rule-Based Engine)
*   **Algorithm:** Heuristic Rule-Based Logic (not an ML model).
*   **Implementation:** Implemented as a simple conditional block inside the Flask server ([ml_api.py](file:///c:/Users/ronad/OneDrive/Desktop/Projects/WEB+ML/AgriMindAI/ml/ml_api.py#L54-L57)):
    ```python
    def get_irrigation_level(rainfall, humidity):
        if rainfall < 60: return 'High'
        elif humidity > 70: return 'Low'
        else: return 'Medium'
    ```
*   **Interview Value:** This is a key talking point. In an interview, you can state: 
    > *"Instead of over-engineering a machine learning classifier for irrigation, I implemented a rule-based logic helper. It uses simple rainfall and humidity thresholds to assign irrigation levels, which keeps the system lightweight and easy to maintain."*

---

### 4. Price Forecasting Model (Deep Learning Sequence Model)
*   **Algorithm:** Long Short-Term Memory (LSTM) Recurrent Neural Network. LSTMs are used because commodity prices are time-series data where future prices depend on past trends.
*   **Dataset:** 5 years (60 months) of simulated price history generated for all 22 crops, modeling seasonal fluctuations (sine wave), economic inflation (upward trend), and market noise.
*   **Features & Architecture:**
    *   **`MinMaxScaler`:** Scales price data between $0$ and $1$ to help the LSTM neural network converge faster during training.
    *   **Time Steps:** Sequence length of **5 months**. The network takes 5 consecutive monthly prices as an input sequence to predict the price for the 6th month.
    *   **Network Design:** 
        *   An LSTM layer with 50 units (ReLU activation) to capture sequential trends.
        *   A Dense output layer with 1 unit to predict the normalized point-estimate price.
        *   Compiled using the Adam optimizer (learning rate = 0.01) and Mean Squared Error (MSE) loss function.
*   **Serialization:** The trained network was saved in Keras format as `lstm_price_model.h5` alongside its scaler `price_scaler.pkl` and a baseline history context file `crop_price_history.json`.
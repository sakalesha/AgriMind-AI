# Zod

Zod is used to validate data before it enters the backend system.

How it works:

* Checks if incoming data is correct (such as email format, password length, required fields, etc.).
* Runs as middleware before the controller logic executes.
* Prevents invalid or malformed data from reaching the database.
* Helps maintain consistent and reliable data throughout the application.

---

# Opossum

Opossum is a Node.js library that implements the Circuit Breaker pattern.

How it helps:

* Monitors communication between the Express backend and the Flask ML service.
* Detects when the ML service is failing or responding slowly.
* Temporarily stops sending requests to the failing service.
* Returns a fallback response instead of making users wait.
* Automatically reconnects when the ML service becomes healthy again.

This improves system reliability and prevents one service failure from affecting the entire application.

---

# Flask

Flask is a lightweight Python web framework used to build the Machine Learning service.

How it works:

* Loads trained machine learning models into memory.
* Provides API endpoints that other services can call.
* Receives user input from the Express backend.
* Runs predictions using the ML models.
* Sends prediction results back to the backend.

Using Flask allows Python-based machine learning models to run independently from the Node.js backend.

---

# TensorFlow / Keras

TensorFlow and Keras are deep learning frameworks used for price trend prediction.

How they are used:

* Build and run an LSTM (Long Short-Term Memory) neural network.
* Analyze historical crop price data.
* Predict whether prices are likely to move Up, Down, or remain Stable.
* Load the trained model and generate predictions in real time.

These frameworks are especially useful for handling time-series forecasting problems.

---

# Joblib

Joblib is used to save and load machine learning models efficiently.

How it works:

* Stores trained models as .pkl files.
* Loads models quickly when the Flask service starts.
* Keeps models in memory for fast predictions.
* Eliminates the need to retrain models every time the application runs.

This helps reduce startup time and improves prediction performance.

---

# NumPy

NumPy is the core mathematical computing library in Python.

How it is used:

* Converts user input into numerical arrays.
* Formats data into the structure required by machine learning models.
* Performs mathematical operations efficiently.
* Reshapes data for deep learning models such as LSTMs.

NumPy acts as the bridge between raw user data and machine learning algorithms.

---

# Pandas

Pandas is a data analysis and manipulation library built on top of NumPy.

How it is used:

* Loads datasets used for training machine learning models.
* Cleans and organizes raw data.
* Handles missing or incorrect values.
* Separates input features and target outputs.
* Creates structured DataFrames for data processing.

Pandas makes it easier to prepare and manage data before it is used by machine learning models.

---

# Scikit-learn

Scikit-learn is a popular machine learning library used to build predictive models.

How it is used:

* Trains the Crop Recommendation model.
* Trains the Yield Prediction model.
* Provides Random Forest algorithms for accurate predictions.
* Works with Pandas and NumPy during model training and prediction.

Scikit-learn powers the core machine learning functionality of the application.

import requests
import json

def test_price():
    base_url = "http://127.0.0.1:5001/api"
    
    # 1. Test Yield
    yield_payload = {
        "crop": "Rice",
        "N": 90, "P": 40, "K": 40,
        "temperature": 28, "humidity": 80,
        "ph": 6.5, "rainfall": 100
    }
    
    print("Testing Yield Table & Price grounding...")
    try:
        y_res = requests.post(f"{base_url}/predict_yield", json=yield_payload).json()
        yield_val = y_res['yield']
        
        # 2. Test Price
        p_res = requests.post(f"{base_url}/predict_price_trend", json={"crop": "rice"}).json()
        price = p_res['predicted_price']
        
        revenue = yield_val * price
        
        print(f"\nCrop:             Rice")
        print(f"Grounded Yield:   {yield_val} T/Ha")
        print(f"Grounded Price:   ₹{price:,.2f}/Ton")
        print(f"Est. Revenue:     ₹{revenue:,.2f}")
        
        if price > 5000:
            print("\n✅ Grounding Success: Price is in realistic ₹/Ton range.")
        else:
            print("\n❌ Grounding Failed: Price still in old synthetic range.")
            
    except Exception as e:
        print(f"❌ Error during test: {e}")

if __name__ == "__main__":
    test_price()

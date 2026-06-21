import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "AgriMind AI",
      "home": "Home",
      "crop_advisory": "Crop Advisory",
      "agri_calendar": "Agri Calendar",
      "inventory": "Inventory",
      "smart_irrigation": "Smart Irrigation",
      "yield_simulator": "Yield Simulator",
      "analytics": "Analytics",
      "market_prices": "Market Prices",
      "financial_ledger": "Financial Ledger",
      "satellite": "Satellite",
      "community": "Community",
      "notifications": "Notifications",
      "user_profile": "User Profile",
      "sign_out": "Sign Out",
      "welcome_back": "Welcome back, {{name}}!",
      "farm_summary": "Your farm summary for today",
      "soil_health": "Soil Health",
      "predicted_yield": "Predicted Yield",
      "estimated_revenue": "Estimated Revenue",
      "net_profit": "Net Profit"
    }
  },
  hi: {
    translation: {
      "app_name": "एग्रोइनसाइट",
      "home": "होम",
      "crop_advisory": "फसल सलाह",
      "agri_calendar": "कृषि कैलेंडर",
      "inventory": "इन्वेंटरी",
      "smart_irrigation": "स्मार्ट सिंचाई",
      "yield_simulator": "उपज सिम्युलेटर",
      "analytics": "एनालिटिक्स",
      "market_prices": "बाजार भाव",
      "financial_ledger": "वित्तीय लेजर",
      "satellite": "सैटेलाइट",
      "community": "समुदाय",
      "notifications": "सूचनाएं",
      "user_profile": "उपयोगकर्ता प्रोफ़ाइल",
      "sign_out": "साइन आउट",
      "welcome_back": "वापसी पर स्वागत है, {{name}}!",
      "farm_summary": "आज के लिए आपके खेत का सारांश",
      "soil_health": "मिट्टी का स्वास्थ्य",
      "predicted_yield": "अनुमानित उपज",
      "estimated_revenue": "अनुमानित राजस्व",
      "net_profit": "शुद्ध लाभ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

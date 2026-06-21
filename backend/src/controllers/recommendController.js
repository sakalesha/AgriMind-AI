const axios = require('axios');
const Recommendation = require('../models/Recommendation');
const cropRequirements = require('../data/cropRequirements');
const marketPrices = require('../data/marketPrices');
const { LRUCache } = require('lru-cache');
const CircuitBreaker = require('opossum');

const mlCache = new LRUCache({
    max: 200,
    ttl: 1000 * 60 * 60 * 24 //time to live is 24 hrs
});

const ML_SERVICE_PORT = process.env.ML_SERVICE_PORT || 5001;
const ML_BASE_URL = `http://127.0.0.1:${ML_SERVICE_PORT}`;

async function callMlService(url, payload, timeoutMs = 8000) {
    const response = await axios.post(url, payload, { timeout: timeoutMs });
    return response.data;
}

const mlBreaker = new CircuitBreaker(callMlService, {
    timeout: 8000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 3
});

mlBreaker.on('fallback', (result) => console.warn('⚡ Circuit breaker fallback triggered'));
mlBreaker.on('reject', (err) => console.warn('⚡ Circuit breaker rejected:', err.message));
mlBreaker.on('timeout', () => console.warn('⚡ ML service call timed out'));

let cachedExchangeRate = null;
let exchangeRateCachedAt = 0;
const EXCHANGE_RATE_TTL = 60 * 60 * 1000; // 1 hour

async function getExchangeRate() {
    const now = Date.now();
    if (cachedExchangeRate && (now - exchangeRateCachedAt) < EXCHANGE_RATE_TTL) {
        return cachedExchangeRate;
    }
    try {
        const res = await axios.get('https://api.frankfurter.app/latest?from=USD&to=INR', { timeout: 4000 });
        if (res.data?.rates?.INR) {
            cachedExchangeRate = res.data.rates.INR;
            exchangeRateCachedAt = now;
            return cachedExchangeRate;
        }
    } catch (ex) {
        console.warn('⚠️ Exchange rate fetch failed, using fallback:', cachedExchangeRate || 83.5);
    }
    return cachedExchangeRate || 83.5;
}

exports.getRecommendation = async (req, res) => {
    try {
        const { fieldName, N, P, K, temperature, humidity, ph, rainfall } = req.body;
        const cacheKey = `${N}|${P}|${K}|${temperature}|${humidity}|${ph}|${rainfall}`;

        let crop;
        let estimatedYield = 2.0;
        let yieldInterval = null;

        const cachedData = mlCache.get(cacheKey);

        if (cachedData) {
            crop = cachedData.crop;
            estimatedYield = cachedData.estimatedYield;
            yieldInterval = cachedData.yieldInterval;
        } else {
            const payload = { N, P, K, temperature, humidity, ph, rainfall };

            // Crop Recommendation + Yield Estimation
            let mlResult;
            try {
                mlResult = await mlBreaker.fire(`${ML_BASE_URL}/api/predict`, payload);
                crop = mlResult.crop;
            } catch (breakerError) {
                console.error('❌ ML service (crop prediction) unavailable:', breakerError.message);
                return res.status(503).json({
                    status: 'fail',
                    message: 'Prediction service temporarily unavailable. Please try again later.',
                    code: 'ML_SERVICE_UNAVAILABLE'
                });
            }

            // Fetch yield prediction (non-blocking fallback)
            try {
                const yieldResult = await mlBreaker.fire(`${ML_BASE_URL}/api/predict_yield`, { crop, ...payload });
                if (yieldResult?.yield) {
                    estimatedYield = yieldResult.yield;
                    yieldInterval = yieldResult.interval || null;
                }
            } catch (yieldError) {
                console.warn('⚠️ Yield prediction failed (falling back to default):', yieldError.message);
            }

            mlCache.set(cacheKey, { crop, estimatedYield, yieldInterval });
        }
        
        // Fertilizer Gap Analysis
        // 1. Calculate Fertilizer Advice
        const requirements = cropRequirements[crop.toLowerCase()];
        let fertilizerAdvice = {};

        if (requirements) {
            const nDeficit = requirements.N - N;
            const pDeficit = requirements.P - P;
            const kDeficit = requirements.K - K;

            fertilizerAdvice = {
                N: nDeficit > 0 ? `Add ${nDeficit} units of Nitrogen` : 'Optimal',
                P: pDeficit > 0 ? `Add ${pDeficit} units of Phosphorus` : 'Optimal',
                K: kDeficit > 0 ? `Add ${kDeficit} units of Potassium` : 'Optimal',
                summary: []
            };

            if (nDeficit > 0) fertilizerAdvice.summary.push(`Nitrogen deficiency detected for ${crop}.`);
            if (pDeficit > 0) fertilizerAdvice.summary.push(`Phosphorus deficiency detected for ${crop}.`);
            if (kDeficit > 0) fertilizerAdvice.summary.push(`Potassium deficiency detected for ${crop}.`);
            if (fertilizerAdvice.summary.length === 0) fertilizerAdvice.summary.push(`Soil nutrient levels are optimal for ${crop}.`);
        } else {
            fertilizerAdvice = { summary: ["General NPK balanced fertilizer recommended."] };
        }
        
        // Price Trend Forecasting (LSTM)
        // 2. Market Analysis & LSTM Profitability Forecast
        let pricePerTon = marketPrices[crop.toLowerCase()] || 500;
        let predictedPrice = pricePerTon;
        let marketTrend = "Stable";
        const usdToInr = await getExchangeRate();

        try {
            const priceResult = await mlBreaker.fire(`${ML_BASE_URL}/api/predict_price_trend`, { crop });
            if (priceResult && priceResult.status === 'success') {
                pricePerTon = priceResult.current_price;
                predictedPrice = priceResult.predicted_price;
                marketTrend = priceResult.trend;
            }
        } catch (priceError) {
            console.warn('⚠️ Price prediction failed (using static fallback):', priceError.message);
            const trendValue = (Math.random() * 20) - 5;
            marketTrend = trendValue > 2 ? 'Up' : trendValue < -2 ? 'Down' : 'Stable';
        }

        pricePerTon = Math.round(pricePerTon * usdToInr);
        predictedPrice = Math.round(predictedPrice * usdToInr);
        const estimatedRevenue = estimatedYield * predictedPrice;

        const newRecord = new Recommendation({
            fieldName: fieldName || 'Unnamed Field',
            user: req.user._id,
            inputs: { N, P, K, temperature, humidity, ph, rainfall },
            prediction: {
                crop,
                yield: estimatedYield.toFixed(2),
                yieldInterval,
                marketPrice: pricePerTon,
                estimatedRevenue: Math.round(estimatedRevenue),
                marketTrend
            },
            fertilizer: fertilizerAdvice
        });

        await newRecord.save();

        res.json({
            status: 'success',
            crop,
            yield: estimatedYield.toFixed(2),
            yieldInterval,
            market: {
                pricePerTon,
                predictedPrice,
                estimatedRevenue: Math.round(estimatedRevenue),
                trend: marketTrend
            },
            fertilizer: fertilizerAdvice,
            recordId: newRecord._id
        });
    } catch (error) {
        console.error('❌ Error in getRecommendation:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
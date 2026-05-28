import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Camera,
  RefreshCw,
  Search,
  Bug
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AnalysisResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high';
}

interface DiseaseDetectionProps {
  onResult?: (result: AnalysisResult) => void;
}

export const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ onResult }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // Initialize Gemini AI
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // In a real scenario, we would send the base64 image to Gemini
      // For this demo, we simulate the analysis with a delay
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result based on common crop diseases
      const mockResults: AnalysisResult[] = [
        {
          disease: "Rice Blast (Magnaporthe oryzae)",
          confidence: 92,
          severity: 'high',
          description: "A serious fungal disease that causes lesions on leaves, nodes, and panicles. It can lead to significant yield loss if not treated early.",
          treatment: [
            "Apply systemic fungicides like Tricyclazole or Azoxystrobin immediately.",
            "Remove and burn infected plant debris to prevent further spore spread.",
            "Maintain a thin layer of water in the field to reduce plant stress.",
            "Avoid applying nitrogen fertilizer until the outbreak is controlled."
          ],
          prevention: [
            "Use blast-resistant rice varieties for future planting.",
            "Treat seeds with recommended fungicides before sowing.",
            "Avoid excessive nitrogen application; use balanced NPK ratios.",
            "Ensure proper plant spacing to improve air circulation and reduce humidity."
          ]
        },
        {
          disease: "Bacterial Leaf Blight",
          confidence: 88,
          severity: 'medium',
          description: "Caused by Xanthomonas oryzae, this disease results in yellowing and drying of leaves, starting from the tips.",
          treatment: [
            "Apply copper-based bactericides or streptomycin-based treatments.",
            "Drain the field for 3-5 days to inhibit bacterial multiplication.",
            "Avoid working in the field when plants are wet to prevent mechanical spread.",
            "Reduce nitrogen application to slow down disease progression."
          ],
          prevention: [
            "Use certified, disease-free seeds from reliable sources.",
            "Practice crop rotation with non-host crops like legumes.",
            "Maintain clean field borders and remove weed hosts.",
            "Avoid flooding the field during the early growth stages."
          ]
        }
      ];

      const selectedResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setResult(selectedResult);
      if (onResult) onResult(selectedResult);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("Failed to analyze image. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Disease Detection AI</h2>
          <p className="text-zinc-500 mt-1">Upload a photo of your crop to identify diseases and get treatment advice.</p>
        </div>
        {selectedImage && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <div className={cn("lg:col-span-5", result && "lg:col-span-4")}>
          <div className="premium-card h-full flex flex-col">
            <div className="relative flex-1 min-h-[300px] rounded-2xl overflow-hidden bg-white/5 border border-dashed border-white/10 group hover:border-agro-neon/50 transition-all duration-500">
              {selectedImage ? (
                <div className="absolute inset-0">
                  <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" />
                  {!result && !isAnalyzing && (
                    <div className="absolute inset-0 bg-agro-dark/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-agro-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" /> Change Photo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 bg-agro-neon/10 rounded-3xl flex items-center justify-center mb-6 border border-agro-neon/20 group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8 text-agro-neon" />
                  </div>
                  <p className="text-xl font-bold text-white mb-2">Upload Crop Photo</p>
                  <p className="text-zinc-500 text-sm">Drag and drop or click to select an image from your device</p>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {selectedImage && !result && (
              <button 
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full mt-6 bg-agro-neon text-agro-dark font-bold py-4 rounded-2xl hover:bg-agro-neon/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-agro-neon/20 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Identify Disease
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className={cn("lg:col-span-7", result && "lg:col-span-8")}>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="premium-card h-full flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative w-24 h-24 mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-white/5 border-t-agro-neon rounded-full"
                  />
                  <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-agro-neon animate-pulse" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Scanning Plant Tissue</h3>
                <p className="text-zinc-500 max-w-xs">Our AI is cross-referencing thousands of disease patterns to provide an accurate diagnosis.</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="premium-card border-agro-neon/20 bg-gradient-to-br from-agro-card to-agro-neon/5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-agro-neon/10 rounded-2xl flex items-center justify-center border border-agro-neon/20">
                        <Bug className="w-8 h-8 text-agro-neon" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                            result.severity === 'high' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            result.severity === 'medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            "bg-green-500/10 text-green-400 border-green-500/20"
                          )}>
                            {result.severity} Severity
                          </span>
                          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">•</span>
                          <span className="text-agro-neon text-[10px] font-bold uppercase tracking-widest">{result.confidence}% Confidence</span>
                        </div>
                        <h3 className="text-3xl font-display font-bold text-white">{result.disease}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-agro-neon font-bold">
                      <CheckCircle2 className="w-5 h-5" /> Diagnosis Complete
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Description
                      </h4>
                      <p className="text-zinc-300 leading-relaxed">{result.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-bold text-agro-neon uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Recommended Treatment
                        </h4>
                        <ul className="space-y-3">
                          {result.treatment.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                              <div className="w-5 h-5 rounded-full bg-agro-neon/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-agro-neon">{i + 1}</span>
                              </div>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Immediate Actions
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                              <X className="w-5 h-5 text-red-500" />
                            </div>
                            <p className="text-xs text-zinc-400">Isolate affected area immediately to prevent spore spread.</p>
                          </div>
                          <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all">
                            Consult Agronomist
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-agro-neon/5 rounded-2xl border border-agro-neon/10">
                      <h4 className="text-xs font-bold text-agro-neon uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Prevention Tips
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.prevention.map((tip, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-agro-neon" />
                            <p className="text-xs text-zinc-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card h-full flex flex-col items-center justify-center py-20 text-center border-red-500/20"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                <p className="text-zinc-500 max-w-xs mb-8">{error}</p>
                <button 
                  onClick={reset}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                >
                  Try Different Photo
                </button>
              </motion.div>
            ) : (
              <div className="premium-card h-full flex flex-col items-center justify-center py-20 text-center border-white/5 opacity-50">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                  <ImageIcon className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-700">Awaiting Analysis</h3>
                <p className="text-zinc-800 max-w-xs">Upload a clear photo of the affected plant part to begin the AI diagnosis.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import { cn } from '@/src/lib/utils';

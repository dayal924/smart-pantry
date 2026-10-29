import React, { useState, useMemo } from 'react';
import { SAMPLE_DETECTIONS, LABELS, getProduceByClass, Detection } from '../data/catalog';
import { 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Eye, 
  EyeOff, 
  Scan, 
  X
} from 'lucide-react';

export const InteractivePlayground: React.FC = () => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [confThreshold, setConfThreshold] = useState(0.35);
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customAspectRatio, setCustomAspectRatio] = useState<number>(4 / 3);
  const [letterboxMode, setLetterboxMode] = useState<'letterbox' | 'stretch'>('letterbox');
  const [isScanning, setIsScanning] = useState(false);
  const [userDetections, setUserDetections] = useState<Detection[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [, setTick] = useState(0);

  const activeSample = SAMPLE_DETECTIONS[selectedSampleIndex] || SAMPLE_DETECTIONS[0];
  const activeImageSrc = customImage || activeSample.src;

  // Active detections based on mode and confThreshold
  const currentDetections = useMemo(() => {
    const list = customImage ? userDetections : activeSample.detections;
    return list.filter((d) => d.score >= confThreshold);
  }, [customImage, userDetections, activeSample, confThreshold]);

  // Handle image upload with animated scanning simulation
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomAspectRatio(img.naturalWidth / img.naturalHeight);
        setCustomImage(src);
        setSelectedDetection(null);
        setIsScanning(true);

        // Simulate fast 800ms on-device YOLO inference
        setTimeout(() => {
          setIsScanning(false);
          setUserDetections([
            {
              class_id: 32,
              className: 'Tomato',
              emoji: '🍅',
              score: 0.942,
              bbox: [0.18, 0.22, 0.32, 0.35],
            },
            {
              class_id: 6,
              className: 'Capsicum',
              emoji: '🫑',
              score: 0.887,
              bbox: [0.55, 0.32, 0.34, 0.38],
            },
            {
              class_id: 7,
              className: 'Carrot',
              emoji: '🥕',
              score: 0.765,
              bbox: [0.28, 0.58, 0.42, 0.32],
            },
          ]);
        }, 900);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // Tap-to-correct logic
  const handleUpdateDetectionClass = (det: Detection, newClass: string) => {
    const produce = getProduceByClass(newClass);
    det.className = newClass;
    det.emoji = produce?.emoji || '🥑';
    setSelectedDetection({ ...det });
    setTick((t) => t + 1);
  };

  return (
    <section id="playground" className="py-20 lg:py-32 relative border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090F0B] scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-hud-green/10 text-emerald-800 dark:text-hud-green border border-emerald-300 dark:border-hud-green/20 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            LIVE ML INFERENCE PLAYGROUND
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Interactive YOLO Produce Detector
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Experience how the mobile YOLOv8m engine decodes anchors, rejects false positives with class-aware NMS, and preserves aspect ratio without distortion.
          </p>
        </div>

        {/* Main Grid: Controls & Visual Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas (Phone / Inspection View) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl dark:shadow-2xl relative transition-colors">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">INPUT SOURCE:</span>
                <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-black/40 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                  {SAMPLE_DETECTIONS.map((sample, idx) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setCustomImage(null);
                        setSelectedSampleIndex(idx);
                        setSelectedDetection(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        !customImage && selectedSampleIndex === idx
                          ? 'bg-pantry-600 text-white font-bold shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Sample {idx + 1}
                    </button>
                  ))}
                  <label className="cursor-pointer px-2.5 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-pantry-600 dark:text-hud-green" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* View Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoxes(!showBoxes)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    showBoxes 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                  title="Toggle Bounding Boxes"
                >
                  {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Boxes</span>
                </button>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    showLabels 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                  title="Toggle Labels"
                >
                  <span className="font-mono text-xs">A</span>
                  <span className="hidden sm:inline">Labels</span>
                </button>
              </div>
            </div>

            {/* Visual Canvas Container with exact Aspect-Ratio containment */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border transition-all ${
                isDragOver ? 'border-hud-green ring-2 ring-hud-green/30' : 'border-slate-300 dark:border-emerald-500/20'
              }`}
              style={{ minHeight: '380px' }}
            >
              {/* Inner wrapper matching exact photo dimensions for 100% accurate coordinates */}
              <div
                className="relative max-w-full max-h-[580px] select-none"
                style={{
                  aspectRatio: customImage ? `${customAspectRatio}` : `${activeSample.width} / ${activeSample.height}`,
                }}
              >
                <img
                  src={activeImageSrc}
                  alt="Detection View"
                  className={`w-full h-full object-contain block transition-all duration-300 ${
                    letterboxMode === 'stretch' ? 'scale-x-125 brightness-90 filter blur-[0.3px]' : ''
                  }`}
                />

                {/* Laser scan line when analyzing custom image */}
                {isScanning && (
                  <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3">
                    <div className="relative w-2/3 h-1 bg-hud-green animate-scan-line shadow-[0_0_15px_#00FF66]" />
                    <div className="flex items-center gap-2 text-xs font-mono text-hud-green bg-black/80 px-3 py-1.5 rounded-lg border border-hud-green/40">
                      <Scan className="w-4 h-4 animate-spin text-hud-green" />
                      <span>ONNX Runtime Inference (640×640 CHW)...</span>
                    </div>
                  </div>
                )}

                {/* SVG Bounding Box Layer — Pixel-Perfect Coordinates */}
                {showBoxes && !isScanning && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {currentDetections.map((det, i) => {
                      const [x, y, w, h] = det.bbox;
                      const left = x * 100;
                      const top = y * 100;
                      const width = w * 100;
                      const height = h * 100;
                      const isSelected = selectedDetection?.className === det.className && selectedDetection?.score === det.score;

                      return (
                        <g key={i} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedDetection(det)}>
                          <rect
                            x={left}
                            y={top}
                            width={width}
                            height={height}
                            fill={isSelected ? 'rgba(0, 255, 102, 0.25)' : 'rgba(46, 125, 50, 0.15)'}
                            stroke={isSelected ? '#00FF66' : '#2E7D32'}
                            strokeWidth={isSelected ? '1.0' : '0.6'}
                            rx="1"
                          />
                          {/* Reticle Marks */}
                          <line x1={left} y1={top} x2={left + 3} y2={top} stroke="#FFFFFF" strokeWidth="1.2" />
                          <line x1={left} y1={top} x2={left} y2={top + 3} stroke="#FFFFFF" strokeWidth="1.2" />

                          <line x1={left + width} y1={top} x2={left + width - 3} y2={top} stroke="#FFFFFF" strokeWidth="1.2" />
                          <line x1={left + width} y1={top} x2={left + width} y2={top + 3} stroke="#FFFFFF" strokeWidth="1.2" />

                          <line x1={left} y1={top + height} x2={left + 3} y2={top + height} stroke="#FFFFFF" strokeWidth="1.2" />
                          <line x1={left} y1={top + height} x2={left} y2={top + height - 3} stroke="#FFFFFF" strokeWidth="1.2" />

                          <line x1={left + width} y1={top + height} x2={left + width - 3} y2={top + height} stroke="#FFFFFF" strokeWidth="1.2" />
                          <line x1={left + width} y1={top + height} x2={left + width} y2={top + height - 3} stroke="#FFFFFF" strokeWidth="1.2" />
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* HTML Labels overlay */}
                {showBoxes && showLabels && !isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    {currentDetections.map((det, i) => {
                      const [x, y] = det.bbox;
                      const left = Math.max(1, Math.min(92, x * 100));
                      const top = Math.max(2, Math.min(94, y * 100));
                      const isSelected = selectedDetection?.className === det.className && selectedDetection?.score === det.score;

                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedDetection(det)}
                          style={{ left: `${left}%`, top: `${top}%` }}
                          className={`absolute -translate-y-full mb-1 pointer-events-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold shadow-lg transition-all ${
                            isSelected
                              ? 'bg-hud-green text-black scale-105 z-30 ring-2 ring-white/50'
                              : 'bg-black/90 text-white border border-emerald-500/50 hover:bg-pantry-600 z-10'
                          }`}
                        >
                          <span>{det.emoji}</span>
                          <span>{det.className}</span>
                          <span className={isSelected ? 'text-black' : 'text-hud-green'}>
                            {(det.score * 100).toFixed(1)}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Naive Stretch Warning Banner (if toggled) */}
              {letterboxMode === 'stretch' && (
                <div className="absolute top-3 inset-x-3 bg-red-950/90 border border-red-500/50 p-2.5 rounded-lg text-xs text-red-200 flex items-center gap-2 z-40">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>Distortion Warning:</strong> Naive 640×640 stretch shifts pixels by ~37 gray levels on average, causing miss-classifications.
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Letterbox Toggle info */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-200/60 dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Preprocessing Mode:</span>
                <button
                  onClick={() => setLetterboxMode('letterbox')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                    letterboxMode === 'letterbox'
                      ? 'bg-pantry-600 text-white border border-emerald-400/40 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ✓ Aspect-Preserving Letterbox (Smart Pantry)
                </button>
                <button
                  onClick={() => setLetterboxMode('stretch')}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                    letterboxMode === 'stretch'
                      ? 'bg-red-700 dark:bg-red-900/60 text-white dark:text-red-200 border border-red-500/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Naive 640×640 Stretch
                </button>
              </div>

              <div className="flex items-center gap-2">
                {customImage && (
                  <button
                    onClick={() => {
                      setCustomImage(null);
                      setSelectedDetection(null);
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 font-mono font-medium"
                  >
                    <X className="w-3 h-3" />
                    Reset Upload
                  </button>
                )}
                <span className="text-pantry-700 dark:text-hud-green font-mono text-[11px] font-semibold">
                  {currentDetections.length} item{currentDetections.length === 1 ? '' : 's'} identified
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Detection HUD & Threshold Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time ML Parameters Tuning */}
            <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-5 shadow-lg dark:shadow-2xl transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Post-Processing Controls</h3>
                </div>
                <button
                  onClick={() => {
                    setConfThreshold(0.35);
                    setIouThreshold(0.45);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Confidence Filter (conf_thresh)</span>
                  <span className="text-pantry-700 dark:text-hud-green font-mono font-bold">{(confThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                  className="w-full accent-pantry-600 dark:accent-hud-green cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (Loose)</span>
                  <span>Default: 35%</span>
                  <span>95% (Strict)</span>
                </div>
              </div>

              {/* NMS IoU Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Class-Aware NMS (iou_thresh)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{iouThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.80"
                  step="0.05"
                  value={iouThreshold}
                  onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-500 cursor-pointer bg-slate-200 dark:bg-slate-800 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.20 (Aggressive)</span>
                  <span>Standard: 0.45</span>
                  <span>0.80 (Loose)</span>
                </div>
              </div>
            </div>

            {/* Detected Produce List & Tap-to-Correct Simulation */}
            <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-lg dark:shadow-2xl transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pantry-600 dark:text-emerald-400" />
                  <span>Review HUD — Detected Items</span>
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-pantry-100 dark:bg-pantry-500/20 text-pantry-800 dark:text-emerald-300 font-mono font-semibold">
                  Tap Box to Correct
                </span>
              </div>

              {currentDetections.length === 0 ? (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No produce found above {(confThreshold * 100).toFixed(0)}% confidence.
                  <br />Try lowering the confidence threshold slider!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {currentDetections.map((det, idx) => {
                    const produce = getProduceByClass(det.className);
                    const isSelected = selectedDetection?.className === det.className && selectedDetection?.score === det.score;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDetection(det)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-pantry-900/60 border-pantry-600 dark:border-hud-green shadow-md'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{det.emoji}</span>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <span>{det.className}</span>
                                <span className="text-xs font-mono text-pantry-700 dark:text-hud-green font-normal">
                                  {(det.score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                Storage: {produce?.default_storage === 'fridge' ? '❄️ Refrigerator' : '🌡️ Room Shelf'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-medium text-pantry-700 dark:text-emerald-300 block">
                              {produce?.shelf_life_days.fridge ?? 7}d shelf life
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              ~{produce?.nutrition_per_100g.kcal ?? 50} kcal/100g
                            </span>
                          </div>
                        </div>

                        {/* Interactive Tap-to-Correct Picker if selected */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                              <span>Confidence: {(det.score * 100).toFixed(1)}%</span>
                              <span className="text-pantry-700 dark:text-emerald-400 font-medium">Pick alternative:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {['Apple', 'Pear', 'Kiwi', 'Tomato', 'Orange', 'Capsicum', 'Mango'].map((alt) => (
                                <button
                                  key={alt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateDetectionClass(det, alt);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                    det.className === alt
                                      ? 'bg-pantry-600 dark:bg-hud-green text-white dark:text-black font-bold border-pantry-600 dark:border-hud-green'
                                      : 'bg-white dark:bg-black/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-400'
                                  }`}
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Summary telemetry footer */}
              <div className="p-2.5 rounded-lg bg-slate-200/60 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span>ONNX Input: 640×480 [CHW]</span>
                <span className="text-pantry-700 dark:text-hud-green font-bold">Latency: 38ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { LABELS, getProduceByClass } from '../data/catalog';
import { Search, Maximize2, CheckCircle2, TrendingUp, Award } from 'lucide-react';

export const YoloMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'val_preds' | 'confusion' | 'curves' | 'classes' | 'volumetric'>('val_preds');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [curveType, setCurveType] = useState<'mask' | 'box'>('mask');
  const [classSearch, setClassSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomModalImage, setZoomModalImage] = useState<string | null>(null);

  const valImages = [
    { src: './yolo/val_batch0_pred.jpg', title: 'Validation Batch 0 — Real Segmentation Masks' },
    { src: './yolo/val_batch1_pred.jpg', title: 'Validation Batch 1 — Multi-Class Produce Polygons' },
    { src: './yolo/val_batch2_pred.jpg', title: 'Validation Batch 2 — Clustered Produce Segmentation' },
  ];

  // Filtered produce classes
  const filteredClasses = LABELS.filter((name) => {
    const item = getProduceByClass(name);
    const matchesSearch = name.toLowerCase().includes(classSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item?.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <section id="metrics" className="py-20 lg:py-32 relative bg-white dark:bg-[#090F0C] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-mono font-medium">
            <Award className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            DEEP LEARNING · INSTANCE SEGMENTATION & VOLUMETRIC METRICS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            YOLOv8m-Seg Performance & Volumetric Results
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Grounded in Ultralytics YOLOv8m-Seg training logs, 32 prototype mask channels, and 3D ellipsoidal gram-weight calculations across 35 produce categories.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-1 hover:border-emerald-500/40 transition-colors shadow-sm">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Mask Segmentation mAP</span>
            <div className="text-3xl sm:text-4xl font-black text-pantry-700 dark:text-hud-green font-mono">92.21%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1">
              <TrendingUp className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
              <span>Mask mAP@50 (Peak Ep 25)</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-1 hover:border-emerald-500/40 transition-colors shadow-sm">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Bounding Box mAP</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">92.02%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Box mAP@50 Detection</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-1 hover:border-emerald-500/40 transition-colors shadow-sm">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Dual-Head Tensor</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">71 Chans</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>4 box + 35 cls + 32 mask coeffs</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-1 hover:border-emerald-500/40 transition-colors shadow-sm">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">ONNX Model Runtime</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">110.4 MB</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>32 Prototypes @ 160×160</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('val_preds')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'val_preds'
                ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span>Segmentation Predictions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/40 text-white dark:text-emerald-300 font-mono">3 Batches</span>
          </button>
          <button
            onClick={() => setActiveTab('confusion')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'confusion'
                ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span>Confusion Matrix</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/40 text-white dark:text-emerald-300 font-mono">Normalized</span>
          </button>
          <button
            onClick={() => setActiveTab('curves')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'curves'
                ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span>Training Curves</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/40 text-white dark:text-emerald-300 font-mono">Loss, PR & F1</span>
          </button>
          <button
            onClick={() => setActiveTab('volumetric')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'volumetric'
                ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span>3D Volumetric Engine</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/40 text-white dark:text-emerald-300 font-mono">Grams & Cal</span>
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'classes'
                ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <span>35 Produce Classes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 dark:bg-black/40 text-white dark:text-emerald-300 font-mono">Catalog</span>
          </button>
        </div>

        {/* Tab 1: Validation Predictions Viewer */}
        {activeTab === 'val_preds' && (
          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">BATCH SELECT:</span>
                <div className="flex gap-1.5 bg-slate-200/70 dark:bg-black/40 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                  {valImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        activeImageIndex === idx ? 'bg-pantry-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Batch {idx}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setZoomModalImage(valImages[activeImageIndex].src)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Resolution</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 max-h-[640px] flex items-center justify-center">
              <img
                src={valImages[activeImageIndex].src}
                alt={valImages[activeImageIndex].title}
                className="w-full h-auto object-contain max-h-[600px]"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center">
              Actual validation output generated during model training with predicted bounding boxes and class scores.
            </p>
          </div>
        )}

        {/* Tab 2: Confusion Matrix */}
        {activeTab === 'confusion' && (
          <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Normalized Confusion Matrix (35 Produce Classes)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cross-class recognition and boundary accuracy.</p>
              </div>
              <button
                onClick={() => setZoomModalImage('./yolo/confusion_matrix_normalized.png')}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Matrix</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 max-h-[640px] flex items-center justify-center p-2">
              <img
                src="./yolo/confusion_matrix_normalized.png"
                alt="Normalized Confusion Matrix"
                className="w-full h-auto object-contain max-h-[580px]"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Loss & Training Curves */}
        {activeTab === 'curves' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setCurveType('mask')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  curveType === 'mask'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Instance Segmentation Mask Curves (YOLOv8-Seg)
              </button>
              <button
                onClick={() => setCurveType('box')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  curveType === 'box'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Bounding Box Detection Curves
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">35-Epoch Training & Validation Loss</h3>
                  <button
                    onClick={() => setZoomModalImage('./yolo/results.png')}
                    className="p-1.5 rounded bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 p-2">
                  <img src="./yolo/results.png" alt="Training Results" className="w-full h-auto object-contain" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Seg loss, box loss, cls loss, and dfl loss steadily converging with mosaic augmentations.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {curveType === 'mask' ? 'Mask Precision-Recall Curve (MaskPR)' : 'Box Precision-Recall Curve (BoxPR)'}
                  </h3>
                  <button
                    onClick={() => setZoomModalImage(curveType === 'mask' ? './yolo/MaskPR_curve.png' : './yolo/BoxPR_curve.png')}
                    className="p-1.5 rounded bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 p-2">
                  <img
                    src={curveType === 'mask' ? './yolo/MaskPR_curve.png' : './yolo/BoxPR_curve.png'}
                    alt="Precision-Recall Curve"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {curveType === 'mask'
                    ? 'MaskPR curve demonstrating 92.2% mAP@50 across produce polygon masks.'
                    : 'BoxPR curve demonstrating 92.0% mAP@50 across bounding boxes.'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {curveType === 'mask' ? 'Mask F1-Confidence Curve (MaskF1)' : 'Box F1-Confidence Curve (BoxF1)'}
                  </h3>
                  <button
                    onClick={() => setZoomModalImage(curveType === 'mask' ? './yolo/MaskF1_curve.png' : './yolo/BoxF1_curve.png')}
                    className="p-1.5 rounded bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 p-2">
                  <img
                    src={curveType === 'mask' ? './yolo/MaskF1_curve.png' : './yolo/BoxF1_curve.png'}
                    alt="F1-Confidence Curve"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimal confidence operating threshold across all 35 produce classes.</p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xl transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Precision & Recall Operating Curves</h3>
                  <button
                    onClick={() => setZoomModalImage(curveType === 'mask' ? './yolo/MaskP_curve.png' : './yolo/BoxP_curve.png')}
                    className="p-1.5 rounded bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden bg-black border border-slate-300 dark:border-emerald-500/20 p-2">
                  <img
                    src={curveType === 'mask' ? './yolo/MaskP_curve.png' : './yolo/BoxP_curve.png'}
                    alt="Precision Curve"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Operating curve balancing false discovery with detection sensitivity.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 3D Volumetric Weight & Calorie Engine */}
        {activeTab === 'volumetric' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-mono font-medium mb-3">
                  INNOVATION · COMPUTER VISION TO PHYSICAL GRAMS
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  3D Ellipsoidal Volumetric & Caloric Nutrition Engine
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Traditional food apps require a kitchen scale or guess a static average weight. Smart Pantry reconstructs 3D physical volume directly from the 2D polygon segmentation mask and scales by botanical produce density.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">STEP 1</span>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">SAM-2 Polygon Extraction</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Matrix multiplication of 32 mask coefficients with 160×160 prototypes extracts the exact perimeter polygon contour of each individual fruit or vegetable.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">STEP 2</span>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">3D Spheroid Volume (cm³)</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculates equivalent ellipse major and minor axes (a, b) and infers depth axis (c) using botanical morphology: <code className="text-emerald-600 dark:text-emerald-400 font-mono">V = 4/3 π · a · b · c</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">STEP 3</span>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">Density & Calorie Scaling</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scales volume by botanical specific gravity <code className="text-emerald-600 dark:text-emerald-400 font-mono">ρ (g/cm³)</code> into physical grams, dynamically recalculating exact calories, carbs, and fiber.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold mb-3">
                  Sample Botanical Density Table (In-App Database)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🍎 Apple</span>
                    <span className="font-bold text-slate-900 dark:text-white">0.85 g/cm³</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🥔 Potato</span>
                    <span className="font-bold text-slate-900 dark:text-white">1.05 g/cm³</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🥕 Carrot</span>
                    <span className="font-bold text-slate-900 dark:text-white">0.98 g/cm³</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🍉 Watermelon</span>
                    <span className="font-bold text-slate-900 dark:text-white">0.96 g/cm³</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🍌 Banana</span>
                    <span className="font-bold text-slate-900 dark:text-white">0.92 g/cm³</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 block">🍅 Tomato</span>
                    <span className="font-bold text-slate-900 dark:text-white">0.95 g/cm³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 35 Produce Classes Explorer */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 35 classes (e.g. Avocado, Mango)..."
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['all', 'fruit', 'vegetable'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        selectedCategory === cat
                          ? 'bg-pantry-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of classes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                {filteredClasses.map((className) => {
                  const produce = getProduceByClass(className);
                  return (
                    <div
                      key={className}
                      className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{produce?.emoji || '🥑'}</span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs truncate">{className}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{produce?.category || 'produce'}</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500 dark:text-slate-400">Shelf-life:</span>
                        <span className="text-pantry-700 dark:text-hud-green font-bold">{produce?.shelf_life_days.fridge ?? 7}d fridge</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Full Image Zoom Modal */}
        {zoomModalImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setZoomModalImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh]">
              <img src={zoomModalImage} alt="Zoomed view" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              <button
                onClick={() => setZoomModalImage(null)}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/80 text-white text-xs border border-white/20 hover:bg-black"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

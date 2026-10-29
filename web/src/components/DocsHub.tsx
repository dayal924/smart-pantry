import React, { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';

export const DocsHub: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'quickstart' | 'parity' | 'selftest' | 'sync'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="docs" className="py-20 lg:py-32 relative bg-slate-50 dark:bg-[#0B120D] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 text-xs font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            ENGINEERING SPECIFICATIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Documentation & How It Works
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Everything you need to understand, run, verify, and deploy the Smart Pantry ecosystem.
          </p>
        </div>

        {/* Documentation Tab Nav */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'quickstart', label: '1. Quickstart & Deployment' },
            { id: 'parity', label: '2. Preprocessing & Parity' },
            { id: 'selftest', label: '3. Mobile Self-Test' },
            { id: 'sync', label: '4. Offline Sync Contract' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDoc(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeDoc === tab.id
                  ? 'bg-pantry-600 text-white shadow-md shadow-pantry-500/20 border border-emerald-400/40'
                  : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Document Content Box */}
        <div className="bg-white dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto shadow-xl dark:shadow-2xl transition-colors">
          {/* Doc 1: Quickstart */}
          {activeDoc === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Full Stack Setup & Launch</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  The model is already bundled in this repository. Follow these commands to launch the backend and mobile development build.
                </p>
              </div>

              {/* Backend setup */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-pantry-700 dark:text-emerald-400 font-semibold">
                  <span>STEP 1: FASTAPI BACKEND (DOCKER)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'cd backend && cp .env.example .env && docker compose up --build',
                        'b_setup'
                      )
                    }
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedCode === 'b_setup' ? <Check className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto shadow-inner">
                  cd backend && cp .env.example .env && docker compose up --build
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Interactive Swagger docs available at <code className="text-pantry-700 dark:text-hud-green font-bold">http://localhost:8000/docs</code>.
                </p>
              </div>

              {/* Mobile setup */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-pantry-700 dark:text-emerald-400 font-semibold">
                  <span>STEP 2: REACT NATIVE DEV BUILD</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'cd mobile && cp .env.example .env && npm install && npx expo run:android',
                        'm_setup'
                      )
                    }
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {copiedCode === 'm_setup' ? <Check className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto shadow-inner">
                  cd mobile && cp .env.example .env{"\n"}npm install && npx expo run:android
                </pre>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                  <strong>Note:</strong> Because onnxruntime-react-native binds directly to native C++ libraries, a native build is required (Expo Go does not support custom native ONNX bindings).
                </div>
              </div>

              {/* Model update */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-pantry-700 dark:text-emerald-400 font-semibold">
                  <span>RETRAINING NEW WEIGHTS?</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto shadow-inner">
                  python ml/install_model.py --onnx new.onnx --version v2
                </pre>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Automatically extracts metadata, updates <code className="text-pantry-700 dark:text-hud-green font-bold">labels.json</code>, and bundles the model.
                </p>
              </div>
            </div>
          )}

          {/* Doc 2: Parity Discovery */}
          {activeDoc === 'parity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why Detection Used to Mismatch — And What is Applied Now</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  The technical discovery that fixed mobile detection accuracy.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Typical mobile tutorials stretch incoming photos to 640×640. Ultralytics' <code className="text-pantry-700 dark:text-hud-green font-bold">predict()</code> engine instead keeps the aspect ratio and pads with grey 114 only up to a multiple of 32.
                </p>
                <p>
                  Measured on the YOLOv8m ONNX model: the naive stretch moves pixel values by an average of <strong>37 gray levels</strong>, causing 3 out of 20 photos to completely miss or flip labels.
                </p>
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-black/60 text-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Step</th>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Smart Pantry Implementation</th>
                      <th className="p-3 border-b border-slate-200 dark:border-white/10">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Color/Scale</td>
                      <td className="p-3">RGB, ÷255, CHW channel order</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">Standardized float tensor</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Resize</td>
                      <td className="p-3">Aspect-preserving (never stretch), long side 640</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">No geometric distortion</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Padding</td>
                      <td className="p-3">Grey 114, rectangular (e.g. 4:3 → 640×480)</td>
                      <td className="p-3 text-pantry-700 dark:text-hud-green font-bold">25–45% faster inference</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">Decoder</td>
                      <td className="p-3">Conf filter → Class-aware NMS (iou 0.45) → Un-letterbox</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-semibold">Precise screen bounding boxes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/10 text-xs font-mono text-emerald-300 shadow-inner">
                npm run test:golden # Verifies TS decoder == Python reference across 16 shapes
              </div>
            </div>
          )}

          {/* Doc 3: Mobile Self-Test */}
          {activeDoc === 'selftest' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Accuracy on Your Phone (30 Seconds)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  How the mobile app ensures on-device inference matches server ground truth.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Inside the mobile app, go to <strong>Settings → Detection self-test</strong>. It executes 3 bundled benchmark photos through the live native ONNX pipeline on your phone and verifies that detected classes and IoUs meet strict parity thresholds:
                </p>

                <ul className="space-y-2 pl-4 list-disc text-slate-700 dark:text-slate-300">
                  <li><strong>Minimum Class Match:</strong> ≥ 75%</li>
                  <li><strong>Mean IoU with Golden Reference:</strong> ≥ 0.90</li>
                  <li><strong>Confidence Score Match:</strong> ≥ 0.60</li>
                </ul>

                <p>
                  Want to benchmark with your own custom images? Generate a new self-test bundle with:
                </p>
                <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto shadow-inner">
                  python ml/make_selftest.py --images valid1.jpg valid2.jpg valid3.jpg
                </pre>
              </div>
            </div>
          )}

          {/* Doc 4: Offline Sync */}
          {activeDoc === 'sync' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Offline-First Synchronization Protocol</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  How inventory changes stay reliable across offline grocery stores and poor connectivity.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Smart Pantry follows an <strong>optimistic, offline-first design pattern</strong>:
                </p>

                <ol className="space-y-2.5 pl-4 list-decimal text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Immediate Local Persistence:</strong> Every confirmed scan is instantly committed to device storage (AsyncStorage/SQLite). The pantry UI updates without waiting for network response.
                  </li>
                  <li>
                    <strong>Durable Sync Queue:</strong> Pending sync payloads are appended to an outbox queue with idempotent client timestamps.
                  </li>
                  <li>
                    <strong>Background Replay:</strong> As soon as internet connectivity returns, the sync worker executes <code className="text-pantry-700 dark:text-hud-green font-bold">POST /inventory/sync</code>.
                  </li>
                  <li>
                    <strong>Conflict Resolution:</strong> Last-write-wins based on monotonic server revision numbers guarantees no data loss or inventory drift.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Layers, Database, Smartphone, Cpu, Cloud, Code2, Terminal } from 'lucide-react';

export const Architecture: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState<'sync' | 'copilot' | 'telemetry' | 'ota'>('sync');

  const endpoints = {
    sync: {
      method: 'POST',
      path: '/inventory/sync',
      desc: 'Idempotent last-write-wins inventory sync. Commits locally queued scan items to user’s MongoDB collection.',
      request: `{
  "client_timestamp": "2026-10-29T12:00:00Z",
  "items": [
    {
      "produce_id": "apple",
      "qty": 3,
      "storage": "fridge",
      "estimated_expiry": "2026-11-26T12:00:00Z",
      "confidence": 0.942
    }
  ]
}`,
      response: `{
  "status": "success",
  "synced_count": 1,
  "server_revision": 42,
  "urgent_expiries": []
}`,
    },
    copilot: {
      method: 'POST',
      path: '/copilot/recipe-suggest',
      desc: 'Intelligent recipe matcher finding meals that use currently expiring produce to eliminate waste.',
      request: `{
  "current_inventory": ["apple", "carrot", "onion"],
  "dietary_pref": "vegetarian",
  "max_prep_mins": 30
}`,
      response: `{
  "recipe_id": "fresh_apple_carrot_slaw",
  "title": "Crisp Apple & Carrot Slaw",
  "matching_ingredients": ["apple", "carrot"],
  "missing_pantry": ["lemon_juice", "olive_oil"],
  "waste_prevention_score": 0.88
}`,
    },
    telemetry: {
      method: 'POST',
      path: '/telemetry/scan-corrections',
      desc: 'Anonymous user corrections captured in the Review HUD for continual active-learning dataset expansion.',
      request: `{
  "model_version": "v1-50ep",
  "original_class": "melon",
  "original_confidence": 0.42,
  "corrected_class": "watermelon",
  "device_platform": "android-arm64"
}`,
      response: `{
  "logged": true,
  "queue_depth": 142
}`,
    },
    ota: {
      method: 'GET',
      path: '/models/latest-manifest',
      desc: 'Over-the-air check for updated ONNX quantization profiles or retrained model versions.',
      request: `// Header: If-None-Match: "v1-50ep"`,
      response: `{
  "latest_version": "v1-50ep",
  "download_url": "https://cdn.smartpantry.ai/models/detector_v1.onnx",
  "checksum_sha256": "4b5d89f81a...",
  "min_app_version": "1.0.0"
}`,
    },
  };

  return (
    <section id="architecture" className="py-20 lg:py-32 relative bg-white dark:bg-[#0B120D] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/20 text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            SYSTEM ARCHITECTURE & PIPELINES
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Hybrid Edge-Cloud Architecture
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Built with modern standards: Native ONNX bindings on the client and asynchronous Python microservices in the cloud.
          </p>
        </div>

        {/* System Data Flow Pipeline Diagram */}
        <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-pantry-600 dark:text-hud-green" />
                End-to-End Pipeline Data Flow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zero cloud dependence during photo capture and object classification.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-pantry-100 dark:bg-pantry-500/20 text-pantry-800 dark:text-emerald-300 font-mono hidden sm:inline font-semibold">
              Ultralytics Replica
            </span>
          </div>

          {/* Interactive Flow Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-emerald-500/30 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">01 · CAPTURE</span>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Camera / Gallery</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Photo acquired via Expo ImagePicker; aspect ratio strictly preserved.</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
                Aspect-keeping CHW
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-emerald-500/30 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-pantry-700 dark:text-hud-green font-bold">02 · PREPROCESS</span>
                <Cpu className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Rect-Letterbox Pad</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pad with grey 114 to multiple of 32 (e.g. 640×480). 25–45% faster.</p>
              </div>
              <div className="text-[10px] font-mono text-pantry-700 dark:text-hud-green pt-2 border-t border-slate-100 dark:border-white/5 font-semibold">
                Stops 37 gray-level loss
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-emerald-500/30 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">03 · ON-DEVICE ML</span>
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">ONNX Runtime Native</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Bundled detector.onnx runs on CPU/NNAPI. Class-aware NMS at IoU 0.45.</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5">
                100% on-phone inference
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-teal-500/30 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold">04 · CLOUD SYNC</span>
                <Cloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">FastAPI + MongoDB</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">User confirms inventory in Review HUD. Async sync to MongoDB.</p>
              </div>
              <div className="text-[10px] font-mono text-teal-700 dark:text-teal-400 pt-2 border-t border-slate-100 dark:border-white/5 font-semibold">
                Offline queue & retry
              </div>
            </div>
          </div>
        </div>

        {/* Interactive API Explorer */}
        <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-xl dark:shadow-2xl transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
              Interactive API Contract Explorer
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">FastAPI Swagger 3.0</span>
          </div>

          {/* Endpoint Selector Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
            {(Object.keys(endpoints) as Array<keyof typeof endpoints>).map((key) => {
              const ep = endpoints[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveEndpoint(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                    activeEndpoint === key
                      ? 'bg-pantry-600 text-white font-bold shadow-sm'
                      : 'bg-slate-200 dark:bg-black/40 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 dark:bg-black/60 text-white dark:text-emerald-300 font-bold">
                    {ep.method}
                  </span>
                  <span>{ep.path}</span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">{endpoints[activeEndpoint].desc}</p>

          {/* Code Request & Response Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">Request Payload</div>
              <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/5 text-[11px] font-mono text-emerald-300 overflow-x-auto shadow-inner">
                {endpoints[activeEndpoint].request}
              </pre>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">Response JSON (200 OK)</div>
              <pre className="p-3.5 rounded-xl bg-slate-900 dark:bg-black/80 border border-slate-700 dark:border-white/5 text-[11px] font-mono text-teal-300 overflow-x-auto shadow-inner">
                {endpoints[activeEndpoint].response}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

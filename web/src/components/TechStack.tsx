import React, { useState } from 'react';
import { 
  Cpu, 
  Smartphone, 
  Database, 
  Server, 
  Layers, 
  Zap, 
  WifiOff, 
  Terminal, 
  Clock, 
  DollarSign, 
  Lock 
} from 'lucide-react';

export const TechStack: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<'ml' | 'mobile' | 'backend' | 'infra'>('ml');

  const pillars = {
    ml: {
      title: 'Edge Machine Learning & Vision',
      badge: 'Zero Cloud Overhead',
      icon: Cpu,
      color: 'from-emerald-500/20 to-hud-green/10 text-emerald-700 dark:text-hud-green border-emerald-500/30',
      description: 'Ultralytics YOLOv8m exported to ONNX Opset 14, executed locally on the device using native C++ bindings for maximum performance and privacy.',
      specs: [
        { label: 'Model Architecture', value: 'YOLOv8m (Medium Anchor-Free Detector)' },
        { label: 'Export Format', value: 'ONNX Opset 14 (FP32, Dynamic Spatial Axes)' },
        { label: 'Model Size & Compute', value: '103.8 MB · 79.0 GFLOPs · 50 Epochs' },
        { label: 'Execution Provider', value: 'onnxruntime-react-native (CPU / NNAPI / CoreML)' },
        { label: 'Preprocessing', value: 'Aspect-preserving Rectangular Letterbox (pad to 32)' },
        { label: 'Post-Processing', value: 'Class-aware NMS (IoU 0.45) + Dynamic Anchor Decoding' },
        { label: 'Parity Verification', value: 'Golden test suite across 16 photo geometries' },
      ],
      codeSnippet: `// detector.ts — Native C++ ONNX Inference Pipeline
const session = await InferenceSession.create(modelAssetUri);
const tensor = new Tensor('float32', chwFloatData, [1, 3, tensorH, tensorW]);
const feeds = { [session.inputNames[0]]: tensor };
const output = await session.run(feeds);
// Output [1, 39, anchors] -> Class-aware NMS -> Review HUD`,
    },
    mobile: {
      title: 'Mobile Client Architecture',
      badge: 'React Native & Expo SDK 54',
      icon: Smartphone,
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
      description: 'Built with React Native and Expo SDK 54 using TypeScript, delivering a high-performance 60fps HUD interface with offline-first persistence.',
      specs: [
        { label: 'Framework & Core', value: 'React Native 0.76+ · Expo SDK 54' },
        { label: 'Language & Typing', value: 'TypeScript 5.6 (Strict null & type checking)' },
        { label: 'State & Cache', value: 'Lightweight reactive stores + AsyncStorage queue' },
        { label: 'Styling & Theming', value: 'Tailwind CSS / NativeWind tokens with Dark/Light palette' },
        { label: 'Hardware Interop', value: 'Expo Camera, Expo ImagePicker, Expo Notifications' },
        { label: 'Navigation', value: 'Expo Router (File-based typed deep linking)' },
        { label: 'Parity Testing', value: 'Jest unit tests + Golden post-processing verification' },
      ],
      codeSnippet: `// store/pantryStore.ts — Offline-First Optimistic Sync
export const usePantryStore = create<PantryState>((set, get) => ({
  items: [],
  addFromScan: (detections) => {
    // 1. Instantly update local inventory (0ms UI latency)
    set((s) => ({ items: [...s.items, ...detections] }));
    // 2. Queue for asynchronous background sync
    syncQueue.enqueue({ action: 'UPSERT', payload: detections });
  },
}));`,
    },
    backend: {
      title: 'Cloud Backend Microservices',
      badge: 'FastAPI & Python 3.11',
      icon: Server,
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
      description: 'Asynchronous Python ASGI service providing idempotent data synchronization, JWT authentication, culinary recipe matching, and telemetry.',
      specs: [
        { label: 'Web Framework', value: 'FastAPI (Python 3.11 ASGI)' },
        { label: 'ASGI Server', value: 'Uvicorn with high-concurrency event loops' },
        { label: 'Data Validation', value: 'Pydantic v2 schemas with strict type validation' },
        { label: 'Authentication', value: 'OAuth2 Bearer JWT tokens with bcrypt password hashing' },
        { label: 'Recipe Copilot', value: 'Rule-based produce matching + LLM meal planning' },
        { label: 'Telemetry Pipeline', value: 'Anonymous scan-correction aggregation for model retraining' },
        { label: 'Test Suite', value: '12 automated Pytest integration tests' },
      ],
      codeSnippet: `@router.post("/inventory/sync", response_model=SyncResponse)
async def sync_inventory(payload: SyncPayload, user: User = Depends(get_current_user)):
    # Idempotent last-write-wins reconciliation
    updated_count = await inventory_service.merge_client_batch(
        user_id=user.id,
        items=payload.items,
        client_timestamp=payload.client_timestamp
    )
    return SyncResponse(synced_count=updated_count, revision=user.revision)`,
    },
    infra: {
      title: 'Database, Cloud & DevOps',
      badge: 'MongoDB & Docker',
      icon: Database,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
      description: 'Containerized infrastructure supporting cloud database persistence and automated Over-The-Air (OTA) ONNX weight distribution.',
      specs: [
        { label: 'Database', value: 'MongoDB 7.0 with Motor AsyncIO Python driver' },
        { label: 'Replication & Sync', value: 'Idempotent document revisions with TTL indexes' },
        { label: 'Containerization', value: 'Docker & Docker Compose multi-container stack' },
        { label: 'OTA Distribution', value: 'MinIO / S3 compatible model bucket with SHA-256 checks' },
        { label: 'CI/CD & Builds', value: 'GitHub Actions + Expo Application Services (EAS)' },
        { label: 'API Documentation', value: 'OpenAPI 3.0 (Interactive Swagger UI at /docs)' },
        { label: 'Environment Config', value: '12-factor standard via Pydantic BaseSettings' },
      ],
      codeSnippet: `# docker-compose.yml — Reproducible Production Stack
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [mongo]
  mongo:
    image: mongo:7.0
    volumes: [mongo_data:/data/db]
    ports: ["27017:27017"]`,
    },
  };

  const activePillarData = pillars[selectedPillar];

  return (
    <section id="techstack" className="py-20 lg:py-32 relative bg-slate-50 dark:bg-[#0B120D] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            ENGINEERING FOUNDATIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Full-Stack Technology Stack
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            A modular architecture blending on-device native C++ neural runtimes with reactive mobile clients and asynchronous cloud services.
          </p>
        </div>

        {/* 4 Pillars Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {(Object.keys(pillars) as Array<keyof typeof pillars>).map((key) => {
            const p = pillars[key];
            const Icon = p.icon;
            const isSelected = selectedPillar === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPillar(key)}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between space-y-3 shadow-sm ${
                  isSelected
                    ? 'bg-white dark:bg-[#101F14] border-pantry-600 dark:border-hud-green shadow-md shadow-pantry-500/15 scale-[1.02]'
                    : 'bg-white/80 dark:bg-[#0E1711] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#121E16]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.color} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-pantry-600 dark:bg-hud-green animate-pulse"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                    {p.title}
                  </h3>
                  <span className="text-[11px] font-mono text-pantry-700 dark:text-emerald-400 block mt-1 font-semibold">
                    {p.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Deep Dive Card */}
        <div className="bg-white dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl mb-16 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Specs & Capabilities */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-mono text-pantry-700 dark:text-hud-green uppercase font-semibold">
                  Component Architecture
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {activePillarData.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed">
                  {activePillarData.description}
                </p>
              </div>

              {/* Detailed Specs Table */}
              <div className="space-y-2 pt-2">
                {activePillarData.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <span className="font-mono text-slate-600 dark:text-slate-400 font-medium">
                      {spec.label}
                    </span>
                    <span className="font-semibold text-pantry-800 dark:text-emerald-300 sm:text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                  <Terminal className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
                  Production Implementation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">Source Verified</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 dark:bg-black/90 border border-slate-700 dark:border-emerald-500/30 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                {activePillarData.codeSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Cloud Vision vs. Smart Pantry Edge AI Comparison Matrix */}
        <div className="bg-white dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl transition-colors">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Why Edge AI? Architecture Comparison
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Comparing Smart Pantry's bundled on-device model with typical cloud-based AI vision systems.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-black/60 text-slate-700 dark:text-slate-300 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10">Metric / Architecture</th>
                  <th className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">Traditional Cloud Vision</th>
                  <th className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 text-pantry-700 dark:text-hud-green font-bold">Smart Pantry (On-Device Edge)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Detection Latency
                  </td>
                  <td className="p-3 sm:p-4 text-red-600 dark:text-red-300">800ms – 2,500ms (Network roundtrip + GPU queue)</td>
                  <td className="p-3 sm:p-4 text-pantry-700 dark:text-hud-green font-mono font-bold">38ms – 90ms (Instant on-device C++)</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    User Privacy
                  </td>
                  <td className="p-3 sm:p-4 text-slate-500 dark:text-slate-400">Photos uploaded to remote cloud servers</td>
                  <td className="p-3 sm:p-4 text-pantry-700 dark:text-hud-green font-bold">100% Private (0 bytes leave device)</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Offline Reliability
                  </td>
                  <td className="p-3 sm:p-4 text-red-600 dark:text-red-300">Completely broken without WiFi / Cellular</td>
                  <td className="p-3 sm:p-4 text-pantry-700 dark:text-hud-green font-bold">Fully functional offline & in basements</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    Server Compute Cost
                  </td>
                  <td className="p-3 sm:p-4 text-slate-500 dark:text-slate-400">High ongoing cloud GPU API bills per user</td>
                  <td className="p-3 sm:p-4 text-pantry-700 dark:text-hud-green font-bold">$0 API cost (Runs on client hardware)</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Preprocessing Parity
                  </td>
                  <td className="p-3 sm:p-4 text-slate-500 dark:text-slate-400">Commonly stretched to 640×640 (37 gray-level loss)</td>
                  <td className="p-3 sm:p-4 text-pantry-700 dark:text-hud-green font-bold">Aspect-preserving letterbox with grey 114 pad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

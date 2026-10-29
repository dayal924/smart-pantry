import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Smartphone, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Scan, 
  Clock 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroProps {
  onOpenDownloadModal?: () => void;
  onExploreFeatures?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDownloadModal, onExploreFeatures }) => {
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [inferenceMs, setInferenceMs] = useState(38);

  // Realistic, perfectly spaced non-overlapping produce targets
  const detectedItems = [
    { 
      id: 'apple',
      name: 'Apple', 
      conf: '96.4%', 
      freshness: '28d Shelf-life',
      kcal: '~52 kcal',
      color: 'border-emerald-400 bg-emerald-500/15 text-emerald-200', 
      glow: 'shadow-[0_0_22px_rgba(52,211,153,0.5)]',
      emoji: '🍎', 
      x: '10%', 
      y: '18%', 
      w: '40%', 
      h: '24%' 
    },
    { 
      id: 'orange',
      name: 'Orange', 
      conf: '94.2%', 
      freshness: '21d Shelf-life',
      kcal: '~47 kcal',
      color: 'border-amber-400 bg-amber-500/15 text-amber-200', 
      glow: 'shadow-[0_0_22px_rgba(251,191,36,0.5)]',
      emoji: '🍊', 
      x: '54%', 
      y: '22%', 
      w: '38%', 
      h: '24%' 
    },
    { 
      id: 'avocado',
      name: 'Avocado', 
      conf: '97.8%', 
      freshness: '7d Shelf-life',
      kcal: '~160 kcal',
      color: 'border-hud-green bg-hud-green/15 text-emerald-100', 
      glow: 'shadow-[0_0_25px_rgba(0,255,102,0.6)]',
      emoji: '🥑', 
      x: '12%', 
      y: '48%', 
      w: '38%', 
      h: '24%' 
    },
    { 
      id: 'tomato',
      name: 'Tomato', 
      conf: '93.5%', 
      freshness: '10d Shelf-life',
      kcal: '~18 kcal',
      color: 'border-rose-400 bg-rose-500/15 text-rose-200', 
      glow: 'shadow-[0_0_22px_rgba(251,113,133,0.5)]',
      emoji: '🍅', 
      x: '54%', 
      y: '50%', 
      w: '38%', 
      h: '23%' 
    },
  ];

  // Subtle telemetry jitter simulating real-time ONNX execution (35ms - 41ms)
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setActiveBoxIndex((prev) => (prev + 1) % detectedItems.length);
    }, 2800);

    const jitterTimer = setInterval(() => {
      setInferenceMs(35 + Math.floor(Math.random() * 6));
    }, 1200);

    return () => {
      clearInterval(cycleTimer);
      clearInterval(jitterTimer);
    };
  }, [detectedItems.length]);

  const handleDownloadClick = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF66', '#2E7D32', '#66BB6A', '#A5D6A7'],
    });
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else {
      const el = document.getElementById('download');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeItem = detectedItems[activeBoxIndex];

  return (
    <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-28 overflow-hidden bg-slate-50 dark:bg-transparent transition-colors duration-200">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/10 dark:bg-emerald-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-pantry-400/10 dark:bg-pantry-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Value Prop */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 shadow-sm transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-hud-green animate-ping" />
              <span className="font-semibold tracking-wide uppercase font-mono text-[11px]">
                Bundle & Run YOLOv8m On-Device
              </span>
              <span className="text-slate-400 dark:text-slate-500">|</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">FastAPI + MongoDB</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance transition-colors">
              Zero-Cloud Edge AI For Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-pantry-600 to-teal-500 dark:from-emerald-400 dark:via-hud-green dark:to-lime-300">Smart Pantry</span>
            </h1>

            {/* Body */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal transition-colors">
              <strong className="text-slate-900 dark:text-white">Detection never touches the backend.</strong> Online or offline, the bundled 
              <span className="text-pantry-700 dark:text-white font-semibold"> YOLOv8m ONNX model</span> runs directly inside your phone's native runtime. Instant produce recognition, shelf-life spoilage calculation, and intelligent culinary recipes.
            </p>

            {/* Micro value badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg shadow-sm">
                <WifiOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>100% Offline Capable</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg shadow-sm">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Private Produce Vision</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg shadow-sm">
                <Zap className="w-4 h-4 text-amber-500 dark:text-yellow-400" />
                <span>35 Trained Classes</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={handleDownloadClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-pantry-600 via-emerald-600 to-pantry-500 hover:from-pantry-500 hover:to-emerald-400 shadow-xl shadow-pantry-600/30 hover:shadow-hud-green/30 border border-emerald-400/40 flex items-center justify-center gap-2.5 transition-all duration-300 group"
              >
                <Smartphone className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                <span>Download Android APK</span>
                <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
                <span>Explore App Features</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">92.1%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">mAP@50 Val Score</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-black text-pantry-700 dark:text-hud-green font-mono">104 MB</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">YOLOv8m ONNX</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">0 ms</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Cloud Detection Ping</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Tech Animated Smartphone Camera HUD */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[320px] sm:w-[355px] aspect-[9/18.5] bg-[#0A100C] rounded-[44px] p-3 shadow-2xl shadow-emerald-950/50 border-4 border-slate-800 ring-1 ring-emerald-500/40">
              {/* Phone Speaker & Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3 border border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-blue-500/60"></span>
                </div>
                <span className="w-8 h-1 rounded-full bg-slate-800"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-hud-green/80 animate-pulse"></span>
              </div>

              {/* Inner Smartphone Screen */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[#0A100C] flex flex-col justify-between border border-emerald-500/30">
                {/* Crisp Grocery / Pantry Camera Scene */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="./assets/phone-scanner-bg.jpg"
                    alt="Pantry Camera Stream"
                    className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.08] transition-all"
                  />
                  {/* Subtle vignette and cinematic scan grid */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(#00FF66_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
                </div>

                {/* Sweeping Laser Beam Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-hud-green to-transparent opacity-90 animate-scan-line z-20 shadow-[0_0_18px_#00FF66]" />

                {/* Camera Viewfinder Static Corner Brackets */}
                <div className="absolute inset-4 pointer-events-none z-10 border border-white/10 rounded-2xl">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
                </div>

                {/* Top HUD Telemetry Bar */}
                <div className="relative z-20 pt-6 px-4 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                  <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-hud-green animate-ping"></span>
                    <span className="font-semibold text-white">YOLOv8m · ONNX</span>
                  </div>
                  <div className="bg-black/75 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 text-slate-200 flex items-center gap-1.5 shadow-md">
                    <Activity className="w-3 h-3 text-hud-green" />
                    <span className="font-bold text-hud-green">{inferenceMs}ms</span>
                  </div>
                </div>

                {/* Real Non-Overlapping Interactive Bounding Boxes */}
                <div className="absolute inset-0 z-10 p-4">
                  {detectedItems.map((item, idx) => {
                    const isActive = idx === activeBoxIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveBoxIndex(idx)}
                        style={{
                          left: item.x,
                          top: item.y,
                          width: item.w,
                          height: item.h,
                        }}
                        className={`absolute rounded-xl border-2 transition-all duration-300 cursor-pointer pointer-events-auto ${
                          item.color
                        } ${
                          isActive
                            ? `scale-105 ${item.glow} z-20 border-hud-green`
                            : 'opacity-70 hover:opacity-100 z-10'
                        }`}
                      >
                        {/* High-tech corner reticle markers */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                        {/* Pulse ping when active */}
                        {isActive && (
                          <span className="absolute inset-0 rounded-xl border border-hud-green animate-ping opacity-30 pointer-events-none" />
                        )}

                        {/* Lock-on Badge Header */}
                        <div className="absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/90 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-xl">
                          <span>{item.emoji}</span>
                          <span>{item.name}</span>
                          <span className={isActive ? 'text-hud-green' : 'text-slate-300'}>
                            {item.conf}
                          </span>
                        </div>

                        {/* Active Item Mini Subtitle Card */}
                        {isActive && (
                          <div className="absolute -bottom-5 left-0 right-0 flex justify-center">
                            <span className="px-1.5 py-0.2 rounded bg-black/85 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 shadow-md">
                              {item.freshness}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom HUD Control Deck & Quick Sync */}
                <div className="relative z-20 pb-3 px-3 space-y-2">
                  <div className="bg-black/85 backdrop-blur-md p-3 rounded-2xl border border-white/10 space-y-2 shadow-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                        <Scan className="w-3 h-3 text-hud-green" />
                        <span>PREPROCESSING</span>
                      </span>
                      <span className="text-hud-green font-mono text-[10px] font-bold">
                        RECT-LETTERBOX (÷255)
                      </span>
                    </div>

                    {/* Detected items carousel pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {detectedItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveBoxIndex(idx)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all ${
                            idx === activeBoxIndex
                              ? 'bg-hud-green text-black font-bold ring-1 ring-white/50'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          <span>{item.emoji}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active Produce Shelf-life Meter */}
                    <div className="pt-1 flex items-center justify-between text-[11px] border-t border-white/10">
                      <div className="flex items-center gap-1 text-slate-300 truncate">
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{activeItem.name}: {activeItem.freshness} ({activeItem.kcal})</span>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-pantry-600 hover:bg-pantry-500 text-white text-[10px] font-bold shrink-0 shadow-md transition-colors">
                        Confirm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

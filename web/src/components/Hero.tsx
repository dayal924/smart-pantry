import React from 'react';
import { 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  ChefHat,
  Cpu,
  ShoppingBag,
  Flame,
  Search,
  Bell,
  SlidersHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroProps {
  onOpenDownloadModal?: () => void;
  onExploreFeatures?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDownloadModal, onExploreFeatures }) => {
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

  return (
    <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-28 overflow-hidden bg-slate-50 dark:bg-transparent transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/10 dark:bg-emerald-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-10 w-[400px] h-[400px] bg-pantry-400/10 dark:bg-pantry-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Value Prop */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 shadow-sm transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-hud-green" />
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
              <strong className="text-slate-900 dark:text-white">Detection never touches the cloud.</strong> Online or offline, the bundled 
              <span className="text-pantry-700 dark:text-white font-semibold"> YOLOv8m ONNX model</span> runs locally inside your phone's native runtime. Instant produce recognition, automated shelf-life calculation, and intelligent recipe recommendations.
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

          {/* Right Column: Clean, Authentic Mobile App Interface Preview (Zero Gimmicky Animations) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-[320px] sm:w-[360px] bg-[#0A110C] rounded-[48px] p-3 shadow-2xl shadow-emerald-950/60 border-4 border-slate-800 ring-2 ring-emerald-500/30">
              {/* Phone Speaker & Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-30 flex items-center justify-between px-3.5 border border-white/10 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-blue-500/80"></span>
                </div>
                <span className="w-9 h-1 rounded-full bg-slate-800"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              {/* Inner Smartphone Screen Content */}
              <div className="relative w-full rounded-[38px] overflow-hidden bg-[#0D1510] border border-white/10 p-4 pt-10 space-y-4 text-white font-sans">
                
                {/* App Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥑</span>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-white leading-none">Smart Pantry</h3>
                      <p className="text-[10px] font-mono text-emerald-400 pt-0.5">YOLOv8m Edge · 38ms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-full text-[10px] font-mono text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Offline</span>
                  </div>
                </div>

                {/* Freshness Health Metric Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-slate-900/90 border border-emerald-500/30 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-hud-green" />
                      <span>Pantry Freshness Index</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-hud-green">94%</span>
                  </div>

                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-emerald-500 to-hud-green h-full rounded-full w-[94%]" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                    <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                      <div className="font-bold text-white text-xs">14</div>
                      <div className="text-slate-400 text-[9px]">Active Items</div>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                      <div className="font-bold text-amber-400 text-xs">2</div>
                      <div className="text-slate-400 text-[9px]">Use Soon</div>
                    </div>
                    <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
                      <div className="font-bold text-emerald-400 text-xs">0</div>
                      <div className="text-slate-400 text-[9px]">Expired</div>
                    </div>
                  </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-200">Active Inventory</span>
                  <span className="text-[10px] font-mono text-emerald-400">35 Classes</span>
                </div>

                {/* Clean Authentic Produce Item Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🫑</span>
                      <div>
                        <div className="font-semibold text-xs text-white">Capsicum (Red)</div>
                        <div className="text-[10px] text-slate-400">Crisper Drawer · 8°C</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold">
                        14d Left
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono pt-0.5">96.4% conf</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🥒</span>
                      <div>
                        <div className="font-semibold text-xs text-white">Cucumber</div>
                        <div className="text-[10px] text-slate-400">Vegetable Bin · 10°C</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold">
                        10d Left
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono pt-0.5">94.8% conf</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍎</span>
                      <div>
                        <div className="font-semibold text-xs text-white">Royal Gala Apple</div>
                        <div className="text-[10px] text-slate-400">Fruit Basket · Room Temp</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold">
                        24d Left
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono pt-0.5">97.2% conf</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🥑</span>
                      <div>
                        <div className="font-semibold text-xs text-white">Hass Avocado</div>
                        <div className="text-[10px] text-slate-400">Pantry Shelf · Ripe</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-semibold">
                        4d Left
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono pt-0.5">95.5% conf</div>
                    </div>
                  </div>
                </div>

                {/* Smart Culinary AI Recipe Match Card */}
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white leading-tight">Mediterranean Ratatouille</div>
                      <div className="text-[10px] text-slate-400">Matches 4 pantry items</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Bottom App Navigation Mockup */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-around text-slate-400 text-[10px]">
                  <div className="text-emerald-400 flex flex-col items-center gap-0.5 font-semibold">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pantry</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-white">
                    <ChefHat className="w-4 h-4" />
                    <span>Recipes</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-white">
                    <Smartphone className="w-4 h-4" />
                    <span>Scan</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-white">
                    <Clock className="w-4 h-4" />
                    <span>History</span>
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

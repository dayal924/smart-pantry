import React from 'react';
import { Smartphone, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenDownloadModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDownloadModal }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070C08] text-slate-600 dark:text-slate-400 text-xs py-12 lg:py-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pantry-600 to-emerald-400 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white dark:bg-[#0E1A11] rounded-[10px] flex items-center justify-center text-lg">
                  🥑
                </div>
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Smart Pantry</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Edge AI produce detection running 100% on-device with Ultralytics YOLOv8m. Zero cloud detection latency, instant shelf-life tracking, and smart recipe generation.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-pantry-700 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-pantry-600 dark:bg-hud-green animate-pulse"></span>
              <span>ONNX Runtime · Expo SDK 54 · FastAPI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  App Features & Urgency Engine
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('metrics')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  YOLO 50-Epoch Benchmarks
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('techstack')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Full Technology Stack
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  System Architecture & Pipelines
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('docs')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Quickstart Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Download & Mobile */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Android APK</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download and sideload directly onto any Android 9.0+ smartphone.
            </p>
            <button
              onClick={() => {
                if (onOpenDownloadModal) onOpenDownloadModal();
                else scrollTo('download');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-pantry-600 hover:bg-pantry-500 flex items-center gap-2 border border-emerald-400/30 transition-all shadow-md shadow-pantry-600/20"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get smart-pantry-v1.0.apk</span>
            </button>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} Smart Pantry Project. Built with React Native, FastAPI, and Ultralytics YOLOv8.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
              On-Device Privacy Guaranteed
            </span>
            <span>·</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

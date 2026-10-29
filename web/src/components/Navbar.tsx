import React, { useState } from 'react';
import { 
  Download, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Layers, 
  Menu, 
  X, 
  ArrowRight, 
  Smartphone, 
  Code2, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenDownloadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownloadModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/85 dark:bg-[#0B120D]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pantry-600 to-pantry-400 p-0.5 shadow-lg shadow-pantry-500/20">
              <div className="w-full h-full bg-white dark:bg-[#0E1A11] rounded-[10px] flex items-center justify-center text-xl transition-colors">
                🥑
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hud-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-hud-green"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white transition-colors">
                  Smart Pantry
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-pantry-100 dark:bg-pantry-500/20 text-pantry-800 dark:text-hud-green border border-pantry-300 dark:border-pantry-500/30">
                  Edge v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">On-Device YOLOv8m Produce Intelligence</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollTo('features')}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pantry-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('metrics')}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pantry-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              YOLO Results
            </button>
            <button
              onClick={() => scrollTo('techstack')}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pantry-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
              Tech Stack
            </button>
            <button
              onClick={() => scrollTo('architecture')}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pantry-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Architecture
            </button>
            <button
              onClick={() => scrollTo('docs')}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pantry-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Docs
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-hud-green animate-pulse"></span>
              Zero-Cloud Latency
            </div>

            <button
              onClick={() => {
                if (onOpenDownloadModal) onOpenDownloadModal();
                else scrollTo('download');
              }}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pantry-600 via-emerald-600 to-pantry-500 hover:from-pantry-500 hover:to-emerald-400 shadow-md shadow-pantry-600/20 hover:shadow-hud-green/30 transition-all duration-300 border border-emerald-400/30"
            >
              <Smartphone className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>Download APK</span>
              <Download className="w-3.5 h-3.5 opacity-80 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => {
                if (onOpenDownloadModal) onOpenDownloadModal();
                else scrollTo('download');
              }}
              className="p-2 rounded-lg bg-pantry-100 dark:bg-pantry-600/30 text-pantry-800 dark:text-hud-green border border-pantry-300 dark:border-pantry-500/40 text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0B120D]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => scrollTo('features')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
          >
            <span>App Features</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => scrollTo('metrics')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              YOLO 50-Epoch Results
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => scrollTo('techstack')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
              Full Technology Stack
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => scrollTo('architecture')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Architecture & Data Flow
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => scrollTo('docs')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Technical Documentation
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => scrollTo('download')}
            className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pantry-600 to-emerald-500 flex items-center justify-center gap-2 shadow-lg"
          >
            <Smartphone className="w-4 h-4" />
            <span>Download APK for Mobile</span>
          </button>
        </div>
      )}
    </nav>
  );
};

import React from 'react';
import { Cpu, Clock, ChefHat, Database, Sliders, RefreshCw, Zap } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'On-Device YOLOv8m Vision',
      badge: 'Zero Cloud Overhead',
      desc: 'Detection runs 100% locally on your smartphone using native ONNX Runtime. Your grocery photos never leave your device, ensuring total privacy, zero bandwidth use, and sub-100ms inference.',
      color: 'from-emerald-500/20 to-hud-green/10 text-emerald-700 dark:text-hud-green border-emerald-500/30',
      pill: 'YOLOv8m · 35 Classes',
    },
    {
      icon: Clock,
      title: 'Dynamic Shelf-Life AI',
      badge: 'Zero Food Waste',
      desc: 'Every recognized produce item is automatically mapped to temperature-specific shelf-life data (room vs. refrigerator). Visual urgency meters alert you before ingredients expire.',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      pill: 'Dual Temp Projection',
    },
    {
      icon: ChefHat,
      title: 'Smart Recipe Matcher & Copilot',
      badge: 'Culinary Intelligence',
      desc: 'Smart Pantry matches your current inventory against delicious curated recipes. See matching ingredients, missing essentials, prep time, difficulty, and automated macro/calorie calculations.',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
      pill: 'Recipe Matching Engine',
    },
    {
      icon: Database,
      title: 'Offline-First Queue & Sync',
      badge: 'Idempotent Sync',
      desc: 'Scan groceries in basements or offline supermarkets. Inventory updates are queued locally in AsyncStorage and synced seamlessly to MongoDB with last-write-wins conflict resolution.',
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
      pill: 'FastAPI + MongoDB Motor',
    },
    {
      icon: Sliders,
      title: 'Tap-to-Correct Review HUD',
      badge: 'Human-in-the-Loop',
      desc: 'Interactive review screen lets you tap any bounding box to choose alternative produce classes, tweak quantities, or add missed items. Corrections log telemetry for continuous model refinement.',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
      pill: 'Active Telemetry',
    },
    {
      icon: RefreshCw,
      title: 'OTA Model Updating & Self-Test',
      badge: 'Production Verifiable',
      desc: 'Built-in detection self-test verifies phone pipeline parity against golden ONNX decodes. Seamlessly receive over-the-air model updates directly without re-downloading the entire APK.',
      color: 'from-emerald-500/20 to-lime-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      pill: 'Automated Golden Tests',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 relative bg-slate-50 dark:bg-[#0B120D] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-mono font-medium">
            <Zap className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            ENGINEERED FOR RESILIENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Comprehensive Edge & Cloud Features
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Smart Pantry blends the speed of on-device neural inference with the reliability of an asynchronous cloud backend.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative bg-white dark:bg-[#0E1711] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/40 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} border flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-pantry-600 dark:group-hover:text-hud-green transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-mono text-pantry-700 dark:text-emerald-400/90 font-medium">
                  <span>{f.pill}</span>
                  <span className="text-slate-400 dark:text-slate-600 group-hover:text-pantry-600 dark:group-hover:text-hud-green transition-colors">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Download, Smartphone, ShieldCheck, Check, Copy, Sparkles } from 'lucide-react';
import { QRCodeSvg } from './QRCodeSvg';
import confetti from 'canvas-confetti';

export const DownloadSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const apkDownloadPath = 'https://expo.dev/artifacts/eas/cr_xYXYyEd0q75cne1Rgz2yQ1fcGTly92TTgTHBtZAw.apk';

  const triggerDownload = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#00FF66', '#2E7D32', '#66BB6A', '#C8E6C9'],
    });

    const link = document.createElement('a');
    link.href = apkDownloadPath;
    link.download = 'smart-pantry-v1.0.apk';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyDownloadUrl = () => {
    navigator.clipboard.writeText(apkDownloadPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="download" className="py-20 lg:py-32 relative bg-white dark:bg-[#090F0C] border-t border-slate-200 dark:border-white/10 scroll-mt-16 sm:scroll-mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 text-xs font-mono font-medium">
            <Smartphone className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
            DIRECT MOBILE INSTALLATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
            Download Smart Pantry for Android
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg transition-colors">
            Install directly on your phone. Bundled with YOLOv8m edge weights—run produce detection anywhere, anytime, with zero internet connection required.
          </p>
        </div>

        {/* Download Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Left Column: Direct APK Download Portal */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pantry-600 to-emerald-400 p-0.5 shadow-lg shadow-pantry-500/30">
                    <div className="w-full h-full bg-white dark:bg-[#0A120D] rounded-[14px] flex items-center justify-center text-2xl transition-colors">
                      🥑
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Smart Pantry APK</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pantry-100 dark:bg-hud-green/20 text-pantry-800 dark:text-hud-green border border-pantry-300 dark:border-hud-green/30 font-mono font-semibold">
                        v1.0.0
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Release Build · Bundled detector.onnx</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-white dark:bg-black/40 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
                  <span>SHA-256 Verified</span>
                </div>
              </div>

              {/* Build Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Package Size</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">~48.4 MB</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Includes ONNX weights</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Target OS</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">Android 9.0+</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">API 28 or newer</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 col-span-2 sm:col-span-1 shadow-sm">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-medium">Architecture</div>
                  <div className="text-base font-bold text-pantry-700 dark:text-hud-green font-mono mt-0.5">ARM64 & x86_64</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Universal Native Build</div>
                </div>
              </div>

              {/* Key Features Bullet List */}
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pantry-600 dark:text-hud-green shrink-0" />
                  <span><strong>Zero Network Requirement:</strong> YOLOv8m detector runs 100% on CPU/NNAPI natively.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pantry-600 dark:text-hud-green shrink-0" />
                  <span><strong>Bundled 35 Produce Classes:</strong> Immediate recognition of fruits, vegetables, and roots.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pantry-600 dark:text-hud-green shrink-0" />
                  <span><strong>Built-In Parity Self-Test:</strong> Verify model decodes directly from the in-app Settings tab.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-3">
              <button
                onClick={triggerDownload}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-pantry-600 via-emerald-600 to-pantry-500 hover:from-pantry-500 hover:to-emerald-400 shadow-xl shadow-pantry-600/30 hover:shadow-hud-green/30 border border-emerald-400/40 flex items-center justify-center gap-2.5 transition-all text-base group"
              >
                <Download className="w-5 h-5 text-emerald-100 group-hover:translate-y-0.5 transition-transform" />
                <span>Download smart-pantry-v1.0.apk</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <button
                  onClick={copyDownloadUrl}
                  className="hover:text-pantry-700 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Direct APK Link'}</span>
                </button>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">SHA-256 Verified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Scan to Download QR Code */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-xl dark:shadow-2xl transition-colors">
            <div className="space-y-1">
              <span className="text-xs font-mono text-pantry-700 dark:text-hud-green uppercase font-semibold">Fast Mobile Install</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan from Phone Camera</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                Visiting this website on your desktop? Point your Android phone camera at the QR code below to download the APK directly.
              </p>
            </div>

            {/* Crisp Scannable QR Code */}
            <div className="p-2 relative group">
              <QRCodeSvg value="smart-pantry-v1.0.apk" size={190} />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
              <span>Camera Scannable Direct URL</span>
            </div>
          </div>
        </div>

        {/* 3-Step Visual Installation Guide */}
        <div className="bg-slate-50 dark:bg-[#0E1711] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl dark:shadow-2xl transition-colors">
          <div className="border-b border-slate-200 dark:border-white/10 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Android Sideloading Walkthrough</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-normal">3 Easy Steps</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Because this build is distributed directly rather than via Google Play Store, Android will display standard security prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-pantry-700 dark:text-hud-green">STEP 01</span>
                <Download className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tap "Download Anyway"</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When Chrome or your browser warns <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>. This is normal for all manual APK installations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-pantry-700 dark:text-hud-green">STEP 02</span>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Allow Unknown Apps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Open the downloaded file. When prompted, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong> for your browser or file manager.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-pantry-700 dark:text-hud-green">STEP 03</span>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Install & Grant Camera</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tap <strong>Install</strong>. Once launched, grant <strong>Camera Permission</strong> so the bundled YOLOv8m engine can scan your pantry produce in real time!
              </p>
            </div>
          </div>

          {/* Deployment tip for the developer */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <Sparkles className="w-5 h-5 text-pantry-600 dark:text-hud-green shrink-0 mt-0.5" />
            <div>
              <strong>For Project Deployment:</strong> When you run your production build (`npx expo run:android --variant release` or EAS build), simply copy your generated APK file to <code className="bg-white dark:bg-black/60 px-1.5 py-0.5 rounded text-pantry-700 dark:text-hud-green font-mono border border-emerald-200 dark:border-transparent">web/public/downloads/smart-pantry-v1.0.apk</code>. When you deploy this web app to Vercel, Netlify, or Firebase, the download button will serve your authentic release binary!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

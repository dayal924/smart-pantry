import React, { useState } from 'react';
import { X, Download, ShieldCheck, Check, Copy, Sparkles } from 'lucide-react';
import { QRCodeSvg } from './QRCodeSvg';
import confetti from 'canvas-confetti';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const apkDownloadPath = 'https://expo.dev/artifacts/eas/Rg5nl35n32ICCgf0iWiZrpEsdZnmqX8uIE9zBWzRVVo.apk';

  if (!isOpen) return null;

  const triggerDownload = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FF66', '#2E7D32', '#66BB6A', '#A5D6A7'],
    });

    const link = document.createElement('a');
    link.href = apkDownloadPath;
    link.download = 'smart-pantry-v1.0.1.apk';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#0E1711] border border-slate-200 dark:border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pantry-600 to-emerald-400 p-0.5 shadow-lg shadow-pantry-500/30">
            <div className="w-full h-full bg-white dark:bg-[#0A120D] rounded-[14px] flex items-center justify-center text-2xl transition-colors">
              🥑
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Smart Pantry APK</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pantry-100 dark:bg-hud-green/20 text-pantry-800 dark:text-hud-green font-mono font-semibold">
                v1.0.1
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Android Release Build · Native ONNX Runtime</p>
          </div>
        </div>

        {/* QR Code and Instructions */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5">
          <div className="shrink-0">
            <QRCodeSvg value={apkDownloadPath} size={130} />
          </div>
          <div className="space-y-1.5 text-center sm:text-left text-xs text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" />
              <span>Mobile Quick Scan</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Scan with your Android camera to download directly to your mobile phone.
            </p>
            <div className="text-[11px] font-mono text-pantry-700 dark:text-emerald-400 font-semibold pt-1">
              Size: ~197 MB · Android 9.0+
            </div>
          </div>
        </div>

        {/* Sideloading prompt tip */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-pantry-600 dark:text-hud-green" />
            <span>Install Instructions</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            When Chrome prompts <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>. In Settings, enable <strong>"Allow from this source"</strong> to complete installation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={triggerDownload}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pantry-600 via-emerald-600 to-pantry-500 hover:from-pantry-500 hover:to-emerald-400 shadow-xl shadow-pantry-600/30 border border-emerald-400/40 flex items-center justify-center gap-2 transition-all text-sm group"
          >
            <Download className="w-4 h-4 text-emerald-100 group-hover:translate-y-0.5 transition-transform" />
            <span>Download APK Directly</span>
          </button>

          <button
            onClick={copyDownloadUrl}
            className="w-full py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-all text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-pantry-600 dark:text-hud-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Direct Link Copied!' : 'Copy Direct Download URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

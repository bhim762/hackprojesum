import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  QrCode,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwabuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#2D2A4A] via-indigo-900 to-indigo-800 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#2D2A4A] flex items-center justify-center font-extrabold shadow-md shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Outfit']">Download & Install Android App</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  Android APK / PWA
                </span>
              </div>
              <p className="text-xs text-amber-200 mt-0.5">
                Install Student Wand directly on your Android phone or generate an APK file
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
          {/* Quick status if already installed */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <strong className="block font-bold">App is already installed!</strong>
                <span className="text-[11px] text-emerald-700">
                  You can launch Student Wand directly from your phone's Home Screen or App Drawer.
                </span>
              </div>
            </div>
          )}

          {/* Primary Quick Actions for Android */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Native 1-Tap WebAPK Install */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>1-Tap Mobile Install</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Directly installs the native Android app on your device without downloading external files.
                </p>
              </div>

              {installSuccess ? (
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Installed Successfully!</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install on this Device (1-Tap)</span>
                </button>
              ) : isIOS ? (
                <div className="text-[11px] font-semibold text-indigo-700 bg-white/80 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>In Safari: Tap Share (<span className="text-sm">⎙</span>) ➔ &quot;Add to Home Screen&quot;</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App in Chrome</span>
                </button>
              )}
            </div>

            {/* Action 2: Generate Signed APK via PWABuilder */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-sm">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Download .APK Package</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Generate and download a standalone signed <strong>.apk</strong> / <strong>.aab</strong> file for Android.
                </p>
              </div>

              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Generate APK File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* QR Code & Direct Mobile Link Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`}
                alt="Scan to open on Android Phone"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-900">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scan with your Android camera</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Scan this QR code from your mobile phone camera or copy the link below to open directly on Android.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step-by-Step Android Installation Guide (Hindi & English) */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>Android Phone par Install Karne ke Steps</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">Apne phone ke Chrome browser mein link open karein</p>
                  <p className="text-[11px] text-slate-600">Open the app URL in Google Chrome on your Android smartphone.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">Top-right 3-Dots (⋮) menu par click karein</p>
                  <p className="text-[11px] text-slate-600">Tap the 3 dots menu at top right of Chrome browser.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">&quot;Install app&quot; ya &quot;Add to Home screen&quot; dabayein</p>
                  <p className="text-[11px] text-slate-600">
                    Select <strong>Install app</strong>. Google Play Services will automatically generate and install the native Android WebAPK on your phone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>PWA & WebAPK Ready • Works 100% Offline</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { QrCode, CheckCircle2, Copy } from 'lucide-react';

export default function QRCodeDisplay({ pickupCode, status, orderNumber }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isReady = status === 'READY';
  const isPickedUp = status === 'PICKED_UP';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative gradient strip */}
      <div className="absolute top-0 left-0 right-0 h-2 flame-gradient" />

      <div className="mb-3 flex items-center justify-between w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pickup Pass</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
          isReady ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
          isPickedUp ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
        }`}>
          {status}
        </span>
      </div>

      {/* SVG QR Code Simulation */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800/50 p-4 rounded-2xl border border-orange-200/50 dark:border-gray-700 mb-4 streak-glow">
        <svg
          viewBox="0 0 100 100"
          className="w-40 h-40 text-gray-900 dark:text-white"
          fill="currentColor"
        >
          {/* Outer Border */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="3" rx="8" />
          {/* Top-Left Corner Box */}
          <rect x="12" y="12" width="24" height="24" rx="4" />
          <rect x="16" y="16" width="16" height="16" fill="white" />
          <rect x="20" y="20" width="8" height="8" />

          {/* Top-Right Corner Box */}
          <rect x="64" y="12" width="24" height="24" rx="4" />
          <rect x="68" y="16" width="16" height="16" fill="white" />
          <rect x="72" y="20" width="8" height="8" />

          {/* Bottom-Left Corner Box */}
          <rect x="12" y="64" width="24" height="24" rx="4" />
          <rect x="16" y="68" width="16" height="16" fill="white" />
          <rect x="20" y="72" width="8" height="8" />

          {/* Simulated Data Modules */}
          <rect x="42" y="14" width="6" height="6" />
          <rect x="52" y="14" width="6" height="6" />
          <rect x="42" y="24" width="10" height="6" />
          <rect x="14" y="42" width="6" height="6" />
          <rect x="24" y="42" width="12" height="6" />
          <rect x="42" y="42" width="16" height="16" rx="2" fill="#f97316" />
          <rect x="64" y="42" width="8" height="8" />
          <rect x="76" y="42" width="10" height="6" />
          <rect x="42" y="64" width="6" height="12" />
          <rect x="52" y="74" width="12" height="6" />
          <rect x="68" y="64" width="18" height="18" rx="2" />
        </svg>
      </div>

      <p className="text-xs text-gray-500 font-medium mb-1">Pickup Verification Code</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-headline font-black text-2xl tracking-widest text-primary">
          {pickupCode}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Copy Code"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
        {isReady
          ? 'Show this code or QR pass to cafeteria staff at the pickup counter to claim your order.'
          : isPickedUp
          ? 'Order collected cleanly! Enjoy your food.'
          : 'Your QR pass will activate once kitchen marks your food READY.'}
      </p>
    </div>
  );
}

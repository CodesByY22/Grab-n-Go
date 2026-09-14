import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  Shield, 
  Award,
  ExternalLink,
  X
} from 'lucide-react';

export default function ResumeSpecsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-slate-800 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl flame-gradient text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest block">Portfolio & Resume Technical Specification</span>
            <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
              Grab-N-Go Engineering Architecture
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
          
          {/* Resume Impact Highlights */}
          <div className="bg-orange-500/10 dark:bg-orange-500/15 p-5 rounded-2xl border border-orange-500/20 text-gray-900 dark:text-white space-y-2">
            <h4 className="font-headline font-black text-sm text-primary flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Resume Highlights & Metrics</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-xs font-semibold text-gray-700 dark:text-gray-200">
              <li>Architected full-stack campus food pre-ordering SaaS reducing student break wait times by <strong>~65%</strong>.</li>
              <li>Engineered dynamic Smart Queue Algorithm calculating real-time wait times based on kitchen concurrency.</li>
              <li>Implemented Role-Based Access Control (RBAC) supporting <strong>Student</strong>, <strong>Vendor Kanban</strong>, and <strong>Admin Analytics</strong>.</li>
              <li>Integrated Neon Serverless PostgreSQL with indexed foreign-key relational data modeling.</li>
              <li>Built real-time order state machine with WebSockets (`Socket.io`) and automated QR pickup verification.</li>
            </ul>
          </div>

          {/* Tech Stack Diagram */}
          <div>
            <h4 className="font-headline font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Technology Stack</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Frontend</span>
                <span className="font-bold text-gray-900 dark:text-white">React 19 + Vite</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Styling</span>
                <span className="font-bold text-gray-900 dark:text-white">Tailwind CSS v4</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Backend API</span>
                <span className="font-bold text-gray-900 dark:text-white">Node.js + Express</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Database</span>
                <span className="font-bold text-gray-900 dark:text-white">Neon PostgreSQL</span>
              </div>
            </div>
          </div>

          {/* Key Algorithms */}
          <div>
            <h4 className="font-headline font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span>Core Algorithms & Security</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <strong className="text-gray-900 dark:text-white block mb-0.5">Smart Queue Wait Time Formula:</strong>
                <code className="text-primary font-mono text-[11px]">
                  EstimatedWait = Max(3, Round((Sum(ItemPrepTimesAhead) / KitchenConcurrencyFactor) + CurrentOrderPrepTime))
                </code>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <strong className="text-gray-900 dark:text-white block mb-0.5">Authentication & QR Security:</strong>
                <p className="text-gray-600 dark:text-gray-300">JWT Token standard header injection, `bcryptjs` password hashing, and unique non-repeatable `GN-XXXX` pickup verification tokens.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-bold">Ready for Production & Cloud Deployment</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600"
          >
            Close Specs
          </button>
        </div>

      </div>
    </div>
  );
}

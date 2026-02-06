import { useState } from 'react';
import { X, Zap, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoModeBannerProps {
  isUsingMockData?: boolean;
}

export function DemoModeBanner({ isUsingMockData = false }: DemoModeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  // Different styles based on whether using mock data (backend unavailable) or not
  const gradientClass = isUsingMockData
    ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-b border-amber-500/20"
    : "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-b border-emerald-500/20";

  const badgeClass = isUsingMockData
    ? "bg-amber-500/20 border border-amber-500/30"
    : "bg-emerald-500/20 border border-emerald-500/30";

  const badgeTextClass = isUsingMockData
    ? "text-amber-400"
    : "text-emerald-400";

  return (
    <AnimatePresence>
      <motion.div
        className={`relative overflow-hidden ${gradientClass}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        
        <div className="relative px-4 py-2.5 flex items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${badgeClass}`}>
              {isUsingMockData ? (
                <Zap className={`w-3 h-3 ${badgeTextClass}`} />
              ) : (
                <Database className={`w-3 h-3 ${badgeTextClass}`} />
              )}
              <span className={`text-xs font-semibold ${badgeTextClass}`}>
                {isUsingMockData ? 'Demo Mode' : 'Live Data'}
              </span>
            </div>
            <span className="text-sm text-zinc-400">
              {isUsingMockData 
                ? 'Backend unavailable – showing realistic mock data for demo'
                : 'Connected to backend – displaying real-time error data'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
              Powered by Tambo AI
            </span>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


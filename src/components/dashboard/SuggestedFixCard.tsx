import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Minus, Plus, Wand2, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { suggestedFixData } from '../../lib/mockData';

// Define props for Generative UI
export interface SuggestedFixProps {
  description?: string;
  confidence?: number;
  beforeCode?: string;
  afterCode?: string;
  appliedCount?: number;
  teamsCount?: number;
}

export function SuggestedFixCard({
  description = suggestedFixData.description,
  confidence = suggestedFixData.confidence,
  beforeCode = suggestedFixData.before,
  afterCode = suggestedFixData.after,
  appliedCount = suggestedFixData.appliedCount,
  teamsCount = suggestedFixData.teamsCount,
}: SuggestedFixProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [showFullDiff, setShowFullDiff] = useState(false);

  const handleApplyFix = async () => {
    if (isApplied || isApplying) return;
    setIsApplying(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsApplying(false);
    setIsApplied(true);
  };

  const handleViewDiff = () => {
    setShowFullDiff(!showFullDiff);
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-20 blur-lg" />
      
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
      <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30" />
      
      <div className="relative">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  Suggested Fix
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-zinc-500">{description}</p>
              </div>
            </div>
            <motion.div
              className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: 'spring', bounce: 0.5 }}
            >
              <span className="text-sm font-bold text-emerald-400">{confidence}%</span>
              <span className="text-xs text-emerald-400/70 ml-1">confident</span>
            </motion.div>
          </div>
        </div>

        {/* Code Diff */}
        <div className="p-6 space-y-4">
          {/* Before */}
          <motion.div
            className="rounded-xl overflow-hidden border border-rose-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2">
              <Minus className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Before</span>
            </div>
            <div className="p-4 bg-rose-500/5 font-mono text-sm">
              <code className="text-rose-300">{beforeCode}</code>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <ArrowRight className="w-4 h-4 text-zinc-500 rotate-90" />
            </motion.div>
          </div>

          {/* After */}
          <motion.div
            className="rounded-xl overflow-hidden border border-emerald-500/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">After</span>
            </div>
            <div className="p-4 bg-emerald-500/5 font-mono text-sm">
              <code className="text-emerald-300">{afterCode}</code>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          className="p-6 pt-0 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <button 
            onClick={handleApplyFix}
            disabled={isApplied || isApplying}
            className={`flex-1 py-3 px-4 font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              isApplied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
            } disabled:opacity-70`}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : isApplied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Fix Applied!
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Apply Fix
              </>
            )}
          </button>
          <button 
            onClick={handleViewDiff}
            className="flex-1 py-3 px-4 bg-white/[0.03] border border-white/[0.08] text-white font-medium rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all active:scale-[0.98]"
          >
            {showFullDiff ? 'Hide Diff' : 'View Full Diff'}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="px-6 pb-6 pt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-400">
              <span className="text-white font-medium">{appliedCount} similar fixes</span> applied across{' '}
              <span className="text-white font-medium">{teamsCount} teams</span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { History, CheckCircle, AlertCircle, XCircle, ExternalLink, Clock } from 'lucide-react';
import { similarErrorsData } from '../../lib/mockData';
import { cn, formatTimeAgo } from '../../lib/utils';

// Define props for Generative UI
export interface SimilarErrorsTableProps {
  errors?: Array<{
    id: number;
    similarity: number;
    message: string;
    resolution: string;
    timestamp: number;
    status: 'fixed' | 'partial' | 'unresolved';
  }>;
}

export function SimilarErrorsTable({ errors }: SimilarErrorsTableProps = {}) {
  // Use props if provided, otherwise fall back to mock data
  const displayErrors = errors && errors.length > 0 ? errors : similarErrorsData.errors;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'unresolved': return <XCircle className="w-4 h-4 text-rose-400" />;
      default: return null;
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400';
    if (similarity >= 75) return 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400';
    return 'from-zinc-500/20 to-zinc-500/5 border-zinc-500/30 text-zinc-400';
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Similar Past Errors</h3>
              <p className="text-xs text-zinc-500">AI-powered pattern matching</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400">
            {displayErrors.length} matches
          </span>
        </div>

        {/* Error List */}
        <div className="space-y-3">
          {displayErrors.map((error, i) => (
            <motion.div
              key={error.id}
              className="group relative overflow-hidden p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      'px-2.5 py-1 rounded-lg bg-gradient-to-r border text-xs font-semibold',
                      getSimilarityColor(error.similarity)
                    )}>
                      {error.similarity}% match
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(error.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white font-mono truncate mb-2">{error.message}</p>
                  
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      {getStatusIcon(error.status)}
                      <span className={cn(
                        'capitalize font-medium',
                        error.status === 'fixed' ? 'text-emerald-400' : 
                        error.status === 'partial' ? 'text-amber-400' : 'text-rose-400'
                      )}>
                        {error.status}
                      </span>
                    </span>
                    {error.resolution && (
                      <span className="text-xs text-zinc-500">{error.resolution}</span>
                    )}
                  </div>
                </div>
                
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          className="mt-4 pt-4 border-t border-white/[0.06] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <button className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
            View all similar errors →
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

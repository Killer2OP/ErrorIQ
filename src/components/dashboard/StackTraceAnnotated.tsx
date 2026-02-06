import { motion } from 'framer-motion';
import { FileCode, Lightbulb, AlertCircle, Wand2 } from 'lucide-react';
import { stackTraceData } from '../../lib/mockData';
import { cn } from '../../lib/utils';

// Define props for Generative UI
export interface StackTraceProps {
  filename?: string;
  errorLine?: number;
  lines?: { number: number; content: string; type?: 'error' | 'context' | 'normal'; }[];
  aiExplanation?: string;
}

export function StackTraceAnnotated({
  filename = stackTraceData.filename,
  errorLine = stackTraceData.errorLine,
  lines = stackTraceData.lines,
  aiExplanation = stackTraceData.aiExplanation,
}: StackTraceProps) {
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
      
      <div className="relative">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/20 flex items-center justify-center">
                <FileCode className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Stack Trace</h3>
                <p className="text-xs text-zinc-500 font-mono">{filename}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span className="text-xs text-rose-400 font-medium">Line {errorLine}</span>
            </div>
          </div>
        </div>

        {/* Code Block */}
        <div className="mx-6 mb-4 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0c]">
          <div className="border-b border-white/[0.06] px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-xs text-zinc-500 ml-2 font-mono">{filename}</span>
          </div>
          <div className="font-mono text-[13px] py-2">
            {lines.map((line, i) => (
              <motion.div
                key={line.number}
                className={cn(
                  'flex items-center px-4 py-1',
                  line.type === 'error' && 'bg-gradient-to-r from-rose-500/15 to-transparent border-l-2 border-rose-500'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <span className="w-10 text-right pr-4 text-zinc-600 select-none">{line.number}</span>
                <span className={cn(
                  'flex-1',
                  line.type === 'error' ? 'text-rose-300' : 'text-zinc-300'
                )}>
                  {line.content}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Explanation */}
        <motion.div
          className="mx-6 mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/5 border border-purple-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-400 mb-1 flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                AI Analysis
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{aiExplanation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

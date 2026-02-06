import { motion } from 'framer-motion';
import { Route, Users, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { userJourneyData } from '../../lib/mockData';
import { cn, formatCurrency } from '../../lib/utils';

// Define props for Generative UI
export interface UserJourneyProps {
  steps?: { id: number; name: string; time: string; status: 'completed' | 'error' | 'success'; }[];
  affectedUsers?: number;
  estimatedCartValue?: number;
  patterns?: string[];
}

export function UserJourneyFlow({
  steps = userJourneyData.steps,
  affectedUsers = userJourneyData.affectedUsers,
  estimatedCartValue = userJourneyData.estimatedCartValue,
  patterns = userJourneyData.patterns,
}: UserJourneyProps) {
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">User Journey</h3>
              <p className="text-xs text-zinc-500">Path to error</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-sm font-semibold text-white">{affectedUsers}</span>
              <span className="text-xs text-zinc-500">users</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-sm font-semibold text-white">{formatCurrency(estimatedCartValue)}</span>
              <span className="text-xs text-zinc-500">at risk</span>
            </div>
          </div>
        </div>

        {/* Journey Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              className="flex flex-col items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <div className={cn(
                  'relative flex items-center justify-center w-12 h-12 rounded-2xl border-2 flex-shrink-0 transition-all',
                  step.status === 'error' 
                    ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/30' 
                    : 'bg-emerald-500/10 border-emerald-500/50'
                )}>
                  {step.status === 'error' ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  )}
                  {step.status === 'error' && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-rose-500"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-3 relative">
                    <div className="h-0.5 bg-zinc-800 rounded-full" />
                    <motion.div
                      className={cn(
                        'absolute top-0 left-0 h-0.5 rounded-full',
                        step.status === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                      )}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                    />
                  </div>
                )}
              </div>
              
              {/* Step Info */}
              <div className="mt-3 text-center">
                <p className={cn(
                  'text-sm font-medium',
                  step.status === 'error' ? 'text-rose-400' : 'text-zinc-300'
                )}>
                  {step.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{step.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patterns Found */}
        <motion.div
          className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Common Patterns Detected</span>
          </div>
          <ul className="space-y-2">
            {patterns.map((pattern, i) => (
              <motion.li
                key={i}
                className="flex items-center gap-2 text-sm text-zinc-400"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {pattern}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

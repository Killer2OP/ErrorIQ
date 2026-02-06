import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, GitBranch, Bell, Flag, FileText, RotateCcw, Check, Loader2, Sparkles } from 'lucide-react';
import { quickActionsData } from '../../lib/mockData';
import { cn } from '../../lib/utils';
import { useActions } from '../../hooks/useTambo';

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

export function QuickActionsPanel() {
  const [actionStatus, setActionStatus] = useState<Record<string, ActionStatus>>({});
  const { rollback, notify, createTicket, silenceAlerts } = useActions();

  const iconMap: Record<string, typeof Zap> = {
    rollback: GitBranch,
    notify: Bell,
    flag: Flag,
    report: FileText,
    retry: RotateCcw,
  };

  const handleAction = async (actionId: string) => {
    setActionStatus(prev => ({ ...prev, [actionId]: 'loading' }));
    
    try {
      switch (actionId) {
        case 'rollback':
          await rollback('v2.3.1', { reason: 'Error resolution', errorId: 'current' });
          break;
        case 'notify':
          await notify(['slack', 'email'], { message: 'Critical error detected', severity: 'critical' });
          break;
        case 'jira':
          await createTicket('Fix checkout error', { priority: 'high', description: 'TypeError in checkout flow' });
          break;
        case 'silence':
          await silenceAlerts('current', '1h', 'Investigating');
          break;
        default:
          // For other actions, simulate with timeout
          await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setActionStatus(prev => ({ ...prev, [actionId]: 'success' }));
      setTimeout(() => {
        setActionStatus(prev => ({ ...prev, [actionId]: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error('Action failed:', error);
      setActionStatus(prev => ({ ...prev, [actionId]: 'error' }));
      setTimeout(() => {
        setActionStatus(prev => ({ ...prev, [actionId]: 'idle' }));
      }, 3000);
    }
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Quick Actions</h3>
            <p className="text-xs text-zinc-500">One-click remediation</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActionsData.actions.map((action, i) => {
            const Icon = iconMap[action.icon] || Zap;
            const status = actionStatus[action.id] || 'idle';
            
            return (
              <motion.button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={status !== 'idle'}
                className={cn(
                  'relative overflow-hidden p-4 rounded-xl border transition-all duration-200 group',
                  status === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-purple-500/5 hover:border-purple-500/30'
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {status === 'loading' ? (
                    <motion.div
                      key="loading"
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      <span className="text-xs text-purple-400">Processing...</span>
                    </motion.div>
                  ) : status === 'success' ? (
                    <motion.div
                      key="success"
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">Done!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all">
                        <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </div>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-300 text-center transition-colors">
                        {action.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* AI Recommendation */}
        <motion.div
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-purple-500/10 border border-purple-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-400 mb-1">AI Recommendation</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{quickActionsData.aiRecommendation}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface Alert {
  id: number;
  type: string;
  message: string;
  time: string;
  acknowledged: boolean;
}

const initialAlerts: Alert[] = [
  { id: 1, type: 'critical', message: 'Database connection pool exhausted', time: '15 min ago', acknowledged: false },
  { id: 2, type: 'warning', message: 'High query latency on users table', time: '23 min ago', acknowledged: true },
  { id: 3, type: 'info', message: 'Deploy v3.2.0 completed successfully', time: '23 min ago', acknowledged: true },
  { id: 4, type: 'warning', message: 'Memory usage above 80% on cache server', time: '1 hour ago', acknowledged: false },
];

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleAcknowledge = (alertId: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical': return {
        bg: 'from-rose-500/10 to-rose-500/5',
        border: 'border-rose-500/30',
        icon: AlertTriangle,
        iconColor: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-400',
      };
      case 'warning': return {
        bg: 'from-amber-500/10 to-amber-500/5',
        border: 'border-amber-500/30',
        icon: Bell,
        iconColor: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-400',
      };
      case 'info': return {
        bg: 'from-blue-500/10 to-blue-500/5',
        border: 'border-blue-500/30',
        icon: AlertCircle,
        iconColor: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400',
      };
      default: return {
        bg: 'from-zinc-500/10 to-zinc-500/5',
        border: 'border-zinc-500/30',
        icon: Bell,
        iconColor: 'text-zinc-400',
        badge: 'bg-zinc-500/20 text-zinc-400',
      };
    }
  };

  return (
    <div className="p-8 min-h-full">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
        <p className="text-zinc-400">System notifications and alerts</p>
      </motion.div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const styles = getAlertStyles(alert.type);
          const Icon = styles.icon;
          
          return (
            <motion.div
              key={alert.id}
              className={cn(
                'relative overflow-hidden p-5 rounded-2xl border bg-gradient-to-r',
                styles.bg,
                styles.border
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  styles.badge
                )}>
                  <Icon className={cn('w-5 h-5', styles.iconColor)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={cn('text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded', styles.badge)}>
                      {alert.type}
                    </span>
                    {alert.acknowledged && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.time}
                  </div>
                </div>
                {!alert.acknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.1] transition-all"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Server, AlertTriangle, Clock, Activity, Database, Wifi, HardDrive } from 'lucide-react';
import { infrastructureHealthData } from '../../lib/mockData';
import { cn } from '../../lib/utils';

// Define props for Generative UI
export interface InfrastructureHealthProps {
  services?: any[];
  alerts?: any[];
  recentChanges?: any[];
}

export function InfrastructureHealth({
  services = infrastructureHealthData.services,
  alerts = infrastructureHealthData.alerts,
  recentChanges = infrastructureHealthData.recentChanges,
}: InfrastructureHealthProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'healthy': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' };
      case 'warning': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' };
      case 'degraded': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-400' };
      default: return { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', dot: 'bg-zinc-400' };
    }
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'database': return Database;
      case 'api-gateway': return Wifi;
      case 'cache': return HardDrive;
      default: return Server;
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'from-rose-500 to-rose-400';
    if (value >= 70) return 'from-amber-500 to-amber-400';
    return 'from-emerald-500 to-emerald-400';
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">System Health</h3>
              <p className="text-xs text-zinc-500">Infrastructure status</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">Live</span>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {services.map((service, index) => {
            const styles = getStatusStyles(service.status);
            const Icon = getServiceIcon(service.id);
            return (
              <motion.div
                key={service.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  service.status === 'degraded' 
                    ? 'bg-rose-500/5 border-rose-500/30' 
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12]'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.bg, styles.border, 'border')}>
                    <Icon className={cn('w-4 h-4', styles.color)} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', styles.dot, service.status === 'degraded' && 'animate-pulse')} />
                    <span className={cn('text-xs font-medium capitalize', styles.color)}>{service.status}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-white mb-3">{service.name}</p>
                
                <div className="space-y-2">
                  {service.metrics.map((metric: any, i: number) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">{metric.label}</span>
                        <span className={cn(
                          'font-medium',
                          metric.value >= 90 ? 'text-rose-400' : metric.value >= 70 ? 'text-amber-400' : 'text-zinc-300'
                        )}>
                          {metric.display}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full bg-gradient-to-r', getProgressColor(metric.value))}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(metric.value, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alerts */}
        <motion.div
          className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-400">Active Alerts</span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>{alert.icon}</span>
                <span className="text-zinc-300">{alert.message}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Changes */}
        <motion.div
          className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Recent Changes</span>
          </div>
          <div className="space-y-2">
            {recentChanges.map((change, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>{change.icon}</span>
                <span className="text-zinc-300">{change.message}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{change.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

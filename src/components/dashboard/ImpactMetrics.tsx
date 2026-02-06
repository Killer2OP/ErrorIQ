import { motion } from 'framer-motion';
import { BarChart3, Users, Zap, DollarSign, Globe, Clock, AlertTriangle } from 'lucide-react';
import { impactMetricsData } from '../../lib/mockData';
import { cn, formatCurrency } from '../../lib/utils';

// Define props for Generative UI
export interface ImpactMetricsProps {
  users?: number;
  sessions?: number;
  revenue?: number;
  regions?: { name: string; count: number; percent: number; }[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  firstDetected?: number;
  peakTime?: number;
}

export function ImpactMetrics({
  users = impactMetricsData.users,
  sessions = impactMetricsData.sessions,
  revenue = impactMetricsData.revenue,
  regions = impactMetricsData.geographic,
  severity = impactMetricsData.severity as any,
  firstDetected = impactMetricsData.firstDetected,
  peakTime = impactMetricsData.peakTime,
}: ImpactMetricsProps) {
  const metrics = [
    { label: 'Users Affected', value: users, icon: Users, color: 'purple', suffix: '' },
    { label: 'Sessions', value: sessions, icon: Zap, color: 'blue', suffix: '' },
    { label: 'Revenue at Risk', value: revenue, icon: DollarSign, color: 'emerald', suffix: '', isCurrency: true },
    { label: 'Regions', value: regions.length, icon: Globe, color: 'amber', suffix: '' },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    purple: { bg: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
    blue: { bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
    amber: { bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Impact Analysis</h3>
              <p className="text-xs text-zinc-500">Real-time metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
              {severity}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metrics.map((metric, i) => {
            const colors = colorMap[metric.color];
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                className={cn(
                  'relative overflow-hidden p-4 rounded-xl border bg-gradient-to-br',
                  colors.bg,
                  colors.border
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">{metric.label}</p>
                    <p className={cn('text-2xl font-bold', colors.text)}>
                      {metric.isCurrency ? formatCurrency(metric.value) : metric.value.toLocaleString()}
                      {metric.suffix}
                    </p>
                  </div>
                  <div className={cn(
                    'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg',
                    colors.bg,
                    colors.glow
                  )}>
                    <Icon className={cn('w-4 h-4', colors.text)} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Geographic Distribution */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-400">Geographic Distribution</span>
          </div>
          <div className="space-y-3">
            {regions.map((region, i) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-zinc-400">{region.name}</span>
                  <span className="text-white font-medium">{region.count} users ({region.percent}%)</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${region.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Time Stats */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">First detected:</span>
            <span className="text-xs text-white font-medium">{firstDetected} min ago</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Zap className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-500">Peak errors:</span>
            <span className="text-xs text-white font-medium">{peakTime} min ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

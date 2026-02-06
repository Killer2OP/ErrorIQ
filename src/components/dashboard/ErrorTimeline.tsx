import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Clock, TrendingUp, Rocket, Loader2 } from 'lucide-react';
import { useTimeline } from '../../hooks/useTambo';
import { errorTimelineData as mockTimelineData, deploymentMarkers as mockDeploymentMarkers } from '../../lib/mockData';

// Define props for Generative UI
export interface ErrorTimelineProps {
  range?: '1h' | '24h' | '7d' | '30d';
  showDeployments?: boolean;
}

export function ErrorTimeline({ range = '24h', showDeployments: _showDeployments = true }: ErrorTimelineProps) {
  const { timeline, deployments, loading, error, refetch } = useTimeline(range);
  
  // Use API data if available, otherwise fallback to mock data
  const chartData = timeline.length > 0 ? timeline : mockTimelineData;
  const deploymentData = deployments.length > 0 ? deployments : mockDeploymentMarkers;

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Error Timeline</h3>
              <p className="text-xs text-zinc-500">Last 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-xs text-zinc-400">Loading...</span>
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
            >
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-xs text-zinc-400">Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(24, 24, 27, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
                labelStyle={{ color: '#fafafa', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: '#a78bfa' }}
                formatter={(value) => [`${value} errors`, 'Count']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              {deploymentData.map((marker, i) => (
                <ReferenceLine 
                  key={i}
                  x={marker.time} 
                  stroke="rgba(251, 191, 36, 0.3)" 
                  strokeDasharray="3 3"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Markers Legend */}
        {/* Deployment Markers Legend */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-4">
          {error && (
            <span className="text-xs text-rose-400">Using cached data</span>
          )}
          {deploymentData.map((marker, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
            >
              <Rocket className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">{marker.version}</span>
              <span className="text-xs text-zinc-500">{marker.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

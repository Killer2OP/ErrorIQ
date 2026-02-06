import { motion } from 'framer-motion';
import { ChatInterface } from '../components/chat';
import { DemoModeBanner } from '../components/ui';
import {
  ErrorTimeline,
  StackTraceAnnotated,
  UserJourneyFlow,
  ImpactMetrics,
  InfrastructureHealth,
  QuickActionsPanel,
  SimilarErrorsTable,
  SuggestedFixCard,
} from '../components/dashboard';
import { useErrors } from '../hooks/useErrors';
import { AlertTriangle, Clock, Users, ShoppingCart, RefreshCw, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function DashboardPage() {
  const { errors, loading, error: fetchError, stats, refetch } = useErrors({ limit: 10 });
  
  // Get the most recent/critical error to display
  const currentError = errors[0] || null;

  const handleChatSubmit = (query: string) => {
    console.log('Chat query:', query);
  };

  // Calculate time ago
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="min-h-full">
      <DemoModeBanner />

      <div className="p-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                Error Analysis
                {loading ? (
                  <span className="px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-sm font-semibold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading
                  </span>
                ) : currentError ? (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5 ${
                    currentError.severity === 'critical' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                    currentError.severity === 'high' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                    currentError.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {currentError.severity.charAt(0).toUpperCase() + currentError.severity.slice(1)}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                    ✓ No Errors
                  </span>
                )}
                <button
                  onClick={refetch}
                  className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </h1>
              {fetchError && (
                <p className="text-rose-400 text-sm mb-2">⚠️ {fetchError}</p>
              )}
              {currentError ? (
                <>
                  <p className="text-zinc-400">
                    <span className="text-rose-400 font-mono">{currentError.message.split(':')[0]}:</span>{' '}
                    <span className="text-zinc-300">{currentError.message.split(':').slice(1).join(':')}</span>
                  </p>
                  <p className="text-sm text-zinc-500 mt-1 font-mono">{currentError.file}:{currentError.line}</p>
                </>
              ) : !loading && (
                <p className="text-zinc-400">
                  No errors detected. Navigate to <a href="/demo" className="text-purple-400 hover:underline">/demo</a> to trigger test errors.
                </p>
              )}
            </div>

            {/* Quick Stats */}
            {currentError && (
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">First seen:</span>
                  <span className="text-sm text-white font-medium">{getTimeAgo(currentError.firstSeen || currentError.createdAt)} ago</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-white font-medium">{currentError.affectedUsers}</span>
                  <span className="text-sm text-zinc-400">users affected</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-medium">×{currentError.occurrences || 1}</span>
                  <span className="text-sm text-purple-400">occurrences</span>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Chat Interface */}
        <ChatInterface onSubmit={handleChatSubmit} />

        {/* Dashboard Grid */}
        <div className="space-y-8">
          {/* Row 1: Timeline and Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorTimeline />
            <ImpactMetrics 
              users={currentError?.affectedUsers || 0}
              sessions={currentError?.sessions || 0}
              severity={currentError?.severity || 'low'}
              firstDetected={currentError ? Math.floor((Date.now() - new Date(currentError.firstSeen || currentError.createdAt).getTime()) / 60000) : 0}
              peakTime={currentError ? Math.floor((Date.now() - new Date(currentError.lastSeen || currentError.createdAt).getTime()) / 60000) : 0}
            />
          </div>

          {/* Row 2: Stack Trace and Suggested Fix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StackTraceAnnotated 
              filename={currentError?.file}
              errorLine={currentError?.line}
            />
            <SuggestedFixCard />
          </div>

          {/* Row 3: User Journey */}
          <UserJourneyFlow 
            affectedUsers={currentError?.affectedUsers}
          />

          {/* Row 4: Infrastructure and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfrastructureHealth />
            <QuickActionsPanel />
          </div>

          {/* Row 5: Similar Errors - Pass all fetched errors */}
          <SimilarErrorsTable errors={errors.slice(1).map((err, i) => ({
            id: i + 1,
            similarity: Math.max(60, 100 - (i * 10)), // Decreasing similarity
            message: err.message,
            resolution: err.status === 'resolved' ? 'Fixed' : err.status === 'acknowledged' ? 'In Progress' : '',
            timestamp: new Date(err.createdAt).getTime(),
            status: err.status === 'resolved' ? 'fixed' : err.status === 'acknowledged' ? 'partial' : 'unresolved',
          }))} />
        </div>
      </div>
    </div>
  );
}

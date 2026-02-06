/**
 * Demo Page - Test ErrorIQ SDK integration
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ErrorIQClient } from '../lib/erroriq-sdk';
import { useErrors } from '../hooks/useErrors';

// Initialize SDK for this page
const erroriq = new ErrorIQClient({
  endpoint: 'http://localhost:3001/api/errors',
  projectId: 'erroriq-demo',
});

export default function DemoPage() {
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [sentErrors, setSentErrors] = useState<string[]>([]);
  const { errors, loading, error: fetchError, stats } = useErrors({ limit: 10 });

  useEffect(() => {
    erroriq.init();
    erroriq.setUser({ id: 'demo-user', name: 'Demo User' });
    setSdkInitialized(true);

    return () => {
      erroriq.destroy();
    };
  }, []);

  const triggerTypeError = () => {
    try {
      const obj: {user?: {name: string}} = {};
      // This will throw TypeError
      console.log((obj.user as {name: string}).name);
    } catch (err) {
      if (err instanceof Error) {
        erroriq.captureError({
          message: err.message,
          stack: err.stack,
          type: 'TypeError',
          severity: 'high',
        });
        setSentErrors(prev => [...prev, `TypeError: ${err.message}`]);
      }
    }
  };

  const triggerNetworkError = () => {
    erroriq.captureError({
      message: 'NetworkError: Failed to fetch /api/checkout - Connection refused',
      stack: 'at fetch (src/services/api.ts:45:10)\n    at checkout (src/pages/Checkout.tsx:89:5)',
      file: 'src/services/api.ts',
      line: 45,
      type: 'NetworkError',
      severity: 'high',
    });
    setSentErrors(prev => [...prev, 'NetworkError: Failed to fetch /api/checkout']);
  };

  const triggerUnhandledRejection = () => {
    erroriq.captureError({
      message: 'Unhandled Promise Rejection: Database connection timeout',
      stack: 'at connectDB (src/db/connection.ts:12:5)',
      file: 'src/db/connection.ts',
      line: 12,
      type: 'UnhandledRejection',
      severity: 'critical',
    });
    setSentErrors(prev => [...prev, 'UnhandledRejection: Database connection timeout']);
  };

  const triggerCustomError = () => {
    const customMessage = `Custom Error Test - ${new Date().toLocaleTimeString()}`;
    erroriq.captureMessage(customMessage, 'warning');
    setSentErrors(prev => [...prev, customMessage]);
  };

  const runTestError = () => {
    erroriq.testError();
    setSentErrors(prev => [...prev, 'Test Error - SDK validation']);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ErrorIQ SDK Demo
          </h1>
          <p className="text-slate-400">
            Test the error capture SDK and see errors appear in real-time
          </p>
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${sdkInitialized ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            <span className={`w-2 h-2 rounded-full ${sdkInitialized ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            SDK {sdkInitialized ? 'Initialized' : 'Loading...'}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trigger Errors Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Trigger Test Errors
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={triggerTypeError}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🔴 Trigger TypeError
              </button>
              
              <button
                onClick={triggerNetworkError}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🌐 Trigger Network Error
              </button>
              
              <button
                onClick={triggerUnhandledRejection}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                💥 Trigger Unhandled Rejection
              </button>
              
              <button
                onClick={triggerCustomError}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                📝 Send Custom Message
              </button>
              
              <button
                onClick={runTestError}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ✅ Test SDK Connection
              </button>
            </div>

            {/* Sent Errors Log */}
            {sentErrors.length > 0 && (
              <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Sent Errors ({sentErrors.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sentErrors.slice(-5).map((err, i) => (
                    <div key={i} className="text-xs text-slate-300 p-2 bg-slate-800/50 rounded-lg truncate">
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Live Errors Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📡</span> Live Error Feed
              {loading && <span className="text-sm text-slate-400 animate-pulse">Loading...</span>}
            </h2>

            {fetchError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {fetchError}
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                  <div className="text-xs text-slate-400">Total</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.bySeverity?.critical || 0}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.byStatus?.resolved || 0}</div>
                  <div className="text-xs text-slate-400">Resolved</div>
                </div>
              </div>
            )}

            {/* Error List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {errors.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-400">
                  No errors yet. Click a button to trigger one!
                </div>
              )}
              
              {errors.map((err) => (
                <motion.div
                  key={err.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    err.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    err.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                    err.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{err.message}</div>
                      <div className="text-xs text-slate-400 mt-1">{err.file}:{err.line}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        err.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        err.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        err.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {err.severity}
                      </span>
                      <span className="text-xs text-slate-500">
                        ×{err.occurrences || 1}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30"
        >
          <h3 className="text-lg font-medium text-white mb-4">📖 How to use ErrorIQ SDK</h3>
          <pre className="bg-slate-900/50 p-4 rounded-xl text-sm text-slate-300 overflow-x-auto">
{`// Install in your app
import { ErrorIQClient } from './lib/erroriq-sdk';

const erroriq = new ErrorIQClient({
  endpoint: 'http://localhost:3001/api/errors',
  projectId: 'your-project-id',
});

// Initialize automatic error capture
erroriq.init();

// Set user context (optional)
erroriq.setUser({ id: 'user123', email: 'user@example.com' });

// Manual error capture
erroriq.captureError({
  message: 'Something went wrong',
  severity: 'high',
});

// Test the SDK
erroriq.testError();`}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}

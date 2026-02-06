import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navItems } from '../../lib/mockData';
import { cn } from '../../lib/utils';
import { Zap } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0c0c0f]/50 backdrop-blur-xl border-r border-white/[0.06] flex flex-col h-[calc(100vh-64px)] sticky top-16">
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-[10px] font-semibold text-zinc-500 tracking-widest uppercase mb-3 px-3">Navigation</p>
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-transparent rounded-xl border-l-2 border-purple-500"
                      layoutId="activeNav"
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                  <span className={cn(
                    'relative text-lg transition-transform group-hover:scale-110',
                    isActive && 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                  )}>
                    {item.icon}
                  </span>
                  <span className="relative">{item.label}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* AI Status Card */}
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 p-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Engine</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </p>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Powered by advanced AI to analyze errors and suggest fixes in real-time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Demo Mode Badge */}
      <motion.div 
        className="p-4 pt-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-sm">🧪</span>
          <span className="text-xs font-medium text-amber-400">Demo Mode</span>
        </div>
      </motion.div>
    </aside>
  );
}

import { useState } from 'react';
import { Search, Bell, Command, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-[#0c0c0f]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl blur opacity-30" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Error<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">IQ</span>
          </h1>
          <p className="text-[10px] text-zinc-500 -mt-0.5 tracking-wide">AI-POWERED DEBUGGING</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="flex-1 max-w-xl mx-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={`relative flex items-center transition-all duration-300 ${
          isSearchFocused 
            ? 'ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10' 
            : ''
        }`}>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06]" />
          <Search className={`absolute left-4 w-4 h-4 transition-colors ${isSearchFocused ? 'text-purple-400' : 'text-zinc-500'}`} />
          <input
            type="text"
            placeholder="Search errors, logs, deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="relative w-full bg-transparent pl-11 pr-20 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none rounded-xl"
          />
          <div className="absolute right-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
            <Command className="w-3 h-3 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-medium">K</span>
          </div>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group">
          <Bell className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] font-semibold text-white flex items-center justify-center shadow-lg shadow-red-500/30">
            3
          </span>
        </button>

        {/* User Avatar */}
        <button className="relative group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
            P
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0c0f]" />
        </button>
      </motion.div>
    </header>
  );
}

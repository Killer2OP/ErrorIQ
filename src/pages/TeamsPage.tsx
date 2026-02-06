import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Phone, CalendarDays, CheckCircle } from 'lucide-react';

export function TeamsPage() {
  const [feedback, setFeedback] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showFeedback = (message: string) => {
    setFeedback({ message, visible: true });
    setTimeout(() => setFeedback({ message: '', visible: false }), 2500);
  };

  const handleMessage = (name: string) => {
    showFeedback(`Opening message to ${name}...`);
  };

  const handleCall = (name: string) => {
    showFeedback(`Initiating call to ${name}...`);
  };

  const handleContact = (name: string) => {
    showFeedback(`Contacting ${name} via emergency channel...`);
  };

  const teamMembers = [
    { id: 1, name: 'Sarah Chen', role: 'Tech Lead', avatar: 'SC', online: true, color: 'from-purple-500 to-violet-600' },
    { id: 2, name: 'Mike Johnson', role: 'Senior Engineer', avatar: 'MJ', online: true, color: 'from-blue-500 to-cyan-600' },
    { id: 3, name: 'Alex Rivera', role: 'DevOps', avatar: 'AR', online: false, color: 'from-emerald-500 to-teal-600' },
    { id: 4, name: 'Emma Wilson', role: 'Backend Engineer', avatar: 'EW', online: true, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="p-8 min-h-full relative">
      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback.visible && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2 shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Team</h1>
        <p className="text-zinc-400">Team members and on-call schedule</p>
      </motion.div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f] border border-white/[0.08] p-6 hover:border-purple-500/30 transition-all group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                  {member.avatar}
                </div>
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111114] ${
                  member.online ? 'bg-emerald-500' : 'bg-zinc-500'
                }`} />
              </div>
              <h3 className="text-white font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{member.role}</p>
              <div className="flex items-center gap-2 w-full">
                <button 
                  onClick={() => handleMessage(member.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-sm hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Message
                </button>
                <button 
                  onClick={() => handleCall(member.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-sm hover:bg-white/[0.06] hover:text-white transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* On-Call Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl opacity-20 blur-lg" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
        <div className="absolute inset-0 rounded-2xl border border-purple-500/30" />
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">On-Call Now</h3>
              <p className="text-xs text-zinc-500">Current on-call engineer</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-500/30">
                SC
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Sarah Chen</p>
                <p className="text-sm text-zinc-500">Tech Lead • Primary On-Call</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <CalendarDays className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Until 6:00 PM PST</span>
              </div>
              <button 
                onClick={() => handleContact('Sarah Chen')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

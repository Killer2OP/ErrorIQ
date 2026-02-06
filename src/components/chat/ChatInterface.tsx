import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import { suggestedPrompts } from '../../lib/mockData';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  onSubmit?: (query: string) => void;
}

export function ChatInterface({ onSubmit }: ChatInterfaceProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;
    onSubmit?.(value);
    submit();
  };

  const handlePromptClick = (prompt: string) => {
    setValue(prompt);
    // Focus input so user can hit enter or we can try to auto-submit if possible, 
    // but set value is enough for now as submit() uses current state which might not be updated yet.
  };

  const renderMessageContent = (content: any) => {
    if (typeof content === 'string') {
      return (
        <ReactMarkdown
          components={{
            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-zinc-300">{children}</li>,
            code: ({ children }) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-purple-300 text-xs">{children}</code>,
            pre: ({ children }) => <pre className="bg-zinc-900 p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>,
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }
    if (Array.isArray(content)) {
      return content.map((part, i) => {
        if (part.type === 'text') {
          return (
            <ReactMarkdown
              key={i}
              components={{
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                code: ({ children }) => <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-purple-300 text-xs">{children}</code>,
                pre: ({ children }) => <pre className="bg-zinc-900 p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>,
              }}
            >
              {part.text}
            </ReactMarkdown>
          );
        }
        return null;
      });
    }
    return null;
  };

  return (
    <motion.div 
      className="relative mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Chat Card */}
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isFocused 
          ? 'ring-2 ring-purple-500/30 shadow-2xl shadow-purple-500/10' 
          : 'shadow-xl'
      }`}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
        
        {/* Border */}
        <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Analysis Engine</h3>
              <p className="text-xs text-zinc-500">Ask me anything about your errors</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto custom-scrollbar">
            {thread.messages.map((message) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Text Content */}
                {message.content && (
                  <div className={`px-4 py-2 rounded-xl text-sm max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-purple-500/20 text-purple-100 border border-purple-500/30' 
                      : 'bg-zinc-800/50 text-zinc-300 border border-white/5'
                  }`}>
                    {renderMessageContent(message.content)}
                  </div>
                )}
                
                {/* Generative Component */}
                {message.renderedComponent && (
                  <div className="w-full max-w-3xl mt-2">
                    {message.renderedComponent}
                  </div>
                )}
              </motion.div>
            ))}
            {isPending && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm px-4">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Describe your error or ask for analysis..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isPending}
                className="w-full px-5 py-4 pr-14 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!value.trim() || isPending}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isPending ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Suggested Prompts */}
          <div className="mt-4">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="group relative overflow-hidden px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.08] rounded-full group-hover:border-purple-500/30 group-hover:bg-purple-500/5 transition-all" />
                  <span className="relative flex items-center gap-2 text-zinc-400 group-hover:text-purple-300">
                    <span>{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

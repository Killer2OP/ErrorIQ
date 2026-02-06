import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, FileText, Code, Search } from 'lucide-react';

interface DocLink {
  title: string;
  url: string;
  type: 'documentation' | 'stackoverflow' | 'github' | 'blog';
  relevance: number;
  snippet?: string;
}

interface RelatedDocsWidgetProps {
  docs?: DocLink[];
  searchQuery?: string;
  isLoading?: boolean;
}

const defaultDocs: DocLink[] = [
  {
    title: 'Optional Chaining (?.) - MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
    type: 'documentation',
    relevance: 95,
    snippet: 'The optional chaining (?.) operator accesses an object\'s property or calls a function...',
  },
  {
    title: 'Nullish coalescing operator (??) - JavaScript',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
    type: 'documentation',
    relevance: 88,
    snippet: 'The nullish coalescing (??) operator returns its right-hand operand when left is null or undefined...',
  },
  {
    title: 'How to avoid "Cannot read property of undefined" errors',
    url: 'https://stackoverflow.com/questions/14782232',
    type: 'stackoverflow',
    relevance: 82,
    snippet: 'Use optional chaining in JavaScript to safely access nested properties...',
  },
  {
    title: 'TypeScript Strict Mode Guide',
    url: 'https://www.typescriptlang.org/tsconfig#strict',
    type: 'documentation',
    relevance: 75,
    snippet: 'Enable all strict type-checking options to catch null reference errors at compile time...',
  },
];

const typeIcons = {
  documentation: <BookOpen className="w-4 h-4" />,
  stackoverflow: <Code className="w-4 h-4" />,
  github: <FileText className="w-4 h-4" />,
  blog: <FileText className="w-4 h-4" />,
};

const typeColors = {
  documentation: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  stackoverflow: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  github: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  blog: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export function RelatedDocsWidget({ 
  docs = defaultDocs, 
  searchQuery,
  isLoading = false 
}: RelatedDocsWidgetProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#111114] to-[#0c0c0f]" />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5" />
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Related Documentation</h3>
              <p className="text-xs text-zinc-500">Helpful resources for this error type</p>
            </div>
          </div>
          
          {searchQuery && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <Search className="w-3 h-3 text-zinc-500" />
              <span className="text-xs text-zinc-400">{searchQuery}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/[0.03] rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          /* Doc Links */
          <div className="space-y-3">
            {docs.map((doc, index) => (
              <motion.a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="flex items-start gap-3">
                  {/* Type Badge */}
                  <div className={`p-2 rounded-lg border ${typeColors[doc.type]}`}>
                    {typeIcons[doc.type]}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors truncate">
                        {doc.title}
                      </h4>
                      <ExternalLink className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    
                    {doc.snippet && (
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                        {doc.snippet}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                        {doc.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${doc.relevance}%` }}
                            transition={{ duration: 0.5, delay: 0.2 + 0.1 * index }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500">{doc.relevance}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-500 text-center">
            Found {docs.length} relevant resources • Powered by AI search
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default RelatedDocsWidget;

'use client'
import { motion, AnimatePresence } from 'framer-motion'

export type LogLine = {
  id: string
  type: 'info' | 'loading' | 'success' | 'divider' | 'meta'
  text: string
}

interface Props {
  lines: LogLine[]
  isLoading: boolean
}

const icons = { info: '◆', loading: '⟳', success: '✓', divider: '─', meta: '·' }
const colors = {
  info:    'text-white/70',
  loading: 'text-[#00A1E0]',
  success: 'text-emerald-400',
  divider: 'text-white/20',
  meta:    'text-white/40',
}

export default function PlatformView({ lines, isLoading }: Props) {
  return (
    <div className="h-full flex flex-col bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-amber-500/60" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="ml-2 text-xs text-white/30 font-mono">platform-orchestrator</span>
        {isLoading && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#00A1E0]/20 text-[#00A1E0] font-mono animate-pulse">
            running
          </span>
        )}
      </div>

      {/* Log output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-sm">
        {lines.length === 0 && (
          <p className="text-white/20 text-xs">Waiting for query...<span className="animate-blink">_</span></p>
        )}
        <AnimatePresence initial={false}>
          {lines.map(line => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 leading-relaxed text-xs ${colors[line.type]}`}
            >
              {line.type === 'divider' ? (
                <span className="text-white/15 select-none">{'─'.repeat(36)}</span>
              ) : (
                <>
                  <span className={line.type === 'loading' ? 'animate-spin inline-block' : ''}>
                    {icons[line.type]}
                  </span>
                  <span>{line.text}</span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && lines.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/20 text-xs"
          >
            <span className="animate-blink">_</span>
          </motion.div>
        )}
      </div>

      {/* Footer legend */}
      <div className="px-4 py-2 border-t border-white/10 flex gap-4 text-[10px] text-white/25 font-mono">
        <span><span className="text-[#00A1E0]">■</span> A2A Agent</span>
        <span><span className="text-[#00b67a]">■</span> MCP / Referral</span>
        <span><span className="text-purple-400">■</span> Gemini LLM</span>
      </div>
    </div>
  )
}

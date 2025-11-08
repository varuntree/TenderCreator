'use client'

import { animate, motion, useMotionValue } from 'framer-motion'
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'

import type { DocumentProgress } from '@/components/generate-documents-dialog'
import { cn } from '@/lib/utils'

const ACCENT = '#10B981'
const ACCENT_DIM = '#34D399'
const SURFACE = '#050505'
const INACTIVE = '#111827'
const WARNING = '#f87171'

const DOT_ROWS = 6
const DOT_COLS = 28
const DOT_COUNT = DOT_ROWS * DOT_COLS
const DOTS_PER_SECOND = 3
const DOT_INTERVAL_MS = 300
const DOT_STEP = Math.max(1, Math.round((DOTS_PER_SECOND * DOT_INTERVAL_MS) / 1000))

function useSpringProgress({ duration = 8.5, delay = 0 }: { duration?: number; delay?: number } = {}) {
  const mv = useMotionValue(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stopAnimation: (() => void) | null = null
    const timeout = window.setTimeout(() => {
      const controls = animate(mv, 100, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      })
      stopAnimation = () => controls.stop()
    }, delay * 1000)

    const unsub = mv.on('change', (value) => setProgress(Math.round(value)))
    return () => {
      window.clearTimeout(timeout)
      stopAnimation?.()
      unsub()
    }
  }, [delay, duration, mv])

  return progress
}

function useContainerWidth(): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(320)

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

const goldenHash = (i: number) => {
  const PHI = 1.618033988749895
  return i * PHI - Math.floor(i * PHI)
}

interface DotGridProgressProps {
  rows?: number
  cols?: number
  progress?: number
}

function DotGridProgress({ rows = 6, cols = 28, progress = 0 }: DotGridProgressProps) {
  const [wrapRef, containerWidth] = useContainerWidth()
  const minDot = 4
  const maxDot = 10
  const gap = Math.max(3, Math.min(8, Math.round(containerWidth / 140)))
  const dotSize = Math.max(
    minDot,
    Math.min(maxDot, Math.floor((containerWidth - (cols - 1) * gap) / cols))
  )

  const total = rows * cols
  const normalizedProgress = Math.max(0, Math.min(100, progress)) / 100

  const items = useMemo(() => {
    const arr: Array<{ r: number; c: number; i: number; threshold: number }> = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const serpentineCol = r % 2 === 0 ? c : cols - 1 - c
        const serpentineIdx = r * cols + serpentineCol
        const wave = (Math.sin(c * 0.85 + r * 0.55) + 1) / 2
        const jitter = goldenHash(i)
        const threshold = (serpentineIdx / (total - 1)) * 0.72 + wave * 0.2 + jitter * 0.08
        arr.push({ r, c, i, threshold })
      }
    }
    return arr.sort((a, b) => a.threshold - b.threshold)
  }, [cols, rows, total])

  const activeCut = Math.floor(normalizedProgress * items.length)

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-md">
      <div
        aria-hidden
        className="absolute inset-0 blur-2xl"
        style={{
          background:
            'radial-gradient(60% 140% at 50% 100%, rgba(16,185,129,0.16), transparent)',
          maskImage: 'linear-gradient(#000, transparent 70%)',
        }}
      />
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${dotSize}px)`,
          gridAutoRows: `${dotSize}px`,
          gap: `${gap}px`,
          padding: `${gap}px 0`,
          filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.22))',
        }}
      >
        {items.map((cell, idx) => {
          const isActive = idx < activeCut
          const delay = isActive ? (cell.threshold ?? 0) * 1500 : 0
          return (
            <motion.div
              key={`${cell.r}-${cell.c}`}
              initial={{ scale: 0.8, opacity: 0.25, backgroundColor: INACTIVE }}
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive ? 1 : 0.35,
                backgroundColor: isActive ? ACCENT : INACTIVE,
                boxShadow: isActive
                  ? `0 0 0 1px ${ACCENT_DIM}, 0 0 12px 2px rgba(16,185,129,0.3)`
                  : '0 0 0 0 rgba(0,0,0,0)',
              }}
              transition={{
                delay: isActive ? delay / 1000 : 0,
                type: 'spring',
                stiffness: 320,
                damping: 30,
                mass: 0.6,
              }}
              style={{ width: dotSize, height: dotSize, borderRadius: 2 }}
            />
          )
        })}
      </div>

      <motion.div
        aria-hidden
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 'calc(100% + 60px)', opacity: [0, 0.6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-12"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(16,185,129,0.18), rgba(16,185,129,0.55), rgba(16,185,129,0.18), transparent)',
          mixBlendMode: 'screen',
          filter: 'blur(8px)',
        }}
      />

      <motion.div
        aria-hidden
        key={activeCut}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 70% at 55% 50%, rgba(52,211,153,0.28), transparent 60%)',
          mixBlendMode: 'screen',
          filter: 'blur(10px)',
        }}
      />
    </div>
  )
}

interface AgentCardProps {
  title: string
  label?: string
  duration?: number
  progress?: number
  status?: DocumentProgress['state']
}

const statusProgressMap: Record<DocumentProgress['state'], number> = {
  idle: 0,
  queued: 12,
  running: 62,
  success: 100,
  error: 100,
}

function AgentCard({ title, label, duration = 8.5, progress, status = 'queued' }: AgentCardProps) {
  const fallbackProgress = useSpringProgress({ duration })
  const resolvedProgress = typeof progress === 'number' ? progress : fallbackProgress
  const isRunning = status === 'running'
  const isError = status === 'error'
  const accentColor = isError ? WARNING : ACCENT

  return (
    <div
      className={cn(
        'relative rounded-2xl p-5 transition-all',
        isError
          ? 'border border-red-400/70 bg-red-950/30 shadow-[0_0_0_1px_rgba(248,113,113,.3),0_0_24px_2px_rgba(248,113,113,.12)]'
          : isRunning
            ? 'border border-emerald-400/70 bg-neutral-900/60 shadow-[0_0_0_1px_rgba(16,185,129,.4),0_0_35px_4px_rgba(16,185,129,.15)]'
            : 'border border-neutral-800/80 bg-neutral-900/30'
      )}
      style={{ backgroundColor: SURFACE }}
    >
      <div className="flex items-center gap-3 pb-3">
        <span
          className="inline-block rounded-full"
          style={{ width: 10, height: 10, backgroundColor: accentColor }}
        />
        <p className="font-mono text-xs tracking-[0.35em] text-emerald-200/80">{title}</p>
      </div>
      <DotGridProgress progress={resolvedProgress} rows={DOT_ROWS} cols={DOT_COLS} />
      {label && (
        <p className="mt-3 text-xs font-medium text-emerald-100/70 line-clamp-1" title={label}>
          {label}
        </p>
      )}
      <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-300/70">
        {status === 'error' ? 'FAILED' : status === 'success' ? 'COMPLETE' : status}
      </p>
    </div>
  )
}

type AgentState = {
  id: string
  label: string
  state?: DocumentProgress['state']
}

export interface GenerationAgentsPanelProps {
  progressPercent: number
  totalDocs: number
  completedDocs: number
  failedDocs: number
  message: string
  detailMessage: string
  className?: string
  agents: AgentState[]
}

export function GenerationAgentsPanel({
  progressPercent,
  totalDocs,
  completedDocs,
  failedDocs,
  message,
  detailMessage,
  className,
  agents,
}: GenerationAgentsPanelProps) {
  const targetDots = Math.round((Math.max(0, Math.min(100, progressPercent)) / 100) * DOT_COUNT)
  const [displayDots, setDisplayDots] = useState(0)

  useEffect(() => {
    setDisplayDots((prev) => (targetDots < prev ? targetDots : prev))
    if (targetDots === 0) {
      setDisplayDots(0)
      return
    }

    const interval = window.setInterval(() => {
      setDisplayDots((prev) => {
        if (prev >= targetDots) {
          window.clearInterval(interval)
          return prev
        }
        return Math.min(targetDots, prev + DOT_STEP)
      })
    }, DOT_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [targetDots])

  if (totalDocs === 0) return null

  const resolvedProgress = Math.min(100, Math.round((displayDots / DOT_COUNT) * 100))
  const activeDocs = Math.max(totalDocs - completedDocs - failedDocs, 0)
  const agentList: AgentState[] =
    agents.length > 0
      ? agents
      : Array.from({ length: totalDocs }, (_, index) => ({
          id: `agent-${index}`,
          label: `Document ${index + 1}`,
          state: 'queued',
        }))

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-neutral-950 text-white shadow-[0_40px_160px_rgba(16,185,129,0.08)]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_60%)] opacity-60" />
      <div className="relative grid gap-8 p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:p-10">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-emerald-300/80">
              Generate all documents
            </p>
            <p className="text-2xl font-semibold">{message}</p>
            <p className="text-sm text-emerald-100/80">{detailMessage}</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-mono uppercase tracking-[0.25em] text-emerald-300/80">
            <div>
              <p className="text-3xl font-semibold text-white">
                {completedDocs}/{totalDocs}
              </p>
              <p className="text-xs tracking-[0.4em] text-emerald-400">Complete</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{activeDocs}</p>
              <p className="text-xs tracking-[0.4em] text-emerald-400">Active</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">{failedDocs}</p>
              <p className="text-xs tracking-[0.4em] text-emerald-400">Failed</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-emerald-100/80">
            <span className="rounded-full border border-emerald-800/70 px-3 py-1 font-mono tracking-[0.3em]">
              Autonomous run
            </span>
            <span className="rounded-full border border-emerald-800/70 px-3 py-1 font-mono tracking-[0.3em]">
              Contained
            </span>
            <span className="rounded-full border border-emerald-800/70 px-3 py-1 font-mono tracking-[0.3em]">
              Energy saver
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.4em] text-emerald-200/70">
            <span>Agent swarm</span>
            <span>{resolvedProgress}%</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agentList.map((agent, index) => {
              const status = agent.state ?? 'queued'
              const progressForAgent = statusProgressMap[status] ?? 0
              return (
                <AgentCard
                  key={agent.id}
                  title={`AGENT ${String(index + 1).padStart(2, '0')}`}
                  label={agent.label}
                  status={status}
                  progress={progressForAgent}
                  duration={9 + index * 0.6}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

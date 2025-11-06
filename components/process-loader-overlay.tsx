'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

export type ProcessLoaderStep = {
  id: string
  label: string
  helper?: string
}

interface ProcessLoaderOverlayProps {
  isVisible: boolean
  title: string
  subtitle?: string
  steps: ProcessLoaderStep[]
  activeStep?: number
  iconLabel?: string
  tone?: 'neutral' | 'warm'
}

const easing = [0.16, 1, 0.3, 1] as const

export function ProcessLoaderOverlay({
  isVisible,
  title,
  subtitle,
  steps,
  activeStep,
  iconLabel = 'TC',
  tone = 'warm',
}: ProcessLoaderOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const [autoStep, setAutoStep] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setAutoStep(0)
      return
    }

    if (typeof activeStep === 'number') {
      return
    }

    setAutoStep(0)
    const timers = steps.map((_, index) =>
      setTimeout(() => {
        setAutoStep(index)
      }, index * 2400)
    )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [isVisible, steps, activeStep])

  const derivedActiveStep = useMemo(() => {
    if (typeof activeStep === 'number') {
      return activeStep
    }
    return autoStep
  }, [activeStep, autoStep])

  const progressPercent = ((Math.min(derivedActiveStep, steps.length - 1) + 1) / steps.length) * 100

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900/20 backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: easing }}
        >
          <motion.div
            className="relative mx-4 w-full max-w-[440px]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease: easing }}
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-[28px] border border-emerald-200/50 bg-white p-8 shadow-[0_30px_70px_rgba(16,185,129,0.15)]',
                tone === 'warm' && 'bg-emerald-50/30'
              )}
            >
              <div className="absolute left-0 top-0 h-1.5 w-full bg-emerald-100" aria-hidden>
                <motion.span
                  className="block h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: easing }}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-4 pb-6 pt-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 shadow-inner">
                  {iconLabel}
                </div>
                <div>
                  <motion.p
                    key={title}
                    className="text-lg font-semibold text-emerald-900"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: easing }}
                  >
                    {title}
                  </motion.p>
                  {subtitle ? (
                    <motion.p
                      key={subtitle}
                      className="text-sm text-emerald-700"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: easing }}
                    >
                      {subtitle}
                    </motion.p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {steps.map((step, index) => {
                  const status =
                    derivedActiveStep > index
                      ? 'complete'
                      : derivedActiveStep === index
                        ? 'active'
                        : 'pending'

                  return (
                    <motion.div
                      key={step.id}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.2 + index * 0.15, ease: easing }}
                    >
                      <StepIndicator status={status} />
                      <div>
                        <p
                          className={cn(
                            'text-base font-medium',
                            status === 'complete' && 'text-emerald-700',
                            status === 'active' && 'text-emerald-900',
                            status === 'pending' && 'text-gray-400'
                          )}
                        >
                          {step.label}
                        </p>
                        {step.helper ? (
                          <p className="text-sm text-gray-400">{step.helper}</p>
                        ) : null}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

function StepIndicator({ status }: { status: 'pending' | 'active' | 'complete' }) {
  if (status === 'complete') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
    )
  }

  if (status === 'active') {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" strokeWidth={2.4} />
      </span>
    )
  }

  return <span className="h-5 w-5 rounded-full border-2 border-dashed border-gray-300" />
}

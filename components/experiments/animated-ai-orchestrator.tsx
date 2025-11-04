'use client';

import { FileText } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Phase = 'prompt' | 'document' | 'features';
type PointerStage = 'hidden' | 'input' | 'move' | 'click';

const PROMPT_TEXT =
  'Analyze City of Melbourne Infrastructure Maintenance RFT #FM-2025-048 for strategic opportunities';

const DOC_TEXT = [
  'Analysis complete: 47 requirements identified across 5 weighted evaluation criteria.',
  '',
  '1. Technical Capability (35%): Requires 10+ years facilities management, 24/7 emergency response capability, sustainability certifications including Green Star and NABERS ratings.',
  '2. Financial Viability (20%): Demonstrated $15M+ annual revenue, three years audited financial statements, performance bond and insurance requirements.',
  '3. Strategic Alignment (25%): Innovation in preventative maintenance, measurable carbon reduction commitments, comprehensive stakeholder engagement frameworks demonstrating community value.',
].join('\n');
const DOC_FIRST_LINE_END = DOC_TEXT.indexOf('\n');

const FEATURE_PILLS = [
  { label: 'sustainability focus', top: '28%', left: '18%' },
  { label: 'innovation weighted 25%', top: '35%', right: '14%' },
  { label: 'strategic alignment critical', bottom: '24%', left: '32%' },
];

const STATUSES = [
  { icon: '🌐', label: 'READY' },
  { icon: 'S', label: 'READY' },
  { icon: '☁️', label: 'READY' },
];

const promptCharDelay = 55;
const docCharDelay = 18;
const docCharDelayFast = 9;
const pointerMoveDelay = 260;
const pointerClickDelay = 780;
const documentStartDelay = 260;
const featureRevealDelay = 900;
const loopPause = 2000;

const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 520;
const MIN_SCALE = 0.6;

const DEFAULT_CURSOR_POSITIONS = {
  input: { x: 42, y: 64 },
  target: { x: 82, y: 56 },
};

type AnimatedAIOrchestratorProps = {
  className?: string;
};

export function AnimatedAIOrchestrator({
  className,
}: AnimatedAIOrchestratorProps = {}) {
  const [phase, setPhase] = useState<Phase>('prompt');
  const [promptTyped, setPromptTyped] = useState('');
  const [pointerStage, setPointerStage] = useState<PointerStage>('hidden');
  const [docText, setDocText] = useState('');
  const timers = useRef<number[]>([]);
  const [cycleKey, setCycleKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [scale, setScale] = useState(1);
  const cursorPositions = useRef(DEFAULT_CURSOR_POSITIONS);

  const updatePointerPoints = useCallback(() => {
    if (!cardRef.current || !promptRef.current || !submitRef.current) {
      return;
    }
    const cardRect = cardRef.current.getBoundingClientRect();
    const promptRect = promptRef.current.getBoundingClientRect();
    const submitRect = submitRef.current.getBoundingClientRect();

    const originX =
      ((promptRect.left - cardRect.left + promptRect.width * 0.35) /
        cardRect.width) *
      100;
    const originY =
      ((promptRect.top - cardRect.top + promptRect.height * 0.6) /
        cardRect.height) *
      100;
    const targetX =
      ((submitRect.left - cardRect.left + submitRect.width * 0.45) /
        cardRect.width) *
      100;
    const targetY =
      ((submitRect.top - cardRect.top + submitRect.height * 0.5) /
        cardRect.height) *
      100;

    cursorPositions.current = {
      input: { x: originX, y: originY },
      target: { x: targetX, y: targetY },
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updatePointerPoints);
    window.addEventListener('resize', updatePointerPoints);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePointerPoints);
    };
  }, [updatePointerPoints]);

  useEffect(() => {
    if (phase === 'prompt') {
      const frame = window.requestAnimationFrame(updatePointerPoints);
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [phase, updatePointerPoints]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = entry.contentRect.width;
      const computedScale = Math.min(
        Math.max(width / DESIGN_WIDTH, MIN_SCALE),
        1,
      );
      setScale(computedScale);
    });

    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const clearAll = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };

    const registerTimeout = (fn: () => void, delay: number) =>
      new Promise<void>((resolve) => {
        const timeout = window.setTimeout(() => {
          fn();
          resolve();
        }, delay);
        timers.current.push(timeout);
      });

    const typeInto = (
      text: string,
      setter: Dispatch<SetStateAction<string>>,
      delay: number | ((index: number, nextChar: string) => number),
    ) =>
      new Promise<void>((resolve) => {
        let index = 0;
        const scheduleNext = () => {
          if (index >= text.length) {
            resolve();
            return;
          }

          const currentChar = text[index];
          setter((prev) => prev + currentChar);
          index += 1;

          if (index >= text.length) {
            resolve();
            return;
          }

          const nextDelay =
            typeof delay === 'function' ? delay(index, text[index]) : delay;
          const timeout = window.setTimeout(scheduleNext, nextDelay);
          timers.current.push(timeout);
        };

        const initialDelay =
          typeof delay === 'function' ? delay(0, text[0]) : delay;
        const firstTimeout = window.setTimeout(scheduleNext, initialDelay);
        timers.current.push(firstTimeout);
      });

    const runSequence = async () => {
      clearAll();
      setPhase('prompt');
      setPromptTyped('');
      setDocText('');
      setPointerStage('input');

      await registerTimeout(() => undefined, 260);
      await typeInto(PROMPT_TEXT, setPromptTyped, promptCharDelay);
      await registerTimeout(() => setPointerStage('move'), pointerMoveDelay);
      await registerTimeout(() => setPointerStage('click'), pointerClickDelay);
      await registerTimeout(() => {
        setPhase('document');
        setPointerStage('hidden');
      }, documentStartDelay);
      await typeInto(DOC_TEXT, setDocText, (index) => {
        if (DOC_FIRST_LINE_END === -1) {
          return docCharDelayFast;
        }
        return index <= DOC_FIRST_LINE_END ? docCharDelay : docCharDelayFast;
      });
      await registerTimeout(() => setPhase('features'), featureRevealDelay);
      await registerTimeout(() => undefined, loopPause);
      setCycleKey((prev) => prev + 1);
    };

    runSequence();

    return () => {
      clearAll();
    };
  }, [cycleKey]);

  const pointerAnimation = useMemo(() => {
    const positions = cursorPositions.current;
    const activePos =
      pointerStage === 'move' || pointerStage === 'click'
        ? positions.target
        : positions.input;

    const basePos = phase === 'prompt' ? positions.input : positions.target;

    switch (pointerStage) {
      case 'input':
        return {
          opacity: 1,
          x: `${positions.input.x}%`,
          y: `${positions.input.y}%`,
          rotate: -6,
          scale: 1,
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
        };
      case 'move':
        return {
          opacity: 1,
          x: `${activePos.x}%`,
          y: `${activePos.y}%`,
          rotate: -8,
          scale: 1,
          transition: {
            duration: 0.9,
            ease: [0.26, 0.84, 0.25, 1] as const,
          },
        };
      case 'click':
        return {
          opacity: 1,
          x: `${activePos.x}%`,
          y: `${activePos.y}%`,
          rotate: -8,
          scale: [1, 0.9, 1],
          transition: {
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1] as const,
          },
        };
      default:
        return {
          opacity: 0,
          x: `${basePos.x}%`,
          y: `${basePos.y}%`,
          rotate: phase === 'prompt' ? -6 : -8,
          scale: 1,
          transition: { duration: 0.3 },
        };
    }
  }, [phase, pointerStage]);

  const statusItems = useMemo(
    () =>
      STATUSES.map(({ icon, label }) => (
        <div
          key={`${icon}-${label}`}
          className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
        >
          <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-sm">
            {icon}
          </span>
          <span className="flex items-center gap-1">
            <span className="relative mr-1 inline-flex size-2 items-center justify-center">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {label}
          </span>
        </div>
      )),
    [],
  );

  const scaledWidth = DESIGN_WIDTH * scale;
  const scaledHeight = DESIGN_HEIGHT * scale;
  const framePadding = Math.max(20 * scale, 12);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/5 shadow-[0_24px_60px_rgba(31,37,55,0.2)] backdrop-blur-3xl',
        className,
      )}
      style={{ padding: framePadding, minHeight: scaledHeight + framePadding * 2 }}
    >
      <Image
        src="/images/hero_left.png"
        alt="AI tender workflow background"
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover object-left md:object-center"
      />
      <div className="absolute inset-0 bg-white/8" />

      <div
        className="relative flex items-center justify-center"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <motion.div
            ref={cardRef}
            key={phase === 'prompt' ? 'prompt-card' : 'document-card'}
            className="flex h-full w-full flex-col rounded-[18px] border border-white/70 bg-white p-7 shadow-[0_16px_32px_rgba(17,24,39,0.15)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-[#f26a3c] via-[#f58c4f] to-[#f8a165] text-[1.1rem] font-semibold text-white shadow-[0_14px_24px_rgba(242,106,60,0.3)]">
                  I
                </span>
                <div>
                  <p className="text-[1.25rem] font-semibold text-slate-900">
                    RFT Analysis Engine
                  </p>
                  <p className="text-[0.92rem] text-slate-500">
                    Instant requirement extraction and win strategy insights
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">{statusItems}</div>
            </header>

            <div className="relative mt-8 flex-1">
              <AnimatePresence mode="wait">
                {phase === 'prompt' ? (
                  <motion.div
                    key="prompt"
                    ref={promptRef}
                    className="flex h-full flex-col justify-between rounded-[16px] border border-[#e0e7ef] bg-white px-6 py-5 shadow-[0_18px_28px_rgba(15,23,42,0.08)]"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex-1 pr-4 pt-1">
                      <p className="text-lg text-slate-400">
                        {promptTyped.length > 0 ? (
                          <span className="font-medium text-slate-700">
                            {promptTyped}
                            <motion.span
                              className="ml-0.5 inline-block h-5 w-px align-middle bg-slate-400"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: 'easeInOut',
                              }}
                            />
                          </span>
                        ) : (
                          'Ask a question'
                        )}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      ref={submitRef}
                      className="grid size-12 place-items-center rounded-xl border border-[#dcd6ff] bg-[#f3efff] text-[#5a4bb5] shadow-inner"
                      animate={
                        pointerStage === 'click'
                          ? { scale: [1, 0.88, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12H19"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 5L19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.article
                    key="document"
                    className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e5e5f0] bg-white px-6 py-6 shadow-[0_20px_36px_rgba(15,23,42,0.14)]"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter:
                        phase === 'features'
                          ? 'blur(10px)'
                          : 'blur(0px)',
                      scale: phase === 'features' ? 0.98 : 1,
                    }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <motion.div
                      className="flex items-center gap-3 border-b border-[#ececf4] pb-4"
                      animate={{
                        opacity: phase === 'features' ? 0.65 : 1,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[#f26a3c] via-[#f58c4f] to-[#f8a165] text-white shadow-[0_10px_20px_rgba(242,106,60,0.25)]">
                        <FileText className="size-[15px]" strokeWidth={2.1} />
                      </span>
                      <p className="text-base font-medium text-slate-600">
                        Generated insights
                      </p>
                    </motion.div>
                    <motion.pre
                      className="mt-6 flex-1 whitespace-pre-wrap rounded-2xl border border-[#e4dffe] bg-white/95 px-6 py-5 text-left font-sans text-[15px] leading-[1.65] tracking-[-0.01em] text-slate-700 first-line:font-semibold first-line:text-slate-900"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {docText || ' '}
                      {phase === 'document' && docText.length < DOC_TEXT.length && (
                        <motion.span
                          className="ml-0.5 inline-block h-5 w-[2px] translate-y-[2px] bg-slate-500 align-top"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </motion.pre>
                  </motion.article>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {phase === 'features' &&
                  FEATURE_PILLS.map((pill, idx) => (
                    <motion.div
                      key={pill.label}
                      className="absolute rounded-full bg-[#f26a3c] px-3 py-1.5 text-xs font-medium text-white shadow-[0_18px_35px_rgba(242,106,60,0.28)] sm:px-4 sm:text-sm md:px-5 md:py-2"
                      style={{
                        ...('top' in pill ? { top: pill.top } : {}),
                        ...('left' in pill ? { left: pill.left } : {}),
                        ...('right' in pill ? { right: pill.right } : {}),
                        ...('bottom' in pill ? { bottom: pill.bottom } : {}),
                      }}
                      initial={{ opacity: 0, y: 16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      transition={{
                        delay: 0.6 + idx * 0.35,
                        duration: 0.5,
                        ease: [0.28, 0.75, 0.24, 1],
                      }}
                    >
                      {pill.label}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute left-0 top-0 hidden md:block"
            style={{ transformOrigin: '0 0' }}
            animate={pointerAnimation}
            initial={false}
          >
            <svg
              viewBox="0 0 36 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9 text-slate-900 drop-shadow-[0_14px_18px_rgba(15,23,42,0.25)]"
            >
              <path
                d="M6 4V30.5L12.8 24.4L16.4 38.2L21.6 36.6L18 22.6H30Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

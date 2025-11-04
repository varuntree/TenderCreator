'use client';

import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'typing' | 'pointer' | 'document' | 'highlights';

const typingPrompt = 'Predict key trends in digital marketing for 2025';

const integrations = [
  { key: 'web', label: 'READY', badge: 'WEB' },
  { key: 'sharepoint', label: 'READY', badge: 'SP' },
  { key: 'salesforce', label: 'READY', badge: 'SF' },
];

const documentLines = [
  'In 2025, digital marketing is expected to be shaped by several key trends:',
  '1. Advanced AI Integration accelerates personalization across every channel.',
  '2. Voice-first discovery unlocks new moments for customer engagement.',
  '3. Bite-sized content builds trust across emerging surfaces.',
];

const highlightPills = [
  {
    key: 'personalization',
    text: 'personalization',
    className:
      'left-[10%] top-[32%] sm:left-[12%] sm:top-[30%] md:left-[14%] md:top-[33%]',
  },
  {
    key: 'bite-sized',
    text: 'bite-sized content',
    className:
      'right-[12%] top-[42%] sm:right-[14%] sm:top-[40%] md:right-[16%] md:top-[40%]',
  },
  {
    key: 'hybrid',
    text: 'blending physical and digital',
    className:
      'left-[28%] bottom-[18%] sm:left-[30%] sm:bottom-[16%] md:left-[32%] md:bottom-[18%]',
  },
];

export default function HeroAnimationCard() {
  const [phase, setPhase] = useState<Phase>('typing');
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [showCaret, setShowCaret] = useState(true);
  const [typedLines, setTypedLines] = useState<string[]>(() =>
    documentLines.map(() => ''),
  );
  const pointerControls = useAnimationControls();
  const documentCompletionResolver = useRef<(() => void) | null>(null);

  useEffect(() => {
    let caretInterval: number | undefined;
    if (phase === 'typing' || phase === 'pointer') {
      caretInterval = window.setInterval(() => {
        setShowCaret((prev) => !prev);
      }, 500);
    } else {
      setShowCaret(false);
    }

    return () => {
      if (caretInterval) {
        window.clearInterval(caretInterval);
      }
    };
  }, [phase]);

  useEffect(() => {
    pointerControls.set({ opacity: 0, x: -64, y: -28, scale: 1 });
  }, [pointerControls]);

  useEffect(() => {
    let cancelled = false;

    const animatePointer = async () => {
      pointerControls.stop();
      pointerControls.set({ opacity: 0, x: -64, y: -28, scale: 1 });

      await pointerControls.start({
        opacity: [0, 1, 1],
        x: [-64, -24, 74],
        y: [-28, -12, 36],
        transition: {
          duration: 1.1,
          times: [0, 0.45, 1],
          ease: [[0.22, 1, 0.36, 1], [0.22, 1, 0.36, 1]],
        },
      });

      if (cancelled) {
        return;
      }

      await pointerControls.start({
        scale: [1, 0.86, 1],
        transition: { duration: 0.32, times: [0, 0.5, 1], ease: 'easeInOut' },
      });
    };

    if (phase === 'pointer') {
      animatePointer();
    } else if (phase === 'typing') {
      pointerControls.stop();
      pointerControls.set({ opacity: 0, x: -64, y: -28, scale: 1 });
    } else {
      pointerControls.stop();
      pointerControls.start({ opacity: 0, transition: { duration: 0.2 } });
    }

    return () => {
      cancelled = true;
    };
  }, [phase, pointerControls]);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          const idx = timers.indexOf(timer);
          if (idx !== -1) {
            timers.splice(idx, 1);
          }
          resolve();
        }, duration);
        timers.push(timer);
      });

    const run = async () => {
      await wait(200);

      while (!cancelled) {
        setPhase('typing');
        setDisplayedPrompt('');

        await wait(320);

        for (let index = 1; index <= typingPrompt.length && !cancelled; index += 1) {
          setDisplayedPrompt(typingPrompt.slice(0, index));
          if (index < typingPrompt.length) {
            await wait(46);
          }
        }

        if (cancelled) {
          break;
        }

        await wait(220);
        setPhase('pointer');
        await wait(1500);

        if (cancelled) {
          break;
        }

        const documentDone = new Promise<void>((resolve) => {
          documentCompletionResolver.current = resolve;
        });
        setPhase('document');
        await documentDone;
        documentCompletionResolver.current = null;

        if (cancelled) {
          break;
        }

        await wait(420);

        if (cancelled) {
          break;
        }

        setPhase('highlights');
        await wait(2200);
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (phase !== 'document') {
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    setTypedLines(documentLines.map(() => ''));

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          const idx = timers.indexOf(timer);
          if (idx !== -1) {
            timers.splice(idx, 1);
          }
          resolve();
        }, duration);
        timers.push(timer);
      });

    const typeDocument = async () => {
      for (let lineIndex = 0; lineIndex < documentLines.length && !cancelled; lineIndex += 1) {
        const line = documentLines[lineIndex];

        for (let charIndex = 1; charIndex <= line.length && !cancelled; charIndex += 1) {
          setTypedLines((prev) => {
            const next = [...prev];
            next[lineIndex] = line.slice(0, charIndex);
            return next;
          });
          if (charIndex < line.length) {
            await wait(24);
          }
        }

        if (cancelled) {
          return;
        }

        await wait(140);
      }

      if (!cancelled) {
        documentCompletionResolver.current?.();
      }
    };

    typeDocument();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      documentCompletionResolver.current?.();
    };
  }, [phase]);

  const caret = useMemo(
    () =>
      showCaret ? (
        <span className="ml-[2px] inline-block h-[1.35em] w-[2px] bg-foreground/70" />
      ) : null,
    [showCaret],
  );

  return (
    <div className="pointer-events-none w-full max-w-[680px] sm:max-w-[740px] md:max-w-[800px] rounded-[32px] border border-white/65 bg-white/75 p-[1.5px] shadow-[0_35px_90px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="relative w-full min-h-[300px] rounded-[30px] bg-white/96 p-7 shadow-[0_28px_70px_rgba(255,120,79,0.32)] sm:min-h-[360px] sm:p-8 md:min-h-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          {(phase === 'typing' || phase === 'pointer') && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF784F] text-lg font-semibold text-white">
                  I
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-foreground">Industry Trends Agent</p>
                  <p className="text-sm text-foreground/55">Multichannel research companion</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.key}
                    className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white/75 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-foreground/60 shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
                  >
                    <span className="flex h-7 min-w-[2.5rem] items-center justify-center rounded-xl bg-foreground/10 text-[0.62rem] font-semibold tracking-[0.18em] text-foreground/75">
                      {integration.badge}
                    </span>
                    {integration.label}
                  </div>
                ))}
              </div>

              <div className="relative mt-auto">
                <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 text-base font-medium text-foreground shadow-[0_15px_35px_rgba(0,0,0,0.12)]">
                  <span className="flex min-h-[1.4em] items-center">
                    {displayedPrompt}
                    {caret}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/5 bg-foreground/5 text-foreground/70">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-foreground/70"
                    >
                      <path
                        d="M18 6.5v6.3a2.2 2.2 0 01-2.2 2.2H6.98l1.76 1.75a.9.9 0 11-1.27 1.27l-3.34-3.34a.9.9 0 010-1.27l3.34-3.34a.9.9 0 111.27 1.27l-1.79 1.79H15.8a.4.4 0 00.4-.4V6.5a.9.9 0 111.8 0z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>

                <motion.div
                  animate={pointerControls}
                  className="pointer-events-none absolute left-[58%] top-[58%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:left-[60%]"
                >
                  <svg
                    width="30"
                    height="34"
                    viewBox="0 0 30 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
                  >
                    <path
                      d="M6.662 1.004L25.882 17.268a.9.9 0 01-.461 1.566l-7.659.988 3.413 9.598a.9.9 0 01-1.535.912l-5.456-6.165-4.759 6.248a.9.9 0 01-1.612-.538l-.261-27.32a.9.9 0 011.51-.657z"
                      fill="currentColor"
                      className="text-black"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'document' && (
            <DocumentStage key="document" highlight={false} lines={typedLines} />
          )}

          {phase === 'highlights' && (
            <DocumentStage key="highlights" highlight lines={documentLines} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DocumentStage({ highlight, lines }: { highlight: boolean; lines: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white/92 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.22)] backdrop-blur-[2px]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF784F] text-base font-semibold text-white">
          I
        </div>
        <div className="text-left text-base font-medium text-foreground/80">
          Industry Trends Brief
        </div>
      </div>

      <div className="relative mt-5 flex-1">
        <div
          className={`flex h-full flex-col justify-start space-y-3 rounded-2xl border border-white/60 bg-white/85 px-5 py-4 text-sm leading-relaxed text-foreground shadow-inner transition-all duration-300 transform ${highlight ? 'scale-[0.96] blur-[1.2px] opacity-70' : ''}`}
        >
          {lines.map((line, index) => (
            <motion.p
              key={`${index}-${highlight ? 'h' : 'd'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: highlight ? 0.45 : 1, y: 0 }}
              transition={{
                delay: 0.12 + index * 0.14,
                duration: 0.4,
                ease: [0.25, 0.8, 0.25, 1],
              }}
              className="min-h-[1.1em]"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {highlight && (
          <div className="pointer-events-none absolute inset-0">
            {highlightPills.map((pill, index) => (
              <motion.span
                key={pill.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4 + index * 0.18,
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`absolute rounded-full bg-[#E5542A] px-4 py-2 text-xs font-medium capitalize tracking-wide text-white shadow-[0_18px_32px_rgba(229,84,42,0.38)] ${pill.className}`}
              >
                {pill.text}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

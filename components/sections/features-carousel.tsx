'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image, { type StaticImageData } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import commandVisual from '@/public/images/f1.png';
import embedVisual from '@/public/images/f2.png';
import rerankVisual from '@/public/images/f3.png';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

type Feature = {
  id: string;
  title: string;
  tagline: string;
  bullets: string[];
  image: {
    src: StaticImageData;
    alt: string;
  };
  accent: {
    from: string;
    to: string;
  };
};

const features: Feature[] = [
  {
    id: 'analysis',
    title: 'Intelligent RFT Analysis',
    tagline: 'Upload tender documents and extract every requirement in seconds',
    bullets: [
      'Automatically identifies mandatory vs. optional requirements across all RFT sections',
      'Extracts weighted evaluation criteria with precise evidence mapping to source documents',
      'Generates comprehensive compliance checklists ensuring nothing is overlooked in your response',
    ],
    image: {
      src: commandVisual,
      alt: 'RFT analysis showing compliance requirements extraction with weighted criteria and evidence sources',
    },
    accent: {
      from: '#EA594F',
      to: '#4754F0',
    },
  },
  {
    id: 'compliance',
    title: 'Smart Compliance Tracking',
    tagline: 'Real-time compliance matrix with AI-powered response generation',
    bullets: [
      'Tracks every requirement with visual status indicators showing reviewed, pending, and needs-attention items',
      'AI generates draft responses by mapping your company profile strengths to specific tender questions',
      'Maintains complete audit trail linking every answer to source evidence and company documentation',
    ],
    image: {
      src: embedVisual,
      alt: 'Compliance matrix interface tracking requirements with draft answers and review status',
    },
    accent: {
      from: '#4A67F5',
      to: '#44C0F5',
    },
  },
  {
    id: 'export',
    title: 'Professional Document Export',
    tagline: 'Submission-ready tender packs with government-grade formatting',
    bullets: [
      'Exports to PDF, Word, and Excel with automatic formatting for government tender standards',
      'Combines compliance matrices, pricing schedules, and certifications into single submission package',
      'Applies custom branding and templates ensuring professional presentation across all documents',
    ],
    image: {
      src: rerankVisual,
      alt: 'Submission pack exporter with formatting preview and export options for multiple file formats',
    },
    accent: {
      from: '#F38B2C',
      to: '#EA525A',
    },
  },
];

const AUTO_PLAY_DURATION = 6_000;

export default function FeaturesShowcase() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFeature = features[activeIndex];

  const otherFeatures = useMemo(
    () =>
      features
        .map((feature, index) => ({ feature, sourceIndex: index }))
        .filter(({ sourceIndex }) => sourceIndex !== activeIndex),
    [activeIndex],
  );

  const accentStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(90deg, ${activeFeature.accent.from}, ${activeFeature.accent.to})`,
    }),
    [activeFeature],
  );

  const containerVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: prefersReducedMotion
      ? {}
      : {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
            mass: 0.9,
          },
        },
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeout = window.setTimeout(() => {
      setActiveIndex((previous) => (previous + 1) % features.length);
    }, AUTO_PLAY_DURATION);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, prefersReducedMotion]);

  return (
    <section id="features-carousel" className="section-padding relative px-[5px]">
      <div className="container">
        <motion.h2
          className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-balance lg:text-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
        >
          From RFT Upload to Submission-Ready Documents
        </motion.h2>

        <motion.div
          className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <div className="flex justify-end">
            <div className="relative overflow-hidden rounded-[36px] border border-black/5 bg-[radial-gradient(circle_at_top,#123024_0%,#0F211B_55%,#091611_100%)] p-6 shadow-[0_38px_120px_-50px_rgba(7,16,12,0.9)] lg:p-12">
              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,#3FD0AA1a_0%,transparent_70%)]" />
              <div className="relative z-10 ml-auto w-full max-w-[620px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, y: 28, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -24, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                  >
                    <div className="relative w-full overflow-hidden rounded-[26px] border border-white/8 shadow-[0_40px_60px_-40px_rgba(0,0,0,0.9)]">
                      <Image
                        src={activeFeature.image.src}
                        alt={activeFeature.image.alt}
                        priority
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/7" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl lg:pl-12">
            <div className="relative block h-1 w-40 overflow-hidden rounded-full bg-border/60">
              <motion.span
                key={activeFeature.id}
                aria-hidden
                style={accentStyle}
                className="absolute inset-y-0 left-0 h-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: prefersReducedMotion ? 0.01 : AUTO_PLAY_DURATION / 1000,
                  ease: 'linear',
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <h3 className="mt-8 text-[32px] font-semibold text-foreground lg:text-[40px]">
                  {activeFeature.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {activeFeature.tagline}
                </p>

                <ul className="mt-8 space-y-4 text-base leading-relaxed text-foreground/90">
                  {activeFeature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center text-foreground">
                        <CheckCircle2 className="size-6" strokeWidth={1.8} />
                      </span>
                      <span className="text-muted-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 border-t border-border" />
            {otherFeatures.map(({ feature, sourceIndex }) => (
              <div key={feature.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveIndex(sourceIndex)}
                  className={cn(
                    'group flex w-full items-center justify-between py-5 text-left text-lg font-medium transition-colors duration-200',
                    'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label={`Show ${feature.title} feature`}
                >
                  {feature.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

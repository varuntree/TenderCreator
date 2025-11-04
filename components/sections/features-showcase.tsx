'use client';

import {
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  LibraryBig,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import type { ComponentType } from 'react';

import { AnswerLibraryReusePreview } from '@/components/feature-previews/answer-library-reuse';
import { ApprovalsAuditTrailPreview } from '@/components/feature-previews/approvals-audit-trail';
import { EvaluationScorePredictorPreview } from '@/components/feature-previews/evaluation-score-predictor';
import { EvidenceSourcesLibraryPreview } from '@/components/feature-previews/evidence-sources-library';
import { PricingScheduleAssistantPreview } from '@/components/feature-previews/pricing-schedule-assistant';
import { WinStrategyBuilderPreview } from '@/components/feature-previews/win-strategy-builder';
import Noise from '@/components/noise';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

type Feature = {
  id: string;
  icon: typeof Workflow;
  title: string;
  description: string;
  bullets: string[];
  preview: ComponentType;
};

const features: Feature[] = [
  {
    id: 'win-strategy',
    icon: Workflow,
    title: 'Win Strategy Builder',
    description:
      'AI maps RFT evaluation criteria to your company strengths and auto-generates persuasive win themes that resonate with evaluators.',
    bullets: [
      'Auto-maps RFT criteria to company strengths',
      'Generates compelling win themes instantly',
      'Highlights competitive differentiators',
      'Creates consistent messaging across sections',
    ],
    preview: WinStrategyBuilderPreview,
  },
  {
    id: 'evidence-library',
    icon: LibraryBig,
    title: 'Evidence & Sources Library',
    description:
      'Centralized repository for certificates, case studies, policies, and team CVs with automatic citation tracking.',
    bullets: [
      'Centralized document repository',
      'Smart citation tracking across responses',
      'Quick search and retrieval',
      'Version control for all assets',
    ],
    preview: EvidenceSourcesLibraryPreview,
  },
  {
    id: 'answer-library',
    icon: BookOpenCheck,
    title: 'Answer Library & Reuse',
    description:
      'AI recommends your highest-performing past responses with intelligent fit scoring and one-click insertion.',
    bullets: [
      'AI-powered response recommendations',
      'Intelligent fit scoring',
      'Freshness indicators for content',
      'One-click insertion into responses',
    ],
    preview: AnswerLibraryReusePreview,
  },
  {
    id: 'pricing-schedule',
    icon: Calculator,
    title: 'Pricing Schedule Assistant',
    description:
      'Validates Bill of Quantities in real-time, catches errors, and exports government-compliant spreadsheets.',
    bullets: [
      'Real-time BoQ validation',
      'Catches formula errors and missing rates',
      'Compliant spreadsheet exports',
      'Eliminates costly pricing mistakes',
    ],
    preview: PricingScheduleAssistantPreview,
  },
  {
    id: 'score-predictor',
    icon: CheckCircle2,
    title: 'Evaluation Score Predictor',
    description:
      'Simulates evaluator scoring based on RFT weighting to predict your competitive position before submission.',
    bullets: [
      'Simulates evaluator scoring',
      'Predicts competitive position',
      'Identifies improvement areas',
      'Maximizes win probability',
    ],
    preview: EvaluationScorePredictorPreview,
  },
  {
    id: 'approvals-audit',
    icon: ShieldCheck,
    title: 'Approvals & Audit Trail',
    description:
      'Assigns section owners and reviewers, tracks every revision, and maintains compliance-ready audit trails.',
    bullets: [
      'Role-based assignments for ownership',
      'Complete revision tracking',
      'Full audit trail for compliance',
      'Quality assurance documentation',
    ],
    preview: ApprovalsAuditTrailPreview,
  },
];

export default function FeaturesShowcase() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Animation variants
  const featureItem = {
    hidden: {
      opacity: 0,
      y: 30,
      filter: 'blur(2px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 25,
        mass: 1,
        duration: 0.6,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 0 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(1px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  return (
    <section
      id="features-showcase"
      className="section-padding relative overflow-hidden px-[5px]"
    >
      <Noise />
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="max-w-4xl space-y-6 md:space-y-8"
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(2px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 25,
                duration: 0.6,
              },
            },
          }}
        >
          <h2 className="text-4xl tracking-tight lg:text-5xl">
            Everything You Need to Build Winning Tenders
          </h2>
          <p className="text-muted-foreground text-lg leading-snug">
            Strategic insights, content reuse, pricing validation, and team collaboration—all in one platform designed to help Australian businesses win more government and corporate contracts.
          </p>
        </motion.div>

        {/* Features */}
        <div className="mt-8 space-y-8 md:mt-14 md:space-y-14 lg:mt-24 lg:space-y-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const PreviewComponent = feature.preview;
            const isReverse = index % 2 === 1;

            return (
              <motion.div
                key={feature.id}
                className={cn(
                  `grid items-center gap-4 lg:grid-cols-2 lg:gap-16`,
                  !isReverse && 'lg:grid-flow-col-dense',
                )}
                variants={featureItem}
                initial={prefersReducedMotion ? 'visible' : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Content */}
                <motion.div
                  className={cn(
                    'space-y-6 md:space-y-7',
                    !isReverse && 'lg:col-start-2',
                  )}
                  variants={contentVariants}
                >
                  {/* Icon */}
                  <Card
                    className={cn(
                      `flex size-12 shrink-0 items-center justify-center rounded-sm !p-0 md:size-16`,
                    )}
                  >
                    <IconComponent className="size-6" strokeWidth={2.1} />
                  </Card>

                  {/* Title */}
                  <h3 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-muted-foreground md:text-lg">
                    {feature.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-foreground" />
                        <span className="text-sm text-foreground/90 md:text-base">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Image */}
                <motion.div
                  className={cn('relative', !isReverse && 'lg:col-start-1')}
                  variants={imageVariants}
                >
                  <Card className="border-input/80 overflow-hidden rounded-[1.75rem] border bg-white/85 p-0 shadow-[0_14px_30px_rgba(10,84,77,0.12)]">
                    <CardContent className="p-0">
                      <PreviewComponent />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          className="mt-12 flex justify-center md:mt-16 lg:mt-20"
          initial={prefersReducedMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 25,
                delay: 0.2,
              },
            },
          }}
        >
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base font-medium"
            asChild
          >
            <Link href="#pricing">Request a demo</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

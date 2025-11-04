'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

import { AnimatedAIOrchestrator } from '@/components/experiments/animated-ai-orchestrator';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

export default function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1] as const,
        delay: 0.4,
      },
    },
  };

  return (
    <section className="relative flex flex-col items-center bg-white px-[5px] pb-16 pt-14 md:pb-20 md:pt-18 lg:pt-20">
      <motion.div
        className="w-full text-center"
        variants={containerVariants}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="mx-auto w-full max-w-[min(1040px,calc(100vw-48px))] font-display text-balance text-[clamp(2.35rem,5.4vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.005em] text-foreground"
        >
          Create Winning <GradientText>Tender</GradientText> Responses
          <span className="block">in Days, Not Weeks</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="mx-auto mt-4 w-full max-w-[min(700px,calc(100vw-64px))] text-base text-muted-foreground sm:mt-5 sm:text-lg md:text-[1.1rem] md:leading-relaxed"
        >
          AI-powered platform that analyzes RFT requirements, generates compliant responses, and creates professional tender documents—reducing preparation time by 70% for Australian businesses.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="mx-auto mt-8 flex w-full max-w-[min(520px,calc(100vw-40px))] flex-col items-center justify-center gap-4 sm:mt-9 sm:max-w-none sm:flex-row"
        >
          <Button
            size="lg"
            className="w-full rounded-full bg-primary px-9 py-5 text-base font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
          >
            Request a demo
          </Button>
          <Link
            href="#features"
            className="text-base font-medium text-foreground underline decoration-2 underline-offset-8 hover:text-foreground/70"
          >
            Explore features
          </Link>
        </motion.div>

        {/* Image Section - 70-30 Split */}
        <motion.div
          variants={imageVariants}
          className="mt-12 w-full md:mt-14 lg:mt-16"
        >
          <div className="mx-auto grid w-full max-w-[calc(100vw-20px)] items-stretch gap-[min(0.75rem,2vw)] px-2 sm:px-3 md:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
            {/* Left media */}
            <div className="relative flex min-h-[clamp(300px,52vw,460px)] items-center justify-center overflow-hidden rounded-[18px] sm:rounded-[20px] md:rounded-[22px]">
              <AnimatedAIOrchestrator className="h-full w-full" />
            </div>

            {/* Right media */}
            <div className="relative min-h-[clamp(300px,52vw,460px)] overflow-hidden rounded-[18px] sm:rounded-[20px] md:rounded-[22px]">
              <Image
                src="/images/hero_right.png"
                alt="Professional smiling while reviewing tender response"
                fill
                priority
                className="h-full w-full object-cover object-center"
                sizes="(min-width: 1440px) 352px, (min-width: 1024px) 30vw, (min-width: 768px) 48vw, 92vw"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

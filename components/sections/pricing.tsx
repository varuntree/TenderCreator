'use client';

import { Check, ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import Noise from '@/components/noise';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const pricingPlans = {
  essential: {
    title: 'Essential',
    subtitle: 'A streamlined plan ideal for',
    description: 'individuals or small teams',
    monthlyPrice: 79,
    annualPrice: 777,
    popular: false,
    features: [
      { name: 'Create up to 1 tender per month', included: true },
      { name: 'Upload up to 10 documents per month', included: true },
      { name: 'AI-powered RFT analysis', included: true },
      { name: 'Smart compliance tracking', included: true },
      { name: 'Professional document export', included: true },
      { name: 'Answer library & reuse', included: false },
      { name: 'Advanced team collaboration', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: {
      text: 'All core features to create winning tenders quickly',
      button: 'Get Started',
    },
  },
  growth: {
    title: 'Growth',
    subtitle: 'Designed for expanding teams',
    description: 'ready to scale tendering',
    monthlyPrice: 249,
    annualPrice: 2450,
    popular: true,
    features: [
      { name: 'Create up to 3 tenders per month', included: true },
      { name: 'Upload up to 20 documents per month', included: true },
      { name: 'Win strategy builder', included: true },
      { name: 'Evidence & sources library', included: true },
      { name: 'Answer library & reuse', included: true },
      { name: 'Pricing schedule assistant', included: true },
      { name: 'Team collaboration tools', included: true },
      { name: 'Email support', included: true },
    ],
    cta: {
      text: 'Advanced features with more flexibility and workflows',
      button: 'Get Started',
    },
  },
  professional: {
    title: 'Professional',
    subtitle: 'Built for professionals managing',
    description: 'high-volume complex tenders',
    monthlyPrice: 749,
    annualPrice: 7370,
    popular: false,
    features: [
      { name: 'Create up to 7 tenders per month', included: true },
      { name: 'Upload up to 50 documents per month', included: true },
      { name: 'Evaluation score predictor', included: true },
      { name: 'Approvals & audit trail', included: true },
      { name: 'Advanced automation tools', included: true },
      { name: 'Enhanced collaboration features', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Priority support & onboarding', included: true },
    ],
    cta: {
      text: 'Priority access and advanced automation for professionals',
      button: 'Get Started',
    },
  },
  business: {
    title: 'Business',
    subtitle: 'Tailored for larger teams managing',
    description: 'collaborative tenders at scale',
    monthlyPrice: 1499,
    annualPrice: 14750,
    popular: false,
    features: [
      { name: 'Unlimited tenders per month', included: true },
      { name: 'Unlimited document uploads', included: true },
      { name: 'Custom workflows & automation', included: true },
      { name: 'Advanced team management tools', included: true },
      { name: 'API access for integrations', included: true },
      { name: 'Custom branding & templates', included: true },
      { name: 'Dedicated success manager', included: true },
      { name: '24/7 priority support', included: true },
    ],
    cta: {
      text: 'Team management tools and custom workflows at scale',
      button: 'Contact Sales',
    },
  },
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="section-padding relative overflow-hidden px-[5px]">
      {/* Background Image with Mask */}
      <div className="absolute size-full mask-t-from-50% mask-t-to-100% mask-b-from-50% mask-b-to-90%">
        <div
          className={cn(
            'absolute size-full rounded-full blur-3xl will-change-transform',
            'top-0 left-0 -translate-y-1/3 md:-translate-x-1/3 md:translate-y-0',
          )}
          style={{ backgroundColor: '#0A544D' }}
        />
        <div
          className={cn(
            'absolute size-full rounded-full blur-3xl will-change-transform',
            'right-0 bottom-0 translate-y-1/3 md:top-0 md:translate-x-1/3 md:-translate-y-0',
          )}
          style={{ backgroundColor: '#f26a3c' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="from-background/30 to-background/30 pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b"
      />
      <div className="relative z-[2]">
        <Noise />
      </div>

      <div className="bigger-container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
          {/* Left side - Title and subtitle */}
          <div className="">
            <h2 className="text-center text-4xl font-medium tracking-tighter md:text-start md:text-6xl md:leading-none lg:text-7xl">
              Choose the plan that <br className="hidden md:block" />
              fits your tender volume
            </h2>
            <p className="text-muted-foreground/70 mt-3 hidden text-lg leading-relaxed md:block lg:mt-4">
              From small teams to enterprise-scale tendering, find the perfect plan to accelerate your tender response workflow.
            </p>
          </div>

          {/* Right side - Billing Switch */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-lg font-semibold transition-colors',
                  !isAnnual ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                Monthly
              </span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span
                className={cn(
                  'text-lg font-semibold transition-colors',
                  isAnnual ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                Annual
              </span>
            </div>
            <p className="text-center text-sm font-medium">
              Save 18% on annual plan
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-8 grid gap-4 lg:mt-12 lg:grid-cols-2 xl:grid-cols-2">
          {Object.entries(pricingPlans).map(([key, plan]) => (
            <Card
              key={key}
              className="bg-border hover:shadow-primary/5 h-full gap-4 p-3 transition-all duration-300 hover:shadow-lg md:p-6"
            >
              <CardHeader className="bg-card rounded-md p-4 md:p-6">
                {/* Header with title and badge */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl">{plan.title}</h3>
                  {plan.popular && (
                    <Badge className="rounded-none bg-[#FFE6D0] px-4 py-1 text-[#FB6D21] dark:bg-[#6b3200] dark:text-[#fcaa7d]">
                      Popular Plan
                    </Badge>
                  )}
                </div>

                {/* Subtitle and description */}
                <div className="mt-6 text-2xl md:mt-8 md:space-y-2 md:text-4xl">
                  <div className="text-muted-foreground/70">
                    {plan.subtitle}
                  </div>
                  <div className="font-medium">{plan.description}</div>
                </div>

                {/* Price and CTA section */}
                <div className="mt-8 flex flex-col gap-6 md:mt-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-medium">$</span>
                    <span className="text-5xl md:text-6xl">
                      {isAnnual ? plan.annualPrice.toLocaleString() : plan.monthlyPrice}
                    </span>
                    <span className="text-2xl">{isAnnual ? '/year' : '/month'}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {plan.cta.text}
                  </p>
                  <Button className="h-10 w-full !pl-5.5 md:w-auto">
                    {plan.cta.button}
                    <div className="bg-background/15 border-background/10 grid size-5.5 place-items-center rounded-full border">
                      <ChevronRight className="size-4" />
                    </div>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="">
                      {feature.included ? (
                        <div className="border-muted-foreground flex size-4 items-center justify-center rounded-full border-[0.5px]">
                          <Check className="text-muted-foreground size-2" />
                        </div>
                      ) : (
                        <div className="border-muted-foreground flex size-4 items-center justify-center rounded-full border-[0.5px]">
                          <X className="text-muted-foreground/70 size-2" />
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        feature.included
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/70',
                      )}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

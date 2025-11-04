'use client';

import { MailIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import Noise from '@/components/noise';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const stats = [
  {
    value: '2025',
    label: 'Launched',
  },
  {
    value: '70%',
    label: 'Time Savings',
  },
];

const performanceStats = [
  {
    value: '70%',
    description:
      'Average time reduction in tender preparation reported by organizations using TenderCreator, transforming weeks of work into days of strategic advantage.',
  },
  {
    value: 'AI-Powered',
    description:
      'Intelligent RFT analysis engine that automatically extracts requirements, identifies evaluation criteria, and generates compliant response frameworks in minutes.',
  },
  {
    value: '100%',
    description:
      'Australian data sovereignty with ISO 27001 certified infrastructure, ensuring complete compliance with government security and privacy requirements.',
  },
];

export default function WhyWeBegan() {
  return (
    <section className="section-padding relative">
      <Noise />
      <div className="bigger-container">
        <div className="flex flex-col-reverse items-center gap-8 md:flex-row lg:gap-12">
          <div className="relative h-full w-full md:w-[453px]">
            {/* Background gradient circles */}
            <div className="bg-chart-2 absolute top-0 left-0 size-60 -translate-x-1/6 rounded-full opacity-30 blur-[80px] will-change-transform md:opacity-70" />
            <div className="bg-chart-3 absolute right-0 bottom-0 size-60 -translate-x-1/4 translate-y-1/6 rounded-full opacity-50 blur-[80px] will-change-transform md:opacity-70" />

            <div className="relative aspect-square size-full overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1066&fit=crop"
                alt="Team collaboration"
                fill
                className="rounded-xl object-cover"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="space-y-8 lg:space-y-12">
              <h2 className="text-3xl leading-none font-medium tracking-tight lg:text-4xl">
                Why We Began
              </h2>
              <div>
                <p>
                  We identified critical challenges facing tender teams: fragmented collaboration across departments, missed deadlines, lost proposal documents, and inconsistent brand messaging. These pain points were costing Australian businesses millions in lost opportunities.
                </p>
                <br />
                <p>
                  TenderCreator was born from this insight—a strategic AI-powered platform that automates repetitive tasks, improves content quality, and transforms tender response from a bottleneck into a competitive advantage.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-1 flex-wrap gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="min-w-[200px] flex-1 gap-0 text-center"
                >
                  <CardHeader>
                    <CardTitle className="text-4xl font-medium">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-base">{stat.label}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Access Section */}
        <div className="mt-16 grid items-center gap-8 lg:mt-24 lg:grid-cols-2 lg:gap-12">
          {/* Content Section */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="space-y-8 lg:space-y-12">
              <h2 className="text-3xl leading-none font-medium tracking-tight lg:text-4xl">
                Our Mission: Empowering Australian Businesses
              </h2>
              <div className="">
                <p>
                  TenderCreator&apos;s mission is to empower proposal teams and procurement professionals to respond to government and corporate tenders faster, with higher quality, and greater confidence. We leverage AI to automate repetitive tasks while maintaining the human expertise that wins contracts.
                </p>
                <br />
                <p>
                  Built by Cognitive Creators - AI Solutions, we bring proven AI technology and business integration expertise to deliver measurable ROI for organizations across Australia.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button className="!text-sm shadow-none" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
              <Button
                variant="outline"
                className="border-input !text-sm shadow-none"
                size="lg"
                asChild
              >
                <Link href="/contact">
                  Request a Demo
                  <MailIcon className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid gap-4">
            {/* First row - 2 images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=800&fit=crop"
                  alt="Team collaboration workspace"
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop"
                  alt="Developer workspace"
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-lg">
              {/* Second row - 1 full width image */}
              <Image
                src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&h=800&fit=crop"
                alt="Modern office workspace"
                width={600}
                height={256}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Performance Statistics Cards */}
        <div className="section-padding grid gap-4 !pb-0 md:grid-cols-3">
          {performanceStats.map((stat, index) => (
            <Card key={index} className="bg-border md:gap-10">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

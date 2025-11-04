'use client';

import Image from 'next/image';

import Noise from '@/components/noise';

type Highlight = {
  id: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

const HIGHLIGHTS: Highlight[] = [
  {
    id: 'australian-hosting',
    title: 'Australian data sovereignty',
    description:
      'All tender data hosted exclusively in Australia with ISO 27001 certified infrastructure, ensuring complete compliance with government data residency requirements and IRAP alignment.',
    image: {
      src: '/images/s1.png',
      alt: 'Australian map with server infrastructure showing local data hosting',
      width: 1200,
      height: 1200,
    },
  },
  {
    id: 'security-privacy',
    title: 'Enterprise-grade security',
    description:
      'Bank-level encryption, role-based access controls, and continuous security monitoring protect your sensitive tender information and commercial-in-confidence pricing data at all times.',
    image: {
      src: '/images/s2.png',
      alt: 'Multi-layered security shield representing comprehensive data protection',
      width: 1200,
      height: 1200,
    },
  },
  {
    id: 'permissions-audit',
    title: 'Complete audit compliance',
    description:
      'Immutable audit trails track every edit, review, and approval with timestamp and user attribution—meeting probity requirements for government tender governance and internal compliance.',
    image: {
      src: '/images/s3.png',
      alt: 'Key and timeline showing permissions management and audit trail tracking',
      width: 1200,
      height: 1200,
    },
  },
];

export default function AboutHighlights() {
  return (
    <section
      id="about"
      aria-labelledby="about-section-title"
      className="section-padding relative overflow-hidden px-[5px]"
    >
      <Noise />
      <div className="bigger-container">
        <div className="mx-auto max-w-[920px] text-center">
          <span className="text-muted-foreground/70 text-xs font-semibold uppercase tracking-[0.38em]">
            About
          </span>
          <h2
            id="about-section-title"
            className="mt-5 text-balance text-[clamp(2.3rem,5vw,3.125rem)] leading-tight"
          >
            Built for Australian Government Tender Requirements
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-[620px] text-base leading-relaxed md:text-lg">
            TenderCreator meets the stringent security, data sovereignty, and compliance standards required for government and corporate tender submissions across Australia.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-12">
          {HIGHLIGHTS.map((highlight) => (
            <article
              key={highlight.id}
              className="flex flex-col items-center gap-6 text-center"
            >
              <div className="border-input/70 bg-secondary/10 relative flex h-[220px] w-full max-w-[320px] items-center justify-center overflow-hidden rounded-[1.1rem] border shadow-sm">
                <Image
                  src={highlight.image.src}
                  alt={highlight.image.alt}
                  width={highlight.image.width}
                  height={highlight.image.height}
                  className="h-full w-full object-contain"
                  sizes="(min-width: 1280px) 320px, (min-width: 1024px) 26vw, (min-width: 768px) 28vw, 92vw"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-[1.35rem] font-semibold leading-tight md:text-[1.45rem]">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground/80 text-sm leading-relaxed md:text-base">
                  {highlight.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

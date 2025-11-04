'use client';

import Image from 'next/image';

import Noise from '@/components/noise';

const TEAM_MEMBERS = [
  {
    name: 'SHAUN',
    role: 'Founder - Chief Technology Officer',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686628f9caa373543343b5ff_Shaun.jpg',
  },
  {
    name: 'PETER',
    role: 'Co-Founder - VP of Engineering & Technology',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686627a3794a916bfa553720_Peter.jpg',
  },
  {
    name: 'GEOFF',
    role: 'Co-Founder - Software Development Manager',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686628f99b88798f9d10abd6_Geoff.jpg',
  },
  {
    name: 'ELLA',
    role: 'Software Engineer - AI Solutions',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686628f9102e38d0c6df4e48_Ella.jpg',
  },
  {
    name: 'JACOB',
    role: 'Senior Full Stack Software Engineer',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686628f915cd72651cd1c7b0_Jacob.jpg',
  },
  {
    name: 'LEO',
    role: 'Tech Lead - Backend and Platform',
    image: 'https://cdn.prod.website-files.com/66bd90f05b2e0e345a530475/686628f946a1150eeea09a7a_Leo.jpg',
  },
];

export default function TeamShowcase() {
  return (
    <section className="section-padding relative">
      <Noise />
      <div className="bigger-container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-medium tracking-tight lg:text-4xl">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            A passionate team of developers and AI specialists dedicated to transforming the tendering process for Australian businesses.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-10">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-xl border transition-all duration-300 group-hover:shadow-lg">
                <Image
                  src={member.image}
                  alt={`${member.name} - ${member.role}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Noise from '@/components/noise';

import Logo from './logo';
import { NAV_LINKS } from './navbar';

// Create footer sections from NAV_LINKS
const FOOTER_SECTIONS = [
  {
    title: 'Navigation',
    links: NAV_LINKS.flatMap((link) => [{ name: link.label, href: link.href }]),
  },
];

const SOCIAL_LINKS: { name: string; href: string }[] = [
  // TODO: Update with actual TenderCreator social media URLs
  // {
  //   name: 'LinkedIn',
  //   href: 'https://linkedin.com/company/tendercreator',
  // },
  // {
  //   name: 'Twitter',
  //   href: 'https://twitter.com/tendercreator',
  // },
];

const Footer = () => {
  const pathname = usePathname();

  const hideFooter = [
    '/signin',
    '/signup',
    '/docs',
    '/not-found',
    '/forgot-password',
  ].some((route) => pathname.includes(route));

  if (hideFooter) return null;

  return (
    <footer className="relative border-t py-12">
      <Noise />

      <div className="container">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Logo and tagline */}
          <div className="md:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-4 text-sm">
              AI-powered tender response automation for Australian businesses.
            </p>
          </div>

          {/* Footer sections */}
          {FOOTER_SECTIONS.map((section, index) => (
            <div key={index}>
              <h3 className="text-foreground mb-4 font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social links */}
          {SOCIAL_LINKS.length > 0 && (
            <div>
              <h3 className="text-foreground mb-4 font-semibold">Connect</h3>
              <div className="flex flex-col space-y-3">
                {SOCIAL_LINKS.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-8 text-center">
          <span className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} TenderCreator. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

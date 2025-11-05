'use client';
import { BarChart3, Filter, Link2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Logo from '@/components/layout/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  {
    label: 'Features',
    href: '#',
    subitems: [
      {
        label: 'Intelligent RFT Analysis',
        href: '/#features-carousel',
        description: 'AI-powered requirement extraction in seconds',
        icon: Link2,
      },
      {
        label: 'Smart Compliance Tracking',
        href: '/#features-carousel',
        description: 'Real-time compliance matrix with AI responses',
        icon: BarChart3,
      },
      {
        label: 'Win Strategy & Automation',
        href: '/#features-showcase',
        description: 'Advanced features for competitive advantage',
        icon: Filter,
      },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
];

const ACTION_BUTTONS = [
  { label: 'Sign in', href: '/signin', variant: 'ghost' as const },
  { label: 'Request a demo', href: '/signup', variant: 'default' as const },
];
const Navbar = ({
  initialBannerVisible = true,
}: {
  initialBannerVisible?: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAtLeast } = useMediaQuery();
  const pathname = usePathname();
  const [isBannerVisible, setIsBannerVisible] = useState(initialBannerVisible);
  const hideNavbar = [
    '/signin',
    '/signup',
    '/docs',
    '/not-found',
    '/forgot-password',
    '/dashboard',
    '/organization',
    '/projects',
    '/settings',
  ].some((route) => pathname.includes(route));

  useEffect(() => {
    const handleBannerDismiss = () => {
      setIsBannerVisible(false);
    };

    window.addEventListener('banner-dismissed', handleBannerDismiss);
    return () =>
      window.removeEventListener('banner-dismissed', handleBannerDismiss);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hideNavbar) return null;

  return (
    <header
      className={cn(
        'isolate z-50 transition-all duration-300 ease-in-out',
        isScrolled && isAtLeast('lg')
          ? 'fixed top-0 right-0 left-0 translate-y-2 px-5.5'
          : 'relative',
      )}
    >
      <div
        className={cn(
          'navbar-container relative z-50 grid h-[var(--header-height)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 bg-background transition-all duration-300 ease-in-out',
          isScrolled &&
            isAtLeast('lg') &&
            'h-[calc(var(--header-height)-20px)] max-w-7xl rounded-full border border-border/40 shadow-sm backdrop-blur-md',
        )}
      >
        <Logo wrapperClassName="justify-self-start" className="" />

        <NavigationMenu
          viewport={false}
          className="hidden justify-self-center lg:flex"
        >
          <NavigationMenuList className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {NAV_LINKS.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.subitems ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        'h-auto bg-transparent px-0 py-0 text-base font-medium text-muted-foreground transition-colors hover:text-foreground [&_svg]:ms-2 [&_svg]:size-4',
                        pathname.startsWith(item.href) && 'text-foreground',
                      )}
                      suppressHydrationWarning
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="mt-4 rounded-2xl border border-border/50 p-3 shadow-lg">
                      <ul className="grid w-[263px] gap-2">
                        {item.subitems.map((subitem) => (
                          <li key={subitem.label}>
                            <NavigationMenuLink
                              href={subitem.href}
                              className="hover:bg-accent/50 flex-row gap-3 rounded-xl p-3"
                            >
                              <subitem.icon className="text-foreground size-5.5" />
                              <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium tracking-normal text-foreground">
                                  {subitem.label}
                                </div>
                                <div className="text-muted-foreground text-xs leading-snug">
                                  {subitem.description}
                                </div>
                              </div>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'h-auto rounded-full bg-transparent px-0 py-0 text-base font-medium text-muted-foreground transition-colors hover:text-foreground focus:bg-transparent focus:text-foreground',
                      pathname === item.href && 'text-foreground',
                    )}
                    suppressHydrationWarning
                  >
                    {item.label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/signin"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Button
              size="sm"
              variant="default"
              className="rounded-full px-6 py-2 text-sm font-medium shadow-none"
              asChild
            >
              <Link href="/signup">Request a demo</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 lg:hidden lg:gap-4">
            <button
              className="text-muted-foreground relative flex size-8 items-center justify-center rounded-full border"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <div
                className={cn(
                  'absolute top-1/2 left-1/2 block w-4 -translate-x-1/2 -translate-y-1/2',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? 'rotate-45' : '-translate-y-1.5',
                  )}
                ></span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? 'opacity-0' : '',
                  )}
                ></span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute block h-0.25 w-full rounded-full bg-current transition duration-500 ease-in-out',
                    isMenuOpen ? '-rotate-45' : 'translate-y-1.5',
                  )}
                ></span>
              </div>
            </button>
          </div>
        </div>
        {/*  Mobile Menu Navigation */}
        <div
          className={cn(
            'bg-background/95 text-accent-foreground fixed inset-0 -z-10 flex flex-col justify-between tracking-normal backdrop-blur-md transition-all duration-500 ease-out lg:hidden',
            isBannerVisible
              ? 'pt-[calc(var(--header-height)+3rem)]'
              : 'pt-[var(--header-height)]',
            isMenuOpen
              ? 'translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-full opacity-0',
          )}
        >
          <div className="container">
            <NavigationMenu
              orientation="vertical"
              className="inline-block w-full max-w-none py-10"
            >
              <NavigationMenuList className="w-full flex-col items-start gap-0">
                {NAV_LINKS.map((item) => (
                  <NavigationMenuItem key={item.label} className="w-full py-2">
                    {item.subitems ? (
                      <Accordion type="single" collapsible className="">
                        <AccordionItem value={item.label}>
                          <AccordionTrigger className="flex w-full cursor-pointer items-center justify-between px-2 py-3 text-base font-normal hover:no-underline">
                            {item.label}
                          </AccordionTrigger>
                          <AccordionContent className="pb-0">
                            <div className="space-y-2">
                              {item.subitems.map((subitem) => (
                                <NavigationMenuLink
                                  key={subitem.label}
                                  href={subitem.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className={cn(
                                    'text-muted-foreground hover:bg-accent/50 flex flex-row gap-2 p-3 font-medium transition-colors',
                                    pathname === subitem.href &&
                                      'bg-accent font-semibold',
                                  )}
                                  suppressHydrationWarning
                                >
                                  <subitem.icon className="size-5" />
                                  <span className="">{subitem.label}</span>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <NavigationMenuLink
                        href={item.href}
                        className={cn(
                          'hover:text-foreground text-base transition-colors',
                          pathname === item.href && 'font-semibold',
                        )}
                        onClick={() => setIsMenuOpen(false)}
                        suppressHydrationWarning
                      >
                        {item.label}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex flex-col gap-4.5 border-t px-6 py-4">
            {ACTION_BUTTONS.map((button) => (
              <Button
                key={button.label}
                variant={
                  button.variant === 'ghost' ? 'outline' : button.variant
                }
                asChild
                className="h-12 flex-1 rounded-sm shadow-sm"
              >
                <Link href={button.href} onClick={() => setIsMenuOpen(false)}>
                  {button.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

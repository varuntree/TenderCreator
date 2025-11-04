import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';
interface LogoProps {
  className?: string;
  wrapperClassName?: string;
  onlyLogo?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  wrapperClassName = '',
  onlyLogo = false,
}) => {
  if (onlyLogo) {
    return (
      <Link href="/" className={cn("relative block h-16 w-72", className)}>
        <Image
          src="/images/logo.png"
          alt="TenderCreator Logo"
          fill
          priority
          className="object-contain"
        />
      </Link>
    );
  }
  return (
    <div className={cn(``, wrapperClassName)}>
      <Link href="/" className={cn(`relative block h-10 w-56`, className)}>
        <Image
          src="/images/logo.png"
          alt="TenderCreator Logo"
          fill
          priority
          className="object-contain"
        />
      </Link>
    </div>
  );
};

export default Logo;

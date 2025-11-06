import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  strokeWidth?: number
}

export function Spinner({ size = 'md', className, strokeWidth }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      strokeWidth={strokeWidth}
    />
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  spinnerClassName?: string
  strokeWidth?: number
}

export function LoadingSpinner({
  size = 'md',
  text,
  className,
  spinnerClassName,
  strokeWidth,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Spinner size={size} className={spinnerClassName} strokeWidth={strokeWidth} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

// Full-page loading overlay variant
export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <LoadingSpinner size="lg" text={text || 'Loading...'} />
      </div>
    </div>
  )
}

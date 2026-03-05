import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ variant = 'primary', className, children, ...props }: PropsWithChildren<ButtonProps>): JSX.Element {
  return (
    <button
      className={cn(
        'rounded-none border border-border-subtle px-3 py-1.5 text-xs font-medium tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover border-border-subtle',
        variant === 'secondary' && 'bg-background-surface text-text-secondary hover:text-text-primary',
        variant === 'ghost' && 'bg-transparent text-text-secondary hover:text-text-primary',
        variant === 'danger' && 'bg-transparent text-negative hover:text-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

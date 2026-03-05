import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps): JSX.Element {
  return <div className={cn('animate-pulse rounded-none bg-border-subtle', className)} />;
}

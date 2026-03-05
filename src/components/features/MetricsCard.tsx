import Skeleton from '@/components/ui/Skeleton';

interface MetricsCardProps {
  label: string;
  value: string;
  loading?: boolean;
  accent?: 'default' | 'positive' | 'negative';
  className?: string;
}

export default function MetricsCard({
  label,
  value,
  loading = false,
  accent = 'default',
  className = '',
}: MetricsCardProps): JSX.Element {
  return (
    <div className={`min-h-[56px] px-3 py-2 ${className}`}>
      <p className="truncate text-xs uppercase tracking-widest text-text-secondary">{label}</p>
      <p
        className={`h-6 font-mono text-lg font-medium ${
          accent === 'positive'
            ? 'text-positive'
            : accent === 'negative'
              ? 'text-negative'
              : 'text-text-primary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

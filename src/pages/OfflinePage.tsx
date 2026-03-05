import { Link } from 'react-router-dom';

export default function OfflinePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1400px] items-center justify-center px-6">
      <section className="border border-border-subtle bg-background-surface p-6 text-center">
        <p className="text-sm font-medium text-text-primary">Offline</p>
        <p className="mt-2 text-xs uppercase tracking-widest text-text-secondary">Reconnect for live market updates</p>
        <Link to="/" className="mt-4 inline-block text-xs uppercase tracking-widest text-accent hover:text-accent-hover">
          Return to Dashboard
        </Link>
      </section>
    </main>
  );
}

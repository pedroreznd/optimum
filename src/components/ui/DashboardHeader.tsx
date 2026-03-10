import AnimatedNavLink from '@/components/ui/AnimatedNavLink';
import Logo from '@/assets/images/logo-full.png';
import { FiMenu } from 'react-icons/fi';

interface DashboardHeaderProps {
  onOpenMarkets: () => void;
  onToggleMarkets: () => void;
  onOpenWatchlist: () => void;
}

export default function DashboardHeader({
  onOpenMarkets,
  onToggleMarkets,
  onOpenWatchlist,
}: DashboardHeaderProps): JSX.Element {
  return (
    <header className="grid grid-cols-3 h-10 max-h-10 items-center border-b border-border-subtle px-3">
      <div className="flex items-center gap-2">
        <button
          className="text-text-secondary hover:text-text-primary md:hidden"
          onClick={onOpenMarkets}
          aria-label="Open markets"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <button
          className="hidden text-text-secondary hover:text-text-primary md:inline-flex lg:hidden"
          onClick={onToggleMarkets}
          aria-label="Toggle markets"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <img src={Logo} className="h-8 max-h-8 w-fit" />
      </div>

      <div className="flex items-center justify-center gap-3">
        <AnimatedNavLink to="/">Stocks</AnimatedNavLink>
        <AnimatedNavLink to="/crypto">Crypto</AnimatedNavLink>
      </div>

      <div className="flex items-center justify-end">
        <button
          className="text-text-secondary hover:text-text-primary md:hidden"
          onClick={onOpenWatchlist}
          aria-label="Open watchlist"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

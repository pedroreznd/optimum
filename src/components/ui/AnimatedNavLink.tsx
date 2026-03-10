import { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

interface AnimatedNavLinkProps {
  to: string;
  children: ReactNode;
}

function AnimatedNavLink({ to, children }: AnimatedNavLinkProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <motion.div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative overflow-hidden flex items-center justify-center transition-all duration-500 ${
            isActive
              ? 'bg-accent/20 text-text-primary'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {!isActive && (
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 z-0 bg-accent/20"
            />
          )}
          {!isActive && (
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 z-10 border border-accent/50"
            />
          )}
          {isActive && (
            <div className="pointer-events-none absolute inset-0 border border-accent/40" />
          )}

          <div className="relative z-20 flex w-full h-full items-center justify-center px-4 py-1 text-xs font-medium uppercase tracking-widest">
            {children}
          </div>
        </motion.div>
      )}
    </NavLink>
  );
}

AnimatedNavLink.displayName = 'AnimatedNavLink';

export default AnimatedNavLink;

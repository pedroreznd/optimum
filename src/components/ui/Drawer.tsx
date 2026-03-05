import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  side: 'left' | 'right';
  onClose: () => void;
  children: ReactNode;
}

export default function Drawer({ open, side, onClose, children }: DrawerProps): JSX.Element {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        aria-label="Close drawer"
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute top-0 h-full w-72 border-border-subtle bg-background-base transition-transform duration-200 ${
          side === 'left'
            ? `left-0 border-r ${open ? 'translate-x-0' : '-translate-x-full'}`
            : `right-0 border-l ${open ? 'translate-x-0' : 'translate-x-full'}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}

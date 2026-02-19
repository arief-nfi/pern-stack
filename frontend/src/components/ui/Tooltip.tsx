import React, { useEffect, useRef, ReactNode } from 'react';

interface TooltipProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // content
  anchorRef: React.RefObject<HTMLElement>;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ isOpen, onClose, children, anchorRef, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (!ref.current) return;
      if (ref.current.contains(target)) return;
      if (anchorRef.current && anchorRef.current.contains(target)) return;
      onClose();
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  // Position tooltip using viewport coordinates and render into document.body to avoid stacking context issues
  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const tooltipWidth = 260; // match w-64 ~ 256
  const style: React.CSSProperties = anchorRect
    ? ((): React.CSSProperties => {
        const left = Math.min(Math.max(8, anchorRect.left), window.innerWidth - tooltipWidth - 8);
        const top = anchorRect.bottom + 8; // fixed positioning based on viewport
        return {
          position: 'fixed',
          top,
          left,
          zIndex: 99999,
        };
      })()
    : { position: 'fixed', zIndex: 99999 };

  // Render via portal to ensure it layers above other elements
  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  if (!portalRoot) return null;

  return React.createElement(
    'div',
    { ref, style, className, role: 'dialog', 'aria-modal': 'false' },
    React.createElement(
      'div',
      { className: 'bg-slate-800 border border-slate-700 rounded-md shadow-lg p-3 w-64 text-sm text-slate-200' },
      children
    )
  );
};

export default Tooltip;

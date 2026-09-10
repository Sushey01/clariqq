import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-[var(--bg-canvas)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-sidebar)]">
          <div className="flex items-center space-x-2.5">
            {Icon && <Icon className="w-5 h-5 text-[var(--accent)]" />}
            <h2 className="font-outfit font-bold text-lg text-[var(--ink)]">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} title="Close modal">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[var(--ink-muted)]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--bg-sidebar)] flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

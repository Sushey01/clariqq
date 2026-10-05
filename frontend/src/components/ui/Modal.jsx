import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon: Icon, 
  children, 
  footer,
  maxWidth = 'max-w-lg'
}) => {
  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`w-full ${maxWidth} bg-[#212121] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#171717]">
          <div className="flex items-center space-x-2.5">
            {Icon && <Icon className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
            <h2 id="modal-title" className="font-outfit font-bold text-lg text-white">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-200">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-3 border-t border-white/10 bg-[#171717] flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

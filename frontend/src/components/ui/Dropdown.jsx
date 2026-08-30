import React, { useRef, useEffect } from 'react';

const Dropdown = ({ 
  isOpen, 
  onClose, 
  trigger, 
  children, 
  width = 'w-80', 
  align = 'left' 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {trigger}
      {isOpen && (
        <div className={`absolute ${alignmentClass} mt-2 ${width} bg-[#212121] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

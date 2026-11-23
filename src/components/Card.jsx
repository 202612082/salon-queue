import React from 'react';

export const Card = ({ children, className = '', highlight = false, ...props }) => {
  return (
    <div
      className={`bg-[#243042] border ${
        highlight ? 'border-[#D4A017] shadow-gold-sm' : 'border-gray-700/60'
      } rounded-xl p-5 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GoldBadge = ({ children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40 ${className}`}
    >
      {children}
    </span>
  );
};

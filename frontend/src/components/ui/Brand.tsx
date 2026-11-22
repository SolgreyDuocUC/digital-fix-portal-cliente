import React from "react";

export const Brand: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 cursor-pointer select-none"
      aria-label="DigitalFix, ir al inicio"
      onClick={onClick}
    >
      <img src="/digitalfix-128.png" alt="" className="w-9 h-9 object-contain" />
      <span className="flex flex-col items-start leading-tight">
        <span className="font-bold text-[17px] tracking-tight text-slate-900">
          Digital<span className="text-brand-600">Fix</span>
        </span>
        <span className="text-[11px] font-medium text-slate-500">Portal de clientes</span>
      </span>
    </button>
  );
};

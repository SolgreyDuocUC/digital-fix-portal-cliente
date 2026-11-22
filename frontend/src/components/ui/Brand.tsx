import React from "react";

export const Brand: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none group"
      aria-label="DigitalFix"
      onClick={onClick}
    >
      <img
        src="/digitalfix-128.png"
        alt="DigitalFix"
        className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
      />

      <div className="flex flex-col">
        <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
          DIGITAL<span className="text-blue-600">FIX</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
          Servicios Eléctricos PyME
        </span>
      </div>
    </div>
  );
};

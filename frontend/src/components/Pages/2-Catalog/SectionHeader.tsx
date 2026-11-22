import React from "react";

interface SectionHeaderProps {
  title: string;
  meta?: string;
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, meta, note, actionLabel, onAction }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
      {title}
      {meta && <span className="text-[13px] text-slate-500 font-normal ml-2">{meta}</span>}
    </h2>
    {note && <span className="text-xs text-slate-500">{note}</span>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-ghost min-h-[32px] px-3 text-xs">
        {actionLabel}
      </button>
    )}
  </div>
);

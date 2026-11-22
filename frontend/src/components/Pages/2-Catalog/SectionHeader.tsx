import React from "react";

interface SectionHeaderProps {
  title: string;
  meta?: string;
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  meta,
  note,
  actionLabel,
  onAction,
}) => (
  <div className="flex items-baseline justify-between gap-4 px-1">
    <h2 className="text-lg font-semibold text-slate-800">
      {title}
      {meta && <span className="text-sm text-slate-400 font-normal ml-2">{meta}</span>}
    </h2>
    {note && <span className="text-xs text-slate-500">{note}</span>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="text-sm text-blue-600 hover:text-blue-700 transition">
        {actionLabel}
      </button>
    )}
  </div>
);

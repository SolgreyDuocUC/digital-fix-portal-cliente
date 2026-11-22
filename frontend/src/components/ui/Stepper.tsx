import React from "react";
import { TrackingStep } from "../../types/order";
import { Icon } from "./Icon";

interface StepperProps {
  steps: TrackingStep[];
}

export const Stepper: React.FC<StepperProps> = ({ steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Línea conectora de fondo */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />

        {steps.map((step, idx) => {
          const isDone = step.completed;
          const isCurrent = step.current;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center relative z-10 text-center flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-300"
                }`}
              >
                {isDone ? (
                  <Icon name="check" size={18} />
                ) : isCurrent ? (
                  <Icon name="bolt" size={18} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent
                    ? "text-blue-700"
                    : isDone
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {step.timestamp && (
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {step.timestamp}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


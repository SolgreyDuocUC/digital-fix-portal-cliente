import React from "react";
import { TrackingStep } from "../../types/order";

interface StepperProps {
  steps: TrackingStep[];
}

/**
 * Avance de la orden: mismo patrón que la barra de progreso del detalle de orden en el portal de
 * empleados. Paso hecho = punto lleno; paso actual = punto con halo; pendiente = punto vacío.
 */
export const Stepper: React.FC<StepperProps> = ({ steps }) => {
  return (
    <ol className="grid w-full py-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, idx) => {
        const isDone = step.completed && !step.current;
        const isCurrent = step.current;
        const lineaActiva = idx > 0 && (step.completed || step.current);

        return (
          <li key={step.status} className="relative flex flex-col items-center text-center gap-1.5">
            {idx > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-[7px] right-1/2 w-full h-0.5 ${lineaActiva ? "bg-brand-600" : "bg-slate-200"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                isCurrent
                  ? "border-brand-600 bg-white ring-4 ring-brand-100"
                  : isDone
                  ? "border-brand-600 bg-brand-600"
                  : "border-slate-300 bg-white"
              }`}
            />
            <span
              className={`text-[11px] leading-tight ${
                isCurrent ? "font-semibold text-brand-600" : isDone ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
            {step.timestamp && <span className="text-[10px] text-slate-500">{step.timestamp}</span>}
          </li>
        );
      })}
    </ol>
  );
};

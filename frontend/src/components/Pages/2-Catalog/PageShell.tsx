import React, { ReactNode } from "react";

/** Fondo de página único (el del body); el contenido va en paneles blancos. */
export const PageShell: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen">{children}</div>
);

export const Container: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`max-w-7xl mx-auto px-4 ${className}`}>{children}</div>;

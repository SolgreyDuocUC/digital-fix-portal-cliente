import React, { ReactNode } from "react";

export const PageShell: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-sky-50/60 min-h-screen">{children}</div>
);

export const Container: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`max-w-7xl mx-auto px-4 ${className}`}>{children}</div>;

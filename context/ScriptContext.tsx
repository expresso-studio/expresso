// context/ScriptContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ScriptContextType {
  script: string;
  setScript: (text: string) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider = ({ children }: { children: ReactNode }) => {
  const [script, setScript] = useState<string>("");

  return (
    <ScriptContext.Provider value={{ script, setScript }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => {
  const context = useContext(ScriptContext);
  if (!context) {
    throw new Error("useScript must be used within a ScriptProvider");
  }
  return context;
};

import React, { createContext, useContext } from "react";
import { useGeminiLive } from "../hooks/use-gemini-live.js";

const GeminiLiveContext = createContext(null);

export function GeminiLiveProvider({ config, children }) {
  const geminiLive = useGeminiLive(config);
  return (
    <GeminiLiveContext.Provider value={geminiLive}>
      {children}
    </GeminiLiveContext.Provider>
  );
}

export function useGeminiLiveContext() {
  const context = useContext(GeminiLiveContext);
  if (!context) {
    throw new Error(
      "useGeminiLiveContext must be used within a GeminiLiveProvider"
    );
  }
  return context;
}

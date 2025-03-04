"use client";

import { useEffect, useState, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "./auth0-provider";

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Until we mount, avoid rendering client-only components.
  if (!mounted) return null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

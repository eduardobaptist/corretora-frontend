"use client";

import { ThemeProvider } from "next-themes";

// Modo claro/escuro via classe no <html>. O toggle ainda não existe na UI;
// quando for criado, basta usar `useTheme()` do next-themes.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}

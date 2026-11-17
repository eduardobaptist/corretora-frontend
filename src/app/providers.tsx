"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider } from "next-themes";

// Modo claro/escuro via classe no <html>. O toggle ainda não existe na UI;
// quando for criado, basta usar `useTheme()` do next-themes.
// Toast.Provider: região dos avisos de `toast.success(...)` (feedback das ações do admin).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <Toast.Provider placement="bottom end" />
    </ThemeProvider>
  );
}

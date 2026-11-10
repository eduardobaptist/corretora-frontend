import type { Metadata } from "next";
import { AreaShell } from "@/features/auth/components/area-shell";

export const metadata: Metadata = {
  title: { default: "Minha conta", template: "%s · Minha conta" },
  robots: { index: false, follow: false },
};

export default function ClienteLayout({ children }: LayoutProps<"/cliente">) {
  return <AreaShell area="cliente">{children}</AreaShell>;
}

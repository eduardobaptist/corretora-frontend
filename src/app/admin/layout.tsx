import type { Metadata } from "next";
import { AreaShell } from "@/features/auth/components/area-shell";

export const metadata: Metadata = {
  title: { default: "Administração", template: "%s · Administração" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AreaShell area="admin">{children}</AreaShell>;
}

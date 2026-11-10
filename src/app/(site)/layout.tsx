import { SiteHeader } from "@/components/site-header";

// Site público (vitrine, detalhe, login): com o cabeçalho do site.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}

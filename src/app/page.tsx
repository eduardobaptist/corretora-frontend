import { Suspense } from "react";
import {
  ImoveisSection,
  ImoveisSectionSkeleton,
} from "@/features/imoveis/components/imoveis-section";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Encontre o imóvel <span className="text-accent">certo</span> pra você
        </h1>
        <p className="text-muted">Casas, apartamentos e terrenos para comprar ou alugar.</p>
      </header>

      <Suspense fallback={<ImoveisSectionSkeleton />}>
        <ImoveisSection />
      </Suspense>
    </main>
  );
}

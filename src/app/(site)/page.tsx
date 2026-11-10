import { VitrinePagina } from "@/features/imoveis/components/paginas";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="container-site flex flex-1 flex-col gap-6 py-6 sm:gap-8 sm:py-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Encontre o imóvel <span className="text-accent">certo</span> pra você
        </h1>
        <p className="text-muted">Casas, apartamentos e terrenos para comprar ou alugar.</p>
      </header>

      {/* A casca acima é estática; a vitrine (searchParams + API) entra por streaming */}
      <VitrinePagina searchParams={searchParams} base="/" />
    </main>
  );
}

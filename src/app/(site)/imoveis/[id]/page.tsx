import { ImovelPagina, metadataDoImovel } from "@/features/imoveis/components/paginas";

export function generateMetadata({ params }: PageProps<"/imoveis/[id]">) {
  return metadataDoImovel(params);
}

export default function ImovelPage({ params }: PageProps<"/imoveis/[id]">) {
  return (
    <main className="container-site flex flex-1 flex-col py-6 sm:py-8">
      <ImovelPagina params={params} base="/" />
    </main>
  );
}

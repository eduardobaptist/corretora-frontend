import { ImovelPagina, metadataDoImovel } from "@/features/imoveis/components/paginas";

export function generateMetadata({ params }: PageProps<"/cliente/vitrine/[id]">) {
  return metadataDoImovel(params);
}

export default function ImovelArea({ params }: PageProps<"/cliente/vitrine/[id]">) {
  return <ImovelPagina params={params} base="/cliente/vitrine" />;
}

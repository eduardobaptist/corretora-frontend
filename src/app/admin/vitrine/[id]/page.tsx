import { ImovelPagina, metadataDoImovel } from "@/features/imoveis/components/paginas";

export function generateMetadata({ params }: PageProps<"/admin/vitrine/[id]">) {
  return metadataDoImovel(params);
}

export default function ImovelArea({ params }: PageProps<"/admin/vitrine/[id]">) {
  return <ImovelPagina params={params} base="/admin/vitrine" />;
}

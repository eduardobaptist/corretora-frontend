import { Alert } from "@heroui/react";
import { ApiError } from "@/lib/api";
import { listarImoveis } from "../api";
import type { Imovel } from "../types";
import { ImovelCardSkeleton } from "./imovel-card-skeleton";
import { ImoveisExplorer } from "./imoveis-explorer";
import { ImoveisGrid } from "./imoveis-grid";
import { ImoveisSearch } from "./imoveis-search";

// Server Component: busca na API Spring e entrega os dados ao explorer (client).
export async function ImoveisSection() {
  let imoveis: Imovel[];
  try {
    imoveis = await listarImoveis();
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Erro inesperado.";
    return (
      <div className="flex flex-col gap-8">
        <ImoveisSearch isDisabled />
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível carregar os imóveis</Alert.Title>
            <Alert.Description>{message} Tente novamente em instantes.</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  return <ImoveisExplorer imoveis={imoveis} />;
}

export function ImoveisSectionSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <ImoveisSearch isDisabled />
      <ImoveisGrid>
        {Array.from({ length: 6 }, (_, i) => (
          <ImovelCardSkeleton key={i} />
        ))}
      </ImoveisGrid>
    </div>
  );
}

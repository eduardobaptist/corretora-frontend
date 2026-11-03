"use client";

import { EmptyState } from "@heroui/react";
import { useDeferredValue, useMemo, useState } from "react";
import { Magnifier } from "@/components/icons";
import type { Imovel } from "../types";
import { filtrarImoveis } from "../utils";
import { ImovelCard } from "./imovel-card";
import { ImoveisGrid } from "./imoveis-grid";
import { ImoveisSearch } from "./imoveis-search";

export function ImoveisExplorer({ imoveis }: { imoveis: Imovel[] }) {
  const [busca, setBusca] = useState("");
  const termo = useDeferredValue(busca);
  const resultado = useMemo(() => filtrarImoveis(imoveis, termo), [imoveis, termo]);

  return (
    <div className="flex flex-col gap-8">
      <ImoveisSearch value={busca} onChange={setBusca} />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted" aria-live="polite">
          {resultado.length === 1
            ? "1 imóvel encontrado"
            : `${resultado.length} imóveis encontrados`}
        </p>

        {resultado.length > 0 ? (
          <ImoveisGrid>
            {resultado.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </ImoveisGrid>
        ) : (
          <EmptyState className="flex flex-col items-center gap-2 py-16 text-center">
            <Magnifier className="size-8 text-muted" aria-hidden />
            <p className="font-medium">Nenhum imóvel encontrado</p>
            <p className="text-sm text-muted">
              {termo ? "Tente outros termos de busca." : "Ainda não há imóveis cadastrados."}
            </p>
          </EmptyState>
        )}
      </div>
    </div>
  );
}

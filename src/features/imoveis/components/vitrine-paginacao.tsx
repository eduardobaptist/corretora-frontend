"use client";

import { Paginacao } from "@/components/paginacao";
import { useVitrine } from "./vitrine-navegacao";

interface VitrinePaginacaoProps {
  /** 1-based */
  atual: number;
  totalPaginas: number;
  totalItens: number;
  tamanho: number;
}

export function VitrinePaginacao(props: VitrinePaginacaoProps) {
  const { navegar } = useVitrine();
  return <Paginacao {...props} onIr={(pagina) => navegar({ pagina }, { scroll: true })} />;
}

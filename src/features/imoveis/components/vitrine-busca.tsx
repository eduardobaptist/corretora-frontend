"use client";

import { useEffect, useState } from "react";
import { ImoveisSearch } from "./imoveis-search";
import { useVitrine } from "./vitrine-navegacao";

const ESPERA_MS = 350;

/** Busca por texto ligada à URL (?q=), com debounce enquanto digita. */
export function VitrineBusca() {
  const { params, navegar } = useVitrine();
  const [busca, setBusca] = useState(params.q);

  // Sincroniza quando o ?q= muda por fora (ex.: "Limpar filtros", voltar no histórico).
  const [qAnterior, setQAnterior] = useState(params.q);
  if (params.q !== qAnterior) {
    setQAnterior(params.q);
    if (params.q !== busca.trim()) setBusca(params.q);
  }

  useEffect(() => {
    if (busca.trim() === params.q) return;
    const t = setTimeout(() => navegar({ q: busca.trim() }, { replace: true }), ESPERA_MS);
    return () => clearTimeout(t);
  }, [busca, params.q, navegar]);

  return <ImoveisSearch value={busca} onChange={setBusca} />;
}

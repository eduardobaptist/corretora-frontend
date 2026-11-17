"use client";

import { useCallback, useState } from "react";

/**
 * Registro alvo de um modal/diálogo. Fechar mantém o `item` (o conteúdo não some durante a
 * animação de saída); `chave` muda a cada abertura, para remontar o formulário zerado.
 * `item` null = cadastro novo.
 */
export function useAlvo<T>() {
  const [estado, setEstado] = useState<{ item: T | null; aberto: boolean; chave: number }>({
    item: null,
    aberto: false,
    chave: 0,
  });

  const abrir = useCallback(
    (item: T | null = null) => setEstado((e) => ({ item, aberto: true, chave: e.chave + 1 })),
    [],
  );
  const fechar = useCallback(() => setEstado((e) => ({ ...e, aberto: false })), []);

  return { ...estado, abrir, fechar };
}

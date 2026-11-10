"use client";

import { Button, EmptyState } from "@heroui/react";
import { Magnifier } from "@/components/icons";
import { contarFiltros } from "../vitrine-params";
import { useVitrine } from "./vitrine-navegacao";

/** Vazio com a dica certa: filtros sem resultado, página inexistente ou sem cadastro. */
export function VitrineVazia({ totalItens }: { totalItens: number }) {
  const { params, navegar } = useVitrine();
  const comFiltros = contarFiltros(params) > 0;
  const paginaForaDoAlcance = totalItens > 0;

  let titulo = "Nenhum imóvel encontrado";
  let dica = "Ainda não há imóveis cadastrados.";
  let acao: { rotulo: string; onPress: () => void } | null = null;

  if (paginaForaDoAlcance) {
    titulo = "Esta página não existe";
    dica = "A lista mudou ou o endereço está incorreto.";
    acao = { rotulo: "Ir para a primeira página", onPress: () => navegar({ pagina: 1 }) };
  } else if (comFiltros) {
    dica = "Tente outros termos ou remova alguns filtros.";
    acao = {
      rotulo: "Limpar busca e filtros",
      onPress: () =>
        navegar({
          q: "",
          negocio: null,
          tipo: null,
          cidade: null,
          bairro: null,
          dormitorios: null,
          precoMin: null,
          precoMax: null,
        }),
    };
  }

  return (
    <EmptyState className="flex flex-col items-center gap-2 py-16 text-center">
      <Magnifier className="size-8 text-muted" aria-hidden />
      <p className="font-medium">{titulo}</p>
      <p className="text-sm text-muted">{dica}</p>
      {acao && (
        <Button variant="secondary" size="sm" className="mt-2" onPress={acao.onPress}>
          {acao.rotulo}
        </Button>
      )}
    </EmptyState>
  );
}

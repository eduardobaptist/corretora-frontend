"use client";

import { Button, buttonVariants, toast, Tooltip } from "@heroui/react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Heart, HeartFill } from "@/components/icons";
import { alternarFavorito } from "../actions";

interface FavoritoBotaoProps {
  imovelId: number;
  titulo: string;
  favorito: boolean;
  /** Visitante sem login: o botão leva ao login (com `?next=`) em vez de favoritar. */
  loginHref?: string;
  /** `icone`: redondo, sobre a foto do card. `botao`: com texto, no detalhe. */
  variante?: "icone" | "botao";
}

/**
 * Coração de favorito. Muda na hora (otimista) e desfaz se a API recusar.
 * No card, fica acima do link esticado (`relative z-10`).
 */
export function FavoritoBotao({ imovelId, titulo, favorito, loginHref, variante = "icone" }: FavoritoBotaoProps) {
  const [atual, setAtual] = useOptimistic(favorito);
  const [, startTransition] = useTransition();

  const icone = atual ? (
    <HeartFill className="size-4 text-danger" aria-hidden />
  ) : (
    <Heart className="size-4" aria-hidden />
  );
  const rotulo = atual ? `Remover ${titulo} dos favoritos` : `Salvar ${titulo} nos favoritos`;

  if (loginHref) {
    const label = "Entre para salvar nos favoritos";
    return variante === "icone" ? (
      <Link
        href={loginHref}
        aria-label={label}
        title={label}
        className={`${buttonVariants({ variant: "secondary", size: "sm", isIconOnly: true })} relative z-10 rounded-full`}
      >
        <Heart className="size-4" aria-hidden />
      </Link>
    ) : (
      <Link href={loginHref} className={buttonVariants({ variant: "secondary" })}>
        <Heart className="size-4" aria-hidden />
        Favoritar
      </Link>
    );
  }

  const alternar = () =>
    startTransition(async () => {
      const novo = !atual;
      setAtual(novo);
      const resultado = await alternarFavorito(imovelId, novo);
      if (resultado.ok) toast.success(resultado.mensagem);
      else toast.danger(resultado.mensagem);
    });

  if (variante === "botao") {
    return (
      <Button variant="secondary" aria-pressed={atual} onPress={alternar}>
        {icone}
        {atual ? "Favoritado" : "Favoritar"}
      </Button>
    );
  }

  return (
    <Tooltip delay={300}>
      <Button
        isIconOnly
        size="sm"
        variant="secondary"
        aria-label={rotulo}
        aria-pressed={atual}
        className="relative z-10 rounded-full"
        onPress={alternar}
      >
        {icone}
      </Button>
      <Tooltip.Content>{atual ? "Remover dos favoritos" : "Salvar nos favoritos"}</Tooltip.Content>
    </Tooltip>
  );
}

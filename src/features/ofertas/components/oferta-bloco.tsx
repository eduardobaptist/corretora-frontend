import { buttonVariants, Separator } from "@heroui/react";
import Link from "next/link";
import { CircleDollar } from "@/components/icons";
import { visitanteAtual } from "@/features/auth/api";
import { comNext } from "@/features/auth/utils";
import { ROTULO_STATUS_IMOVEL, type Imovel } from "@/features/imoveis/types";
import { ApiError } from "@/lib/api";
import { formatData } from "@/lib/format";
import { ofertaEmAbertoDoImovel } from "../api";
import { ROTULO_TIPO_OFERTA, type Oferta } from "../types";
import { OfertaBotao } from "./oferta-botao";
import { OfertaStatusChip, ValorOferta } from "./oferta-chips";

/**
 * Bloco "fazer oferta" do card lateral do detalhe. Só imóvel `DISPONIVEL` recebe oferta.
 * Cliente: botão, ou a oferta em aberto que ele já tem (que continua visível mesmo com o imóvel
 * reservado: ela fica em espera). Visitante: leva ao login e volta para o imóvel. Admin: nada.
 */
export async function OfertaBloco({ imovel, href }: { imovel: Imovel; href: string }) {
  const visitante = await visitanteAtual();
  if (visitante.tipo === "admin") return null;
  const disponivel = imovel.status === "DISPONIVEL";

  let conteudo: React.ReactNode;
  if (visitante.tipo === "anonimo") {
    if (!disponivel) return null;
    conteudo = (
      <Link href={comNext("/login", href)} className={buttonVariants({ variant: "primary", fullWidth: true })}>
        <CircleDollar className="size-4" aria-hidden />
        Entrar para fazer uma oferta
      </Link>
    );
  } else {
    let aberta: Oferta | null;
    try {
      aberta = await ofertaEmAbertoDoImovel(visitante.auth, imovel.id);
    } catch (error) {
      // Falha ao consultar (API fora, sessão vencida) não derruba o detalhe: some o bloco.
      if (error instanceof ApiError) return null;
      throw error;
    }
    if (!aberta && !disponivel) {
      return (
        <div className="flex flex-col gap-5">
          <p className="rounded-xl bg-surface-secondary p-3 text-sm text-muted">
            Este imóvel está {ROTULO_STATUS_IMOVEL[imovel.status].toLowerCase()} e não recebe ofertas no momento.
          </p>
          <Separator />
        </div>
      );
    }
    conteudo = aberta ? (
      <div className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted">
            Sua oferta de {ROTULO_TIPO_OFERTA[aberta.tipo].toLowerCase()} · {formatData(aberta.createdAt)}
          </span>
          <OfertaStatusChip status={aberta.status} />
        </div>
        <ValorOferta valor={aberta.valorProposto} tipo={aberta.tipo} />
        <Link href="/cliente/ofertas" className="w-fit text-accent hover:underline">
          Acompanhar em Minhas ofertas
        </Link>
      </div>
    ) : (
      <OfertaBotao
        imovel={{
          id: imovel.id,
          titulo: imovel.titulo,
          precoVenda: imovel.precoVenda,
          precoAluguel: imovel.precoAluguel,
          status: imovel.status,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">Quer negociar?</h2>
          <p className="text-sm text-muted">Proponha um valor de compra ou aluguel.</p>
        </div>
        {conteudo}
      </div>
      <Separator />
    </div>
  );
}

import { Chip } from "@heroui/react";
import type { ComponentProps } from "react";
import { formatCurrency } from "@/lib/format";
import { ROTULO_STATUS_OFERTA, type StatusOferta, type TipoOferta } from "../types";

type ChipColor = ComponentProps<typeof Chip>["color"];

// Pendente pede ação do admin (accent); em espera, atenção; finais em verde/vermelho/neutro.
const COR_STATUS: Record<StatusOferta, ChipColor> = {
  PENDENTE: "accent",
  EM_ESPERA: "warning",
  ACEITA: "success",
  RECUSADA: "danger",
  CANCELADA: "default",
};

export function OfertaStatusChip({ status }: { status: StatusOferta }) {
  return (
    <Chip size="sm" variant="soft" color={COR_STATUS[status]} className="shrink-0">
      {ROTULO_STATUS_OFERTA[status]}
    </Chip>
  );
}

/** "R$ 350.000" ou "R$ 2.200/mês" (aluguel). */
export function ValorOferta({ valor, tipo }: { valor: number; tipo: TipoOferta }) {
  return (
    <span className="whitespace-nowrap font-medium">
      {formatCurrency(valor)}
      {tipo === "ALUGUEL" && <span className="text-sm font-normal text-muted">/mês</span>}
    </span>
  );
}

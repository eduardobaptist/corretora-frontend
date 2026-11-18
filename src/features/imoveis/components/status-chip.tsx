import { Chip } from "@heroui/react";
import type { ComponentProps } from "react";
import { ROTULO_STATUS_IMOVEL, type StatusImovel } from "../types";

type ChipColor = ComponentProps<typeof Chip>["color"];

const STATUS_COLOR: Record<StatusImovel, ChipColor> = {
  DISPONIVEL: "success",
  RESERVADO: "warning",
  VENDIDO: "danger",
  ALUGADO: "danger",
};

export function StatusChip({ status, className }: { status: StatusImovel; className?: string }) {
  return (
    <Chip size="sm" variant="soft" color={STATUS_COLOR[status] ?? "default"} className={className}>
      {ROTULO_STATUS_IMOVEL[status] ?? status}
    </Chip>
  );
}

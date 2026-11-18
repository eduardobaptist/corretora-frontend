import { Chip } from "@heroui/react";
import type { ComponentProps } from "react";
import { ROTULO_STATUS_CONTRATO, type StatusContrato } from "../types";

type ChipColor = ComponentProps<typeof Chip>["color"];

const COR_STATUS: Record<StatusContrato, ChipColor> = {
  AGUARDANDO_ASSINATURA: "warning",
  ASSINADO: "success",
  CANCELADO: "default",
};

export function ContratoStatusChip({ status }: { status: StatusContrato }) {
  return (
    <Chip size="sm" variant="soft" color={COR_STATUS[status]} className="shrink-0">
      {ROTULO_STATUS_CONTRATO[status]}
    </Chip>
  );
}

import { Chip } from "@heroui/react";
import type { ComponentProps } from "react";
import { normalize } from "@/lib/format";

type ChipColor = ComponentProps<typeof Chip>["color"];

// `status` é texto livre na API: compara sem acento e sem maiúsculas.
const STATUS_COLOR: Record<string, ChipColor> = {
  disponivel: "success",
  reservado: "warning",
  vendido: "danger",
  alugado: "danger",
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={STATUS_COLOR[normalize(status)] ?? "default"}
      className={className}
    >
      {status}
    </Chip>
  );
}

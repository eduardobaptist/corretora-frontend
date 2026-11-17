"use client";

import { Button, Tooltip } from "@heroui/react";
import type { ComponentProps } from "react";

type Variante = ComponentProps<typeof Button>["variant"];

/** Botão só com ícone para ações de linha de tabela: `aria-label` + tooltip com o mesmo texto. */
export function AcaoIcone({
  label,
  children,
  onPress,
  variant = "ghost",
  isDisabled,
}: {
  label: string;
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variante;
  isDisabled?: boolean;
}) {
  return (
    <Tooltip delay={300}>
      <Button isIconOnly size="sm" variant={variant} aria-label={label} onPress={onPress} isDisabled={isDisabled}>
        {children}
      </Button>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}

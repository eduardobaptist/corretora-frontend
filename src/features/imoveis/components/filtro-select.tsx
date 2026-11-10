"use client";

import { Label, ListBox, Select } from "@heroui/react";
import type { Key } from "react";
import type { Opcao } from "../utils";

const TODOS = "__todos";

interface FiltroSelectProps {
  label: string;
  value: string | null;
  opcoes: readonly Opcao[];
  onChange: (value: string | null) => void;
  /** Rótulo da opção "sem filtro". `null` = não oferece essa opção. */
  rotuloTodos?: string | null;
  isDisabled?: boolean;
  className?: string;
}

/** Select de filtro: valor `null` = sem filtro (opção "Todos"). */
export function FiltroSelect({
  label,
  value,
  opcoes,
  onChange,
  rotuloTodos = "Todos",
  isDisabled,
  className,
}: FiltroSelectProps) {
  const itens = rotuloTodos ? [{ id: TODOS, nome: rotuloTodos }, ...opcoes] : opcoes;

  return (
    <Select
      fullWidth
      className={className}
      isDisabled={isDisabled}
      value={value ?? (rotuloTodos ? TODOS : null)}
      onChange={(key: Key | null) =>
        onChange(key == null || key === TODOS ? null : String(key))
      }
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {itens.map((opcao) => (
            <ListBox.Item key={opcao.id} id={opcao.id} textValue={opcao.nome}>
              {opcao.nome}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

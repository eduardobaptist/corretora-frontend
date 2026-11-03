"use client";

import { SearchField } from "@heroui/react";

interface ImoveisSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
}

export function ImoveisSearch({ value, onChange, isDisabled }: ImoveisSearchProps) {
  return (
    <SearchField
      aria-label="Buscar imóveis"
      fullWidth
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
    >
      <SearchField.Group className="h-14 rounded-full px-2 text-base shadow-sm">
        <SearchField.SearchIcon className="ml-3 size-5" />
        <SearchField.Input
          className="text-base"
          placeholder="Busque por bairro, cidade, tipo, característica…"
        />
        <SearchField.ClearButton className="mr-2" />
      </SearchField.Group>
    </SearchField>
  );
}

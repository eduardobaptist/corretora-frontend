"use client";

import { Button, Description, FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { Eye, EyeSlash, Lock } from "@/components/icons";

interface CampoSenhaProps {
  label?: string;
  placeholder?: string;
  descricao?: string;
  autoComplete: "current-password" | "new-password";
  maxLength?: number;
}

/** Senha com cadeado no prefixo e botão de mostrar/ocultar (login e cadastro). */
export function CampoSenha({
  label = "Senha",
  placeholder = "Sua senha",
  descricao,
  autoComplete,
  maxLength,
}: CampoSenhaProps) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <TextField
      name="senha"
      type={mostrar ? "text" : "password"}
      isRequired
      autoComplete={autoComplete}
      maxLength={maxLength}
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Lock className="size-4 text-muted" aria-hidden />
        </InputGroup.Prefix>
        <InputGroup.Input placeholder={placeholder} />
        <InputGroup.Suffix>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
            onPress={() => setMostrar((v) => !v)}
          >
            {mostrar ? <EyeSlash className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      {descricao && <Description>{descricao}</Description>}
      <FieldError />
    </TextField>
  );
}

"use client";

import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";
import { useActionState } from "react";
import { FormularioModal } from "@/components/admin/formulario-modal";
import { useFormSucesso } from "@/components/admin/use-form-sucesso";
import { FORM_INICIAL, MAX_TEXTO, type FormState } from "@/lib/acoes";
import { salvarTipoImovel, type TipoImovelCampo } from "../actions";
import type { TipoImovel } from "../types";

interface TipoImovelFormProps {
  /** `null` = novo tipo */
  tipo: TipoImovel | null;
  aberto: boolean;
  onFechar: () => void;
}

/** Cadastro/edição de tipo de imóvel em modal (POST/PUT /tipos-imoveis). */
export function TipoImovelForm({ tipo, aberto, onFechar }: TipoImovelFormProps) {
  const [state, formAction, pending] = useActionState(
    salvarTipoImovel.bind(null, tipo?.id ?? null),
    FORM_INICIAL as FormState<TipoImovelCampo>,
  );
  useFormSucesso(state, onFechar);

  return (
    <FormularioModal
      aberto={aberto}
      onFechar={onFechar}
      titulo={tipo ? "Editar tipo de imóvel" : "Novo tipo de imóvel"}
      state={state}
      pending={pending}
      formAction={formAction}
      rotuloSalvar={tipo ? "Salvar alterações" : "Cadastrar tipo"}
    >
      <TextField name="nome" isRequired autoFocus maxLength={MAX_TEXTO} defaultValue={tipo?.nome}>
        <Label>Nome</Label>
        <Input placeholder="Ex.: Apartamento" />
        <FieldError />
      </TextField>

      <TextField name="descricao" maxLength={MAX_TEXTO} defaultValue={tipo?.descricao ?? ""}>
        <Label>Descrição (opcional)</Label>
        <TextArea rows={3} placeholder="Para que serve esta categoria" />
        <FieldError />
      </TextField>
    </FormularioModal>
  );
}

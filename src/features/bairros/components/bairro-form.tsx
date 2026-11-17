"use client";

import { FieldError, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import { useActionState } from "react";
import { FormularioModal } from "@/components/admin/formulario-modal";
import { useFormSucesso } from "@/components/admin/use-form-sucesso";
import { FORM_INICIAL, MAX_TEXTO, type FormState } from "@/lib/acoes";
import { salvarBairro, type BairroCampo } from "../actions";
import { UFS, type Bairro } from "../types";

interface BairroFormProps {
  /** `null` = novo bairro */
  bairro: Bairro | null;
  aberto: boolean;
  onFechar: () => void;
}

/** Cadastro/edição de bairro em modal (POST/PUT /bairros). */
export function BairroForm({ bairro, aberto, onFechar }: BairroFormProps) {
  const [state, formAction, pending] = useActionState(
    salvarBairro.bind(null, bairro?.id ?? null),
    FORM_INICIAL as FormState<BairroCampo>,
  );
  useFormSucesso(state, onFechar);

  return (
    <FormularioModal
      aberto={aberto}
      onFechar={onFechar}
      titulo={bairro ? "Editar bairro" : "Novo bairro"}
      descricao="A faixa de CEP é opcional."
      state={state}
      pending={pending}
      formAction={formAction}
      rotuloSalvar={bairro ? "Salvar alterações" : "Cadastrar bairro"}
    >
      <TextField name="nome" isRequired autoFocus maxLength={MAX_TEXTO} defaultValue={bairro?.nome}>
        <Label>Nome</Label>
        <Input placeholder="Ex.: Centro" />
        <FieldError />
      </TextField>

      <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
        <TextField name="cidade" isRequired maxLength={MAX_TEXTO} defaultValue={bairro?.cidade}>
          <Label>Cidade</Label>
          <Input placeholder="Ex.: Panambi" />
          <FieldError />
        </TextField>

        <Select name="estado" isRequired defaultValue={bairro?.estado?.toUpperCase()} placeholder="UF">
          <Label>Estado</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {UFS.map((uf) => (
                <ListBox.Item key={uf} id={uf} textValue={uf}>
                  {uf}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <FieldError />
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField name="cepInicial" defaultValue={bairro?.cepInicial ?? ""} inputMode="numeric" maxLength={9}>
          <Label>CEP inicial</Label>
          <Input placeholder="00000-000" />
          <FieldError />
        </TextField>
        <TextField name="cepFinal" defaultValue={bairro?.cepFinal ?? ""} inputMode="numeric" maxLength={9}>
          <Label>CEP final</Label>
          <Input placeholder="00000-000" />
          <FieldError />
        </TextField>
      </div>
    </FormularioModal>
  );
}

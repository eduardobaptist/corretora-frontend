"use client";

import {
  Button,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { useActionState, useState } from "react";
import { FormularioModal } from "@/components/admin/formulario-modal";
import { useFormSucesso } from "@/components/admin/use-form-sucesso";
import { Eye, EyeSlash } from "@/components/icons";
import { FORM_INICIAL, MAX_TEXTO, SENHA_MAX, SENHA_MIN, type FormState } from "@/lib/acoes";
import { salvarUsuario, type UsuarioCampo } from "../actions";
import { ROTULO_PERFIL, type Role, type Usuario } from "../types";

interface UsuarioFormProps {
  /** `null` = novo usuário */
  usuario: Usuario | null;
  /** O admin logado: no próprio cadastro o perfil fica travado. */
  meuId: number;
  aberto: boolean;
  onFechar: () => void;
}

const PERFIS: Role[] = ["BASIC", "ADMIN"];

/** Cadastro/edição de usuário em modal (POST /user, PUT /user/{id}). */
export function UsuarioForm({ usuario, meuId, aberto, onFechar }: UsuarioFormProps) {
  const [state, formAction, pending] = useActionState(
    salvarUsuario.bind(null, usuario?.id ?? null),
    FORM_INICIAL as FormState<UsuarioCampo>,
  );
  const [mostrarSenha, setMostrarSenha] = useState(false);
  useFormSucesso(state, onFechar);

  const proprio = usuario?.id === meuId;

  return (
    <FormularioModal
      aberto={aberto}
      onFechar={onFechar}
      titulo={usuario ? "Editar usuário" : "Novo usuário"}
      state={state}
      pending={pending}
      formAction={formAction}
      rotuloSalvar={usuario ? "Salvar alterações" : "Cadastrar usuário"}
    >
      <TextField name="nome" isRequired autoFocus autoComplete="off" maxLength={MAX_TEXTO} defaultValue={usuario?.nome}>
        <Label>Nome</Label>
        <Input placeholder="Nome completo" />
        <FieldError />
      </TextField>

      <TextField name="email" type="email" isRequired autoComplete="off" maxLength={MAX_TEXTO} defaultValue={usuario?.email}>
        <Label>E-mail</Label>
        <Input placeholder="pessoa@email.com" />
        <FieldError />
      </TextField>

      <TextField
        name="senha"
        type={mostrarSenha ? "text" : "password"}
        isRequired={!usuario}
        autoComplete="new-password"
        maxLength={SENHA_MAX}
      >
        <Label>{usuario ? "Nova senha" : "Senha"}</Label>
        <InputGroup>
          <InputGroup.Input placeholder={usuario ? "Deixe em branco para manter" : "Senha de acesso"} />
          <InputGroup.Suffix>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onPress={() => setMostrarSenha((v) => !v)}
            >
              {mostrarSenha ? <EyeSlash className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
        <Description>
          {usuario
            ? `Só preencha para trocar a senha (de ${SENHA_MIN} a ${SENHA_MAX} caracteres).`
            : `De ${SENHA_MIN} a ${SENHA_MAX} caracteres.`}
        </Description>
        <FieldError />
      </TextField>

      <Select
        name="role"
        isRequired
        isDisabled={proprio}
        defaultValue={usuario?.role ?? "BASIC"}
      >
        <Label>Perfil</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {PERFIS.map((perfil) => (
              <ListBox.Item key={perfil} id={perfil} textValue={ROTULO_PERFIL[perfil]}>
                {ROTULO_PERFIL[perfil]}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
        <Description>
          {proprio
            ? "Você não pode mudar o próprio perfil."
            : "Administradores acessam esta área; clientes, a área do cliente."}
        </Description>
        <FieldError />
      </Select>
    </FormularioModal>
  );
}

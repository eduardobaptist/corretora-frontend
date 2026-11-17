"use client";

import { Alert, Button, FieldError, Form, InputGroup, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import { Envelope, Person, PersonPlus } from "@/components/icons";
import { MAX_TEXTO, SENHA_MAX, SENHA_MIN } from "@/lib/acoes";
import { cadastrar, type CadastroState } from "../actions";
import { comNext } from "../utils";
import { CampoSenha } from "./campo-senha";

const INICIAL: CadastroState = {};

/** Autocadastro de cliente (POST /auth/cadastro): cria a conta e já entra na área do cliente. */
export function CadastroForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(cadastrar, INICIAL);

  return (
    <Form
      className="flex flex-col gap-4"
      validationErrors={state.erros}
      // onSubmit + startTransition (em vez de `action`): o React não limpa os campos no erro.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {state.mensagem && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível criar sua conta</Alert.Title>
            <Alert.Description>{state.mensagem}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {next && <input type="hidden" name="next" value={next} />}

      <TextField
        name="nome"
        isRequired
        autoComplete="name"
        autoFocus
        maxLength={MAX_TEXTO}
        defaultValue={state.valores?.nome}
      >
        <Label>Nome</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Person className="size-4 text-muted" aria-hidden />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Seu nome completo" />
        </InputGroup>
        <FieldError />
      </TextField>

      <TextField
        name="email"
        type="email"
        isRequired
        autoComplete="email"
        maxLength={MAX_TEXTO}
        defaultValue={state.valores?.email}
      >
        <Label>E-mail</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" aria-hidden />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="voce@email.com" />
        </InputGroup>
        <FieldError />
      </TextField>

      <CampoSenha
        autoComplete="new-password"
        placeholder="Crie uma senha"
        descricao={`De ${SENHA_MIN} a ${SENHA_MAX} caracteres.`}
        maxLength={SENHA_MAX}
      />

      <Button type="submit" variant="primary" fullWidth isPending={pending} className="mt-2">
        {!pending && <PersonPlus className="size-4" aria-hidden />}
        {pending ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href={comNext("/login", next)} className="font-medium text-accent hover:underline">
          Entrar
        </Link>
      </p>
    </Form>
  );
}

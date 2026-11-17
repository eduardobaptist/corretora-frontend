"use client";

import { Alert, Button, FieldError, Form, InputGroup, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { startTransition, useActionState } from "react";
import { ArrowRightToSquare, Envelope } from "@/components/icons";
import { entrar, type LoginState } from "../actions";
import { comNext } from "../utils";
import { CampoSenha } from "./campo-senha";

const INICIAL: LoginState = {};

const AVISOS = {
  expirado: { titulo: "Sua sessão expirou", texto: "Entre novamente para continuar." },
  perfil: { titulo: "Seu perfil de acesso mudou", texto: "Entre novamente para acessar a área certa." },
};

export function LoginForm({ next, motivo }: { next?: string; motivo?: keyof typeof AVISOS }) {
  const [state, formAction, pending] = useActionState(entrar, INICIAL);

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
      {motivo && !state.mensagem && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{AVISOS[motivo].titulo}</Alert.Title>
            <Alert.Description>{AVISOS[motivo].texto}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {state.mensagem && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível entrar</Alert.Title>
            <Alert.Description>{state.mensagem}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {next && <input type="hidden" name="next" value={next} />}

      <TextField
        name="email"
        type="email"
        isRequired
        autoComplete="email"
        autoFocus
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

      <CampoSenha autoComplete="current-password" />

      <Button type="submit" variant="primary" fullWidth isPending={pending} className="mt-2">
        {!pending && <ArrowRightToSquare className="size-4" aria-hidden />}
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href={comNext("/cadastro", next)} className="font-medium text-accent hover:underline">
          Criar conta
        </Link>
      </p>
    </Form>
  );
}


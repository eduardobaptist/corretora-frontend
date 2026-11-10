"use client";

import {
  Alert,
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { startTransition, useActionState, useState } from "react";
import { ArrowRightToSquare, Envelope, Eye, EyeSlash, Lock } from "@/components/icons";
import { entrar, type LoginState } from "../actions";

const INICIAL: LoginState = {};

export function LoginForm({ next, expirado }: { next?: string; expirado?: boolean }) {
  const [state, formAction, pending] = useActionState(entrar, INICIAL);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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
      {expirado && !state.mensagem && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Sua sessão expirou</Alert.Title>
            <Alert.Description>Entre novamente para continuar.</Alert.Description>
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
        defaultValue={state.email}
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

      <TextField
        name="senha"
        type={mostrarSenha ? "text" : "password"}
        isRequired
        autoComplete="current-password"
      >
        <Label>Senha</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Lock className="size-4 text-muted" aria-hidden />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Sua senha" />
          <InputGroup.Suffix>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onPress={() => setMostrarSenha((v) => !v)}
            >
              {mostrarSenha ? (
                <EyeSlash className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
        <FieldError />
      </TextField>

      <Button type="submit" variant="primary" fullWidth isPending={pending} className="mt-2">
        {!pending && <ArrowRightToSquare className="size-4" aria-hidden />}
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </Form>
  );
}

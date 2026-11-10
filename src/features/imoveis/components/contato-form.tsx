"use client";

import {
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { startTransition, useActionState, useState } from "react";
import { CircleCheck, Envelope } from "@/components/icons";
import { enviarContato, type ContatoState } from "../actions";

interface ContatoProps {
  imovelId: number;
  titulo: string;
}

/** "Saber mais": envia o interesse para a corretora (POST /imoveis/sabermais/{id}, público). */
export function ContatoImovel(props: ContatoProps) {
  // Trocar a key remonta o form: é o "enviar outra mensagem".
  const [envio, setEnvio] = useState(0);
  return <ContatoForm key={envio} {...props} onNovaMensagem={() => setEnvio((n) => n + 1)} />;
}

const INICIAL: ContatoState = { status: "idle" };

function ContatoForm({
  imovelId,
  titulo,
  onNovaMensagem,
}: ContatoProps & { onNovaMensagem: () => void }) {
  const [state, formAction, pending] = useActionState(
    enviarContato.bind(null, imovelId),
    INICIAL,
  );

  if (state.status === "sucesso") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CircleCheck className="size-10 text-success" aria-hidden />
        <div role="status" className="flex flex-col gap-1">
          <p className="font-semibold">Mensagem enviada!</p>
          <p className="text-sm text-muted">Um corretor vai entrar em contato em breve.</p>
        </div>
        <Button variant="ghost" size="sm" onPress={onNovaMensagem}>
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  const valores = state.valores ?? {};

  return (
    <Form
      className="flex flex-col gap-4"
      validationErrors={state.erros}
      // onSubmit + startTransition (em vez de `action`) para o React não limpar os campos
      // quando o servidor devolve erro.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <TextField name="nome" isRequired autoComplete="name" defaultValue={valores.nome}>
        <Label>Nome</Label>
        <Input placeholder="Seu nome" />
        <FieldError />
      </TextField>

      <TextField
        name="email"
        type="email"
        isRequired
        autoComplete="email"
        defaultValue={valores.email}
      >
        <Label>E-mail</Label>
        <Input placeholder="voce@email.com" />
        <FieldError />
      </TextField>

      <TextField name="telefone" type="tel" isRequired autoComplete="tel" defaultValue={valores.telefone}>
        <Label>Telefone</Label>
        <Input placeholder="(00) 00000-0000" />
        <FieldError />
      </TextField>

      <TextField
        name="mensagem"
        isRequired
        defaultValue={
          valores.mensagem ??
          `Olá! Tenho interesse no imóvel "${titulo}" (cód. ${imovelId}) e gostaria de mais informações.`
        }
      >
        <Label>Mensagem</Label>
        <TextArea rows={4} />
        <FieldError />
      </TextField>

      {state.status === "erro" && state.mensagem && !state.erros && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível enviar</Alert.Title>
            <Alert.Description>{state.mensagem}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Button type="submit" variant="primary" fullWidth isPending={pending}>
        {!pending && <Envelope className="size-4" aria-hidden />}
        {pending ? "Enviando…" : "Quero saber mais"}
      </Button>
    </Form>
  );
}

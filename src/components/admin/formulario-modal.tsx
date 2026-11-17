"use client";

import { Alert, Button, Form, Modal } from "@heroui/react";
import { startTransition, useId } from "react";
import { FloppyDisk } from "@/components/icons";
import type { FormState } from "@/lib/acoes";

interface FormularioModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  state: FormState;
  pending: boolean;
  formAction: (data: FormData) => void;
  rotuloSalvar?: string;
  children: React.ReactNode;
}

/**
 * Modal de cadastro/edição: campos HeroUI no corpo, Cancelar/Salvar no rodapé.
 * Mesmo padrão do formulário de contato: onSubmit + startTransition (o React não limpa os
 * campos quando o servidor devolve erro) e erros do servidor em `validationErrors`.
 */
export function FormularioModal({
  aberto,
  onFechar,
  titulo,
  descricao,
  state,
  pending,
  formAction,
  rotuloSalvar = "Salvar",
  children,
}: FormularioModalProps) {
  const formId = useId();
  const fechar = () => !pending && onFechar();

  return (
    <Modal isOpen={aberto} onOpenChange={(open) => !open && fechar()}>
      <Modal.Backdrop isDismissable={!pending}>
        <Modal.Container size="md" scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-col gap-1">
              <Modal.Heading>{titulo}</Modal.Heading>
              {descricao && <p className="text-sm text-muted">{descricao}</p>}
            </Modal.Header>
            <Modal.Body>
              <Form
                id={formId}
                className="flex flex-col gap-4"
                validationErrors={state.erros as Record<string, string> | undefined}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  startTransition(() => formAction(data));
                }}
              >
                {children}
                {state.status === "erro" && state.mensagem && (
                  <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Não foi possível salvar</Alert.Title>
                      <Alert.Description>{state.mensagem}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={fechar} isDisabled={pending}>
                Cancelar
              </Button>
              <Button type="submit" form={formId} variant="primary" isPending={pending}>
                {!pending && <FloppyDisk className="size-4" aria-hidden />}
                {pending ? "Salvando…" : rotuloSalvar}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

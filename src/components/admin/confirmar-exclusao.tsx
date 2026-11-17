"use client";

import { Alert, AlertDialog, Button, toast } from "@heroui/react";
import { useState, useTransition } from "react";
import { TrashBin } from "@/components/icons";
import type { ResultadoAcao } from "@/lib/acoes";

interface ConfirmarAcaoProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  /** O que vai acontecer, com o nome do registro. */
  children: React.ReactNode;
  onConfirmar: () => Promise<ResultadoAcao>;
  rotuloConfirmar: string;
  rotuloPendente: string;
  icone?: React.ReactNode;
  /** `danger` para o que não tem volta (excluir); `accent` para mudanças sensíveis (perfil). */
  status?: "danger" | "accent";
}

/**
 * Confirmação de ação (AlertDialog). Se a Server Action falhar, fica aberto com o erro;
 * no sucesso fecha e mostra um toast.
 */
export function ConfirmarAcao({
  aberto,
  onFechar,
  titulo,
  children,
  onConfirmar,
  rotuloConfirmar,
  rotuloPendente,
  icone,
  status = "danger",
}: ConfirmarAcaoProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fechar = () => {
    if (pending) return;
    setErro(null);
    onFechar();
  };

  const confirmar = () =>
    startTransition(async () => {
      const resultado = await onConfirmar();
      if (resultado.ok) {
        setErro(null);
        onFechar();
        toast.success(resultado.mensagem);
      } else {
        setErro(resultado.mensagem);
      }
    });

  return (
    <AlertDialog isOpen={aberto} onOpenChange={(open) => !open && fechar()}>
      <AlertDialog.Backdrop isDismissable={!pending}>
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Icon status={status} />
              <AlertDialog.Heading>{titulo}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col gap-3">
              <div className="text-sm text-muted">{children}</div>
              {erro && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Não foi possível concluir</Alert.Title>
                    <Alert.Description>{erro}</Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" onPress={fechar} isDisabled={pending}>
                Cancelar
              </Button>
              <Button variant={status === "danger" ? "danger" : "primary"} onPress={confirmar} isPending={pending}>
                {!pending && icone}
                {pending ? rotuloPendente : rotuloConfirmar}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

type ConfirmarExclusaoProps = Omit<ConfirmarAcaoProps, "rotuloConfirmar" | "rotuloPendente" | "icone" | "status">;

/** Confirmação de exclusão: diga o nome do registro e que não dá para desfazer. */
export function ConfirmarExclusao(props: ConfirmarExclusaoProps) {
  return (
    <ConfirmarAcao
      {...props}
      status="danger"
      rotuloConfirmar="Excluir"
      rotuloPendente="Excluindo…"
      icone={<TrashBin className="size-4" aria-hidden />}
    />
  );
}

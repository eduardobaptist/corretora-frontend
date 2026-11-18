"use client";

import { Button, buttonVariants, Modal } from "@heroui/react";
import { ArrowDownToLine, ArrowUpRightFromSquare } from "@/components/icons";

interface PdfVisualizadorProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  /** URL do PDF: o Route Handler (`hrefPdf`) ou um `blob:` (prévia). */
  src: string | null;
  /** Link de download (padrão: o próprio `src`, com o atributo `download`). */
  hrefDownload?: string;
  nomeArquivo?: string;
  /** Ação extra no rodapé (ex.: "Assinar contrato"). */
  acao?: React.ReactNode;
}

/**
 * PDF num modal largo (iframe). Celulares costumam não mostrar PDF em iframe: por isso o
 * "Abrir em nova aba" e o "Baixar" ficam sempre à vista.
 */
export function PdfVisualizador({
  aberto,
  onFechar,
  titulo,
  descricao,
  src,
  hrefDownload,
  nomeArquivo,
  acao,
}: PdfVisualizadorProps) {
  return (
    <Modal isOpen={aberto} onOpenChange={(open) => !open && onFechar()}>
      <Modal.Backdrop>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog className="sm:max-w-5xl">
            <Modal.CloseTrigger />
            <Modal.Header className="flex flex-col gap-1">
              <Modal.Heading>{titulo}</Modal.Heading>
              {descricao && <p className="text-sm text-muted">{descricao}</p>}
            </Modal.Header>
            <Modal.Body>
              {src && (
                <iframe
                  src={src}
                  title={titulo}
                  className="h-[70dvh] w-full rounded-lg border border-border bg-surface-secondary"
                />
              )}
            </Modal.Body>
            <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                {src && (
                  <>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener"
                      className={buttonVariants({ variant: "tertiary" })}
                    >
                      <ArrowUpRightFromSquare className="size-4" aria-hidden />
                      Abrir em nova aba
                    </a>
                    <a
                      href={hrefDownload ?? src}
                      download={hrefDownload ? undefined : (nomeArquivo ?? true)}
                      className={buttonVariants({ variant: "tertiary" })}
                    >
                      <ArrowDownToLine className="size-4" aria-hidden />
                      Baixar
                    </a>
                  </>
                )}
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="secondary" onPress={onFechar}>
                  Fechar
                </Button>
                {acao}
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

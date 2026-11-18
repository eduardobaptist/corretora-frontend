"use client";

import {
  Alert,
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  NumberField,
  Tabs,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpFromLine, Eye, FilePlus, FileText } from "@/components/icons";
import { FORM_INICIAL, type FormState } from "@/lib/acoes";
import { criarContratoEnviado, criarContratoGerado } from "../actions";
import type { ContratoGerarCampo } from "../types";
import {
  erroDoArquivo,
  FORMA_PAGAMENTO_PADRAO,
  lerContratoGerar,
  MAX_CLAUSULAS,
  MAX_FORMA_PAGAMENTO,
  PRAZO_MAX,
  PRAZO_MIN,
  PRAZO_PADRAO,
  validarContratoGerar,
  VENCIMENTO_MAX,
  VENCIMENTO_MIN,
  VENCIMENTO_PADRAO,
} from "../validacao";
import { PdfVisualizador } from "./pdf-visualizador";

const CONTRATOS = "/admin/contratos";

interface ContratoFormProps {
  ofertaId: number;
  /** Prazo e dia de vencimento só existem no contrato de aluguel. */
  aluguel: boolean;
}

/** Duas formas de criar o contrato (POST /contratos): gerar pelo modelo da API ou enviar um PDF pronto. */
export function ContratoForm({ ofertaId, aluguel }: ContratoFormProps) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header className="gap-1">
        <Card.Title className="text-base">Contrato</Card.Title>
        <Card.Description>
          Gere o PDF pelo modelo (com os dados da oferta) ou envie um contrato pronto. O cliente assina pela área dele.
        </Card.Description>
      </Card.Header>
      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Forma de criar o contrato">
            <Tabs.Tab id="gerar">
              Gerar pelo modelo
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="enviar">
              Enviar PDF pronto
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="gerar" className="pt-5">
          <GerarForm ofertaId={ofertaId} aluguel={aluguel} />
        </Tabs.Panel>
        <Tabs.Panel id="enviar" className="pt-5">
          <EnviarForm ofertaId={ofertaId} />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}

/** Toast + volta para Contratos quando a action responde sucesso. */
function useConcluir(state: FormState) {
  const router = useRouter();
  useEffect(() => {
    if (state.status !== "sucesso") return;
    toast.success(state.mensagem);
    router.push(CONTRATOS);
  }, [state, router]);
}

function ErroGeral({ state }: { state: FormState }) {
  if (state.status !== "erro" || !state.mensagem) return null;
  return (
    <Alert status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Não foi possível criar o contrato</Alert.Title>
        <Alert.Description>{state.mensagem}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

function Botoes({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{children}</div>;
}

// --- Gerar pelo modelo -------------------------------------------------------------------------

type Previa = { url: string } | null;

function GerarForm({ ofertaId, aluguel }: ContratoFormProps) {
  const [state, formAction, pending] = useActionState(
    criarContratoGerado.bind(null, ofertaId, aluguel),
    FORM_INICIAL as FormState<ContratoGerarCampo>,
  );
  useConcluir(state);
  const concluido = state.status === "sucesso";

  const formRef = useRef<HTMLFormElement>(null);
  const [previa, setPrevia] = useState<Previa>(null);
  const [previaAberta, setPreviaAberta] = useState(false);
  const [gerandoPrevia, setGerandoPrevia] = useState(false);
  const [errosPrevia, setErrosPrevia] = useState<Partial<Record<ContratoGerarCampo, string>> | null>(null);
  const [falhaPrevia, setFalhaPrevia] = useState<string | null>(null);

  // A URL do blob ocupa memória até ser revogada.
  useEffect(() => () => void (previa && URL.revokeObjectURL(previa.url)), [previa]);

  /** POST /api/contratos/previa (Route Handler com o token) → PDF em blob, sem salvar nada. */
  const gerarPrevia = async () => {
    if (!formRef.current) return;
    const input = lerContratoGerar(new FormData(formRef.current), ofertaId, aluguel);
    const v = validarContratoGerar(input);
    setFalhaPrevia(null);
    if (v.temErros) {
      setErrosPrevia(v.erros);
      return;
    }
    setErrosPrevia(null);
    setGerandoPrevia(true);
    try {
      const res = await fetch("/api/contratos/previa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        setPrevia({ url: URL.createObjectURL(await res.blob()) });
        setPreviaAberta(true);
      } else if (res.status === 400 && res.headers.get("Content-Type")?.includes("json")) {
        const erros = (await res.json()) as Record<string, string>;
        const campos = Object.fromEntries(Object.entries(erros).filter(([k]) => k !== "ofertaId" && k !== "corpo"));
        setErrosPrevia(campos);
        const gerais = Object.entries(erros).filter(([k]) => !(k in campos)).map(([, m]) => m);
        if (gerais.length > 0) setFalhaPrevia(gerais.join(" "));
      } else if (res.status === 401) {
        setFalhaPrevia("Sua sessão expirou. Entre de novo para continuar.");
      } else {
        setFalhaPrevia((await res.text()) || "A prévia falhou. Tente novamente em instantes.");
      }
    } catch {
      setFalhaPrevia("Não foi possível gerar a prévia. Confira sua conexão e tente de novo.");
    } finally {
      setGerandoPrevia(false);
    }
  };

  const erros = { ...state.erros, ...errosPrevia };

  return (
    <>
      <Form
        ref={formRef}
        className="flex flex-col gap-4"
        validationErrors={erros as Record<string, string>}
        onSubmit={(e) => {
          e.preventDefault();
          setErrosPrevia(null);
          setFalhaPrevia(null);
          const data = new FormData(e.currentTarget);
          startTransition(() => formAction(data));
        }}
      >
        {aluguel && (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              name="prazoMeses"
              minValue={PRAZO_MIN}
              maxValue={PRAZO_MAX}
              formatOptions={{ maximumFractionDigits: 0 }}
            >
              <Label>Prazo da locação (meses)</Label>
              <NumberField.Group>
                <NumberField.Input placeholder={String(PRAZO_PADRAO)} />
              </NumberField.Group>
              <Description>
                De {PRAZO_MIN} a {PRAZO_MAX}. Em branco: {PRAZO_PADRAO} meses.
              </Description>
              <FieldError />
            </NumberField>
            <NumberField
              name="diaVencimento"
              minValue={VENCIMENTO_MIN}
              maxValue={VENCIMENTO_MAX}
              formatOptions={{ maximumFractionDigits: 0 }}
            >
              <Label>Dia do vencimento</Label>
              <NumberField.Group>
                <NumberField.Input placeholder={String(VENCIMENTO_PADRAO)} />
              </NumberField.Group>
              <Description>
                De {VENCIMENTO_MIN} a {VENCIMENTO_MAX} (existe em todos os meses). Em branco: dia {VENCIMENTO_PADRAO}.
              </Description>
              <FieldError />
            </NumberField>
          </div>
        )}

        <TextField name="formaPagamento" maxLength={MAX_FORMA_PAGAMENTO}>
          <Label>Forma de pagamento (opcional)</Label>
          <Input placeholder={aluguel ? "via boleto bancário" : "à vista, na assinatura da escritura"} />
          <Description>Completa a frase “… a ser pago ___.” Em branco: “{FORMA_PAGAMENTO_PADRAO}”.</Description>
          <FieldError />
        </TextField>

        <TextField name="clausulasAdicionais" maxLength={MAX_CLAUSULAS}>
          <Label>Cláusulas adicionais (opcional)</Label>
          <TextArea rows={5} placeholder={"1. É permitido animal de estimação.\n2. …"} />
          <Description>Vira a seção “Das cláusulas adicionais”. As quebras de linha são mantidas.</Description>
          <FieldError />
        </TextField>

        {falhaPrevia && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Não foi possível gerar a prévia</Alert.Title>
              <Alert.Description>{falhaPrevia}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <ErroGeral state={state} />

        <Botoes>
          <Button variant="secondary" onPress={gerarPrevia} isPending={gerandoPrevia} isDisabled={pending || concluido}>
            {!gerandoPrevia && <Eye className="size-4" aria-hidden />}
            {gerandoPrevia ? "Gerando prévia…" : "Pré-visualizar"}
          </Button>
          <Button type="submit" variant="primary" isPending={pending || concluido} isDisabled={gerandoPrevia}>
            {!pending && <FilePlus className="size-4" aria-hidden />}
            {pending ? "Criando…" : "Criar contrato"}
          </Button>
        </Botoes>
      </Form>

      <PdfVisualizador
        aberto={previaAberta}
        onFechar={() => setPreviaAberta(false)}
        titulo="Prévia do contrato"
        descricao="Nada foi salvo ainda. Ajuste os campos e gere de novo, ou crie o contrato."
        src={previa?.url ?? null}
        nomeArquivo={`previa-contrato-oferta-${ofertaId}.pdf`}
      />
    </>
  );
}

// --- Enviar PDF pronto -------------------------------------------------------------------------

function tamanho(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function EnviarForm({ ofertaId }: { ofertaId: number }) {
  const [state, formAction, pending] = useActionState(
    criarContratoEnviado.bind(null, ofertaId),
    FORM_INICIAL as FormState<"arquivo">,
  );
  useConcluir(state);
  const concluido = state.status === "sucesso";

  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  // O erro da API vale para o arquivo enviado: some quando outro é escolhido.
  const [erroDoEnvio, setErroDoEnvio] = useState(true);
  const erro = erroLocal ?? (erroDoEnvio ? state.erros?.arquivo : undefined);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        // Confere antes de mandar 10MB pela rede.
        const problema = erroDoArquivo(arquivo);
        setErroLocal(problema);
        if (problema) return;
        setErroDoEnvio(true);
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <div className="flex flex-col gap-2">
        <span id="contrato-arquivo-rotulo" className="text-sm font-medium">
          Arquivo do contrato
        </span>
        <div
          className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed p-6 text-center ${
            erro ? "border-danger" : "border-border"
          }`}
        >
          <FileText className="size-8 text-muted" aria-hidden />
          {arquivo ? (
            <div className="flex flex-col">
              <span className="break-all font-medium">{arquivo.name}</span>
              <span className="text-sm text-muted">{tamanho(arquivo.size)}</span>
            </div>
          ) : (
            <span className="text-sm text-muted">PDF de até 10MB, com nome de até 150 caracteres.</span>
          )}
          <Button variant="secondary" size="sm" onPress={() => inputRef.current?.click()} isDisabled={pending || concluido}>
            <ArrowUpFromLine className="size-4" aria-hidden />
            {arquivo ? "Trocar arquivo" : "Escolher PDF"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            name="arquivo"
            accept="application/pdf,.pdf"
            aria-labelledby="contrato-arquivo-rotulo"
            aria-describedby={erro ? "contrato-arquivo-erro" : undefined}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const escolhido = e.currentTarget.files?.[0] ?? null;
              setArquivo(escolhido);
              setErroDoEnvio(false);
              setErroLocal(escolhido ? erroDoArquivo(escolhido) : null);
            }}
          />
        </div>
        {erro && (
          <p id="contrato-arquivo-erro" role="alert" className="text-sm text-danger">
            {erro}
          </p>
        )}
      </div>

      <ErroGeral state={state} />

      <Botoes>
        <Button type="submit" variant="primary" isPending={pending || concluido}>
          {!pending && <ArrowUpFromLine className="size-4" aria-hidden />}
          {pending ? "Enviando…" : "Enviar contrato"}
        </Button>
      </Botoes>
    </form>
  );
}

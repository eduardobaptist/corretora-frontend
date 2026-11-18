"use client";

import {
  Alert,
  Button,
  Card,
  ComboBox,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  NumberField,
  Select,
  Switch,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect } from "react";
import { FloppyDisk } from "@/components/icons";
import type { Bairro } from "@/features/bairros/types";
import type { TipoImovel } from "@/features/tipos-imoveis/types";
import { FORM_INICIAL, MAX_TEXTO, MAX_TEXTO_LONGO, type FormState } from "@/lib/acoes";
import { ROTULO_STATUS_IMOVEL, STATUS_IMOVEL, type Imovel } from "../../types";
import { salvarImovel } from "../actions";
import { ADMIN_IMOVEIS, type ImovelCampo } from "../types";

export interface ImovelFormProps {
  /** `null` = novo imóvel */
  imovel: Imovel | null;
  tipos: TipoImovel[];
  bairros: Bairro[];
  sugestoes: { finalidade: string[] };
}

const BRL = { style: "currency", currency: "BRL", maximumFractionDigits: 2 } as const;
const DECIMAL = { maximumFractionDigits: 2 } as const;
const NENHUM = "0";

/** Cadastro/edição de imóvel (POST /imoveis, PUT /imoveis/{id}). O PUT substitui tudo. */
export function ImovelForm({ imovel, tipos, bairros, sugestoes }: ImovelFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    salvarImovel.bind(null, imovel?.id ?? null),
    FORM_INICIAL as FormState<ImovelCampo>,
  );

  useEffect(() => {
    if (state.status !== "sucesso") return;
    toast.success(state.mensagem);
    router.push(ADMIN_IMOVEIS);
  }, [state, router]);

  const concluido = state.status === "sucesso";

  return (
    <Form
      className="flex max-w-4xl flex-col gap-6"
      validationErrors={state.erros as Record<string, string> | undefined}
      // onSubmit + startTransition: o React não limpa os campos quando o servidor devolve erro.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <Secao titulo="Anúncio" descricao="Como o imóvel aparece na vitrine.">
        <TextField name="titulo" isRequired maxLength={MAX_TEXTO} defaultValue={imovel?.titulo} className="sm:col-span-2">
          <Label>Título</Label>
          <Input placeholder="Ex.: Casa 3 quartos com pátio no Centro" />
          <FieldError />
        </TextField>

        <SelectId
          name="tipoImovel"
          label="Tipo de imóvel"
          valor={imovel?.tipoImovel?.id}
          opcoes={tipos.map((t) => ({ id: t.id, nome: t.nome }))}
          vazio="Sem tipo"
          aviso={tipos.length === 0 ? <>Nenhum tipo cadastrado. <Link className="underline" href="/admin/tipos-imoveis">Cadastrar tipos</Link></> : undefined}
        />

        <TextoSugerido
          name="finalidade"
          label="Finalidade"
          valor={imovel?.finalidade}
          sugestoes={sugestoes.finalidade}
          placeholder="Ex.: Residencial"
        />

        <Select name="status" isRequired defaultValue={imovel?.status ?? "DISPONIVEL"}>
          <Label>Status</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {STATUS_IMOVEL.map((s) => (
                <ListBox.Item key={s} id={s} textValue={ROTULO_STATUS_IMOVEL[s]}>
                  {ROTULO_STATUS_IMOVEL[s]}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
          <Description>Só imóveis disponíveis recebem ofertas. Ofertas e contratos também mudam o status.</Description>
          <FieldError />
        </Select>

        <div className="flex items-end pb-2">
          <Switch name="destaque" defaultSelected={imovel?.destaque ?? false}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>Destaque na vitrine</Label>
            </Switch.Content>
          </Switch>
        </div>

        <TextField name="descricao" maxLength={MAX_TEXTO_LONGO} defaultValue={imovel?.descricao ?? ""} className="sm:col-span-2">
          <Label>Descrição</Label>
          <TextArea rows={5} placeholder="Conte o que o imóvel tem de melhor" />
          <FieldError />
        </TextField>
      </Secao>

      <Secao titulo="Valores" descricao="Deixe em branco o que não se aplica.">
        <Numero name="precoVenda" label="Preço de venda" valor={imovel?.precoVenda} formato={BRL} placeholder="R$ 0,00" />
        <Numero
          name="precoAluguel"
          label="Aluguel mensal"
          valor={imovel?.precoAluguel}
          formato={BRL}
          placeholder="R$ 0,00"
        />
      </Secao>

      <Secao titulo="Características">
        <div className="grid grid-cols-3 gap-3 sm:col-span-2">
          <Numero name="dormitorios" label="Dormitórios" valor={imovel?.dormitorios} />
          <Numero name="banheiros" label="Banheiros" valor={imovel?.banheiros} />
          <Numero name="garagem" label="Vagas" valor={imovel?.garagem} />
        </div>
        <Numero name="areaConstruida" label="Área construída (m²)" valor={imovel?.areaConstruida} formato={DECIMAL} />
        <Numero name="areaTotal" label="Área total (m²)" valor={imovel?.areaTotal} formato={DECIMAL} />
        <TextField name="caracteristicas" maxLength={MAX_TEXTO_LONGO} defaultValue={imovel?.caracteristicas ?? ""} className="sm:col-span-2">
          <Label>Diferenciais</Label>
          <TextArea rows={2} placeholder="Piscina, Churrasqueira, Pátio" />
          <Description>Separe por vírgula. Cada item vira uma etiqueta no anúncio.</Description>
          <FieldError />
        </TextField>
      </Secao>

      <Secao titulo="Localização">
        <SelectId
          name="bairro"
          label="Bairro"
          valor={imovel?.bairro?.id}
          opcoes={bairros.map((b) => ({ id: b.id, nome: `${b.nome} · ${b.cidade}/${b.estado}` }))}
          vazio="Sem bairro"
          aviso={bairros.length === 0 ? <>Nenhum bairro cadastrado. <Link className="underline" href="/admin/bairros">Cadastrar bairros</Link></> : undefined}
        />
        <TextField name="cep" defaultValue={imovel?.cep ?? ""} inputMode="numeric" maxLength={9}>
          <Label>CEP</Label>
          <Input placeholder="00000-000" />
          <FieldError />
        </TextField>
        <TextField name="endereco" isRequired maxLength={MAX_TEXTO} defaultValue={imovel?.endereco} className="sm:col-span-2">
          <Label>Endereço</Label>
          <Input placeholder="Rua, avenida…" />
          <FieldError />
        </TextField>
        <TextField name="numero" maxLength={MAX_TEXTO} defaultValue={imovel?.numero ?? ""}>
          <Label>Número</Label>
          <Input placeholder="Ex.: 1000" />
          <FieldError />
        </TextField>
        <TextField name="complemento" maxLength={MAX_TEXTO} defaultValue={imovel?.complemento ?? ""}>
          <Label>Complemento</Label>
          <Input placeholder="Ex.: Apto 52" />
          <FieldError />
        </TextField>
      </Secao>

      {state.status === "erro" && state.mensagem && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Não foi possível salvar</Alert.Title>
            <Alert.Description>{state.mensagem}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="tertiary" onPress={() => router.push(ADMIN_IMOVEIS)} isDisabled={pending || concluido}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isPending={pending || concluido}>
          {!pending && <FloppyDisk className="size-4" aria-hidden />}
          {pending ? "Salvando…" : imovel ? "Salvar alterações" : "Cadastrar imóvel"}
        </Button>
      </div>
    </Form>
  );
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header className="gap-1">
        <Card.Title className="text-base">{titulo}</Card.Title>
        {descricao && <Card.Description>{descricao}</Card.Description>}
      </Card.Header>
      <Card.Content className="grid gap-4 sm:grid-cols-2">{children}</Card.Content>
    </Card>
  );
}

function Numero({
  name,
  label,
  valor,
  formato,
  placeholder,
}: {
  name: ImovelCampo;
  label: string;
  valor: number | null | undefined;
  formato?: Intl.NumberFormatOptions;
  placeholder?: string;
}) {
  return (
    <NumberField
      name={name}
      minValue={0}
      formatOptions={formato ?? { maximumFractionDigits: 0 }}
      defaultValue={valor ?? undefined}
    >
      <Label>{label}</Label>
      <NumberField.Group>
        <NumberField.Input placeholder={placeholder} />
      </NumberField.Group>
      <FieldError />
    </NumberField>
  );
}

/** Select de relação (`{ id }`). A opção "vazio" vale 0, que a action grava como `null`. */
function SelectId({
  name,
  label,
  valor,
  opcoes,
  vazio,
  aviso,
}: {
  name: ImovelCampo;
  label: string;
  valor: number | undefined;
  opcoes: { id: number; nome: string }[];
  vazio: string;
  aviso?: React.ReactNode;
}) {
  const itens = [{ id: NENHUM, nome: vazio }, ...opcoes.map((o) => ({ id: String(o.id), nome: o.nome }))];
  return (
    <Select name={name} defaultValue={valor != null ? String(valor) : NENHUM}>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {itens.map((item) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.nome}>
              {item.nome}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      {aviso && <Description>{aviso}</Description>}
      <FieldError />
    </Select>
  );
}

/** Texto livre com sugestões (ComboBox `allowsCustomValue`): a API aceita qualquer valor. */
function TextoSugerido({
  name,
  label,
  valor,
  sugestoes,
  placeholder,
}: {
  name: ImovelCampo;
  label: string;
  valor: string | undefined;
  sugestoes: string[];
  placeholder: string;
}) {
  return (
    <ComboBox
      name={name}
      isRequired
      allowsCustomValue
      menuTrigger="focus"
      defaultInputValue={valor ?? ""}
      defaultItems={sugestoes.map((s) => ({ id: s, nome: s }))}
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input placeholder={placeholder} maxLength={MAX_TEXTO} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {(item: { id: string; nome: string }) => (
            <ListBox.Item id={item.id} textValue={item.nome}>
              {item.nome}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
      <FieldError />
    </ComboBox>
  );
}

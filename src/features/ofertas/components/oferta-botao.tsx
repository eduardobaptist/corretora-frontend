"use client";

import {
  Button,
  Description,
  FieldError,
  Label,
  NumberField,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { useActionState, useState } from "react";
import { FormularioModal } from "@/components/admin/formulario-modal";
import { useAlvo } from "@/components/admin/use-alvo";
import { useFormSucesso } from "@/components/admin/use-form-sucesso";
import { CircleDollar, PaperPlane } from "@/components/icons";
import { FORM_INICIAL, type FormState } from "@/lib/acoes";
import { formatCurrency } from "@/lib/format";
import { fazerOferta } from "../actions";
import {
  MAX_MENSAGEM_OFERTA,
  precoPedido,
  ROTULO_TIPO_OFERTA,
  TIPOS_OFERTA,
  type ImovelResumo,
  type OfertaCampo,
  type TipoOferta,
} from "../types";

const BRL = { style: "currency", currency: "BRL", maximumFractionDigits: 2 } as const;

/** "Fazer uma oferta" + modal com o formulário (POST /ofertas). */
export function OfertaBotao({ imovel }: { imovel: ImovelResumo }) {
  const modal = useAlvo<null>();
  return (
    <>
      <Button variant="primary" fullWidth onPress={() => modal.abrir()}>
        <CircleDollar className="size-4" aria-hidden />
        Fazer uma oferta
      </Button>
      <OfertaForm key={modal.chave} imovel={imovel} aberto={modal.aberto} onFechar={modal.fechar} />
    </>
  );
}

function OfertaForm({ imovel, aberto, onFechar }: { imovel: ImovelResumo; aberto: boolean; onFechar: () => void }) {
  const [state, formAction, pending] = useActionState(
    fazerOferta.bind(null, imovel.id),
    FORM_INICIAL as FormState<OfertaCampo>,
  );
  useFormSucesso(state, onFechar);

  // Só os negócios que o anúncio tem preço; sem nenhum preço, os dois.
  const anunciados = TIPOS_OFERTA.filter((t) => precoPedido(imovel, t) != null);
  const tipos = anunciados.length > 0 ? anunciados : TIPOS_OFERTA;
  const [tipo, setTipo] = useState<TipoOferta>(tipos[0]);
  const [valor, setValor] = useState<number>(precoPedido(imovel, tipos[0]) ?? NaN);
  const pedido = precoPedido(imovel, tipo);

  const trocarTipo = (novo: TipoOferta) => {
    setTipo(novo);
    // Começa do preço anunciado do negócio escolhido (o cliente ajusta).
    setValor(precoPedido(imovel, novo) ?? NaN);
  };

  return (
    <FormularioModal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Fazer uma oferta"
      descricao={`${imovel.titulo} (cód. ${imovel.id}). A corretora responde pela sua área, em “Minhas ofertas”.`}
      state={state}
      pending={pending}
      formAction={formAction}
      rotuloSalvar="Enviar oferta"
      rotuloPendente="Enviando…"
      iconeSalvar={<PaperPlane className="size-4" aria-hidden />}
    >
      <input type="hidden" name="tipo" value={tipo} />
      {tipos.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label id="oferta-tipo">Negócio</Label>
          <ToggleButtonGroup
            aria-labelledby="oferta-tipo"
            selectionMode="single"
            disallowEmptySelection
            fullWidth
            selectedKeys={[tipo]}
            onSelectionChange={(keys) => {
              const [k] = [...keys];
              if (k === "VENDA" || k === "ALUGUEL") trocarTipo(k);
            }}
          >
            {tipos.map((t) => (
              <ToggleButton key={t} id={t}>
                {t === "VENDA" ? "Comprar" : "Alugar"}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {state.erros?.tipo && <p className="text-sm text-danger">{state.erros.tipo}</p>}
        </div>
      )}

      <NumberField
        name="valorProposto"
        isRequired
        minValue={0}
        formatOptions={BRL}
        value={valor}
        onChange={setValor}
      >
        <Label>{tipo === "ALUGUEL" ? "Aluguel mensal proposto" : "Valor proposto"}</Label>
        <NumberField.Group>
          <NumberField.Input placeholder="R$ 0,00" />
        </NumberField.Group>
        <Description>
          {pedido != null
            ? `${ROTULO_TIPO_OFERTA[tipo]} anunciado: ${formatCurrency(pedido)}${tipo === "ALUGUEL" ? "/mês" : ""}.`
            : "Este imóvel não tem preço anunciado para este negócio."}
        </Description>
        <FieldError />
      </NumberField>

      <TextField name="mensagem" maxLength={MAX_MENSAGEM_OFERTA}>
        <Label>Mensagem (opcional)</Label>
        <TextArea rows={3} placeholder="Ex.: pagamento à vista, mudança em março…" />
        <FieldError />
      </TextField>
    </FormularioModal>
  );
}

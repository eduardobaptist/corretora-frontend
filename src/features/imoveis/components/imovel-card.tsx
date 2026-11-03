import { Card, Chip, Separator } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";
import { Bath, Bed, Car, GeoPin, House, LayoutCellsLarge, StarFill } from "@/components/icons";
import { formatArea, formatCurrency } from "@/lib/format";
import type { Imovel } from "../types";
import { formatEndereco, parseCaracteristicas } from "../utils";

type ChipColor = ComponentProps<typeof Chip>["color"];

const STATUS_COLOR: Record<string, ChipColor> = {
  disponivel: "success",
  disponível: "success",
  reservado: "warning",
  vendido: "danger",
  alugado: "danger",
};

function statusColor(status: string): ChipColor {
  return STATUS_COLOR[status.toLowerCase()] ?? "default";
}

export function ImovelCard({ imovel }: { imovel: Imovel }) {
  const caracteristicas = parseCaracteristicas(imovel);

  return (
    <Card className="h-full overflow-hidden p-0">
      {/* Mídia: a API ainda não envia fotos; placeholder com o accent do tema */}
      <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-accent/25 via-accent/10 to-surface-secondary">
        <House className="size-12 text-accent" aria-hidden />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {imovel.tipoImovel && (
              <Chip size="sm" variant="secondary">
                {imovel.tipoImovel.nome}
              </Chip>
            )}
            <Chip size="sm" variant="secondary">
              {imovel.finalidade}
            </Chip>
          </div>
          {imovel.destaque && (
            <Chip size="sm" color="accent" variant="primary">
              <StarFill className="size-3" aria-hidden />
              <Chip.Label>Destaque</Chip.Label>
            </Chip>
          )}
        </div>
      </div>

      <Card.Header className="gap-1 px-4 pt-1">
        <div className="flex items-start justify-between gap-3">
          <Card.Title className="line-clamp-1 text-base">{imovel.titulo}</Card.Title>
          <Chip size="sm" variant="soft" color={statusColor(imovel.status)} className="shrink-0">
            {imovel.status}
          </Chip>
        </div>
        <Card.Description className="flex items-center gap-1">
          <GeoPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{formatEndereco(imovel)}</span>
        </Card.Description>
      </Card.Header>

      <Card.Content className="gap-3 px-4">
        {imovel.descricao && (
          <p className="line-clamp-2 text-sm text-muted">{imovel.descricao}</p>
        )}

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-foreground">
          {imovel.dormitorios != null && (
            <Atributo icon={<Bed />} label={`${imovel.dormitorios} dorm.`} />
          )}
          {imovel.banheiros != null && (
            <Atributo icon={<Bath />} label={`${imovel.banheiros} banh.`} />
          )}
          {imovel.garagem != null && (
            <Atributo icon={<Car />} label={`${imovel.garagem} vagas`} />
          )}
          {(imovel.areaConstruida ?? imovel.areaTotal) != null && (
            <Atributo
              icon={<LayoutCellsLarge />}
              label={formatArea((imovel.areaConstruida ?? imovel.areaTotal)!)}
            />
          )}
        </ul>

        {caracteristicas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {caracteristicas.slice(0, 4).map((c) => (
              <Chip key={c} size="sm" variant="soft">
                {c}
              </Chip>
            ))}
            {caracteristicas.length > 4 && (
              <Chip size="sm" variant="soft">
                +{caracteristicas.length - 4}
              </Chip>
            )}
          </div>
        )}
      </Card.Content>

      <Separator className="mt-auto" />

      <Card.Footer className="flex items-end justify-between gap-3 px-4 pb-4">
        <Preco rotulo="Venda" valor={imovel.precoVenda} />
        <Preco rotulo="Aluguel" valor={imovel.precoAluguel} sufixo="/mês" alinhar="end" />
      </Card.Footer>
    </Card>
  );
}

function Atributo({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-1.5 [&>svg]:size-4 [&>svg]:text-muted">
      {icon}
      <span>{label}</span>
    </li>
  );
}

function Preco({
  rotulo,
  valor,
  sufixo,
  alinhar = "start",
}: {
  rotulo: string;
  valor: number | null;
  sufixo?: string;
  alinhar?: "start" | "end";
}) {
  if (valor == null) return <span />;

  return (
    <div className={alinhar === "end" ? "text-right" : undefined}>
      <p className="text-xs text-muted">{rotulo}</p>
      <p className="text-lg font-semibold leading-tight">
        {formatCurrency(valor)}
        {sufixo && <span className="text-sm font-normal text-muted">{sufixo}</span>}
      </p>
    </div>
  );
}

import { Card, Chip, Separator } from "@heroui/react";
import Link from "next/link";
import { GeoPin, Picture, StarFill } from "@/components/icons";
import type { Imovel } from "../types";
import { formatEndereco, parseCaracteristicas } from "../utils";
import { ImovelAtributos } from "./imovel-atributos";
import { ImovelFoto, ImovelFotoPlaceholder } from "./imovel-midia";
import { Preco } from "./preco";
import { StatusChip } from "./status-chip";

interface ImovelCardProps {
  imovel: Imovel;
  /** link do detalhe (muda entre site e áreas logadas) */
  href: string;
  priority?: boolean;
}

export function ImovelCard({ imovel, href, priority }: ImovelCardProps) {
  const caracteristicas = parseCaracteristicas(imovel);
  const [capa] = imovel.fotos;

  return (
    <Card className="group relative h-full overflow-hidden p-0 transition-shadow focus-within:ring-2 focus-within:ring-focus hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-secondary">
        {capa ? (
          <ImovelFoto
            src={capa}
            alt={imovel.titulo}
            priority={priority}
            sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImovelFotoPlaceholder />
        )}

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

        {imovel.fotos.length > 1 && (
          <Chip size="sm" variant="secondary" className="absolute bottom-3 right-3">
            <Picture className="size-3" aria-hidden />
            <Chip.Label>{imovel.fotos.length} fotos</Chip.Label>
          </Chip>
        )}
      </div>

      <Card.Header className="gap-1 px-4 pt-1">
        <div className="flex items-start justify-between gap-3">
          <Card.Title className="line-clamp-1 text-base">
            {/* Link "esticado": o card inteiro é clicável, mas só o título é o link */}
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {imovel.titulo}
            </Link>
          </Card.Title>
          <StatusChip status={imovel.status} className="shrink-0" />
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

        <ImovelAtributos imovel={imovel} compacto />

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

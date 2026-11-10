import type { ReactNode } from "react";
import { Bath, Bed, Car, LayoutCellsLarge } from "@/components/icons";
import { formatArea } from "@/lib/format";
import type { Imovel } from "../types";

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

/**
 * Atributos com ícone. `compacto` (card): abreviações e área principal.
 * Completo (detalhe): por extenso, com área total e construída.
 */
export function ImovelAtributos({ imovel, compacto }: { imovel: Imovel; compacto?: boolean }) {
  const area = imovel.areaConstruida ?? imovel.areaTotal;

  const itens: { icon: ReactNode; label: string }[] = [];
  if (imovel.dormitorios != null)
    itens.push({
      icon: <Bed />,
      label: compacto
        ? `${imovel.dormitorios} dorm.`
        : plural(imovel.dormitorios, "dormitório", "dormitórios"),
    });
  if (imovel.banheiros != null)
    itens.push({
      icon: <Bath />,
      label: compacto
        ? `${imovel.banheiros} banh.`
        : plural(imovel.banheiros, "banheiro", "banheiros"),
    });
  if (imovel.garagem != null)
    itens.push({ icon: <Car />, label: plural(imovel.garagem, "vaga", "vagas") });

  if (compacto) {
    if (area != null) itens.push({ icon: <LayoutCellsLarge />, label: formatArea(area) });
  } else {
    if (imovel.areaConstruida != null)
      itens.push({
        icon: <LayoutCellsLarge />,
        label: `${formatArea(imovel.areaConstruida)} construídos`,
      });
    if (imovel.areaTotal != null)
      itens.push({ icon: <LayoutCellsLarge />, label: `${formatArea(imovel.areaTotal)} de terreno` });
  }

  if (itens.length === 0) return null;

  return (
    <ul
      className={
        compacto
          ? "flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-foreground"
          : "grid grid-cols-2 gap-3 text-sm text-foreground sm:grid-cols-3"
      }
    >
      {itens.map((item) => (
        <li
          key={item.label}
          className={
            compacto
              ? "flex items-center gap-1.5 [&>svg]:size-4 [&>svg]:text-muted"
              : "flex items-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5 [&>svg]:size-5 [&>svg]:text-accent"
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

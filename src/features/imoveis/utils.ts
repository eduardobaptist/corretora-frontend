import { normalize } from "@/lib/format";
import type { Imovel } from "./types";

export function parseCaracteristicas(imovel: Imovel) {
  return (imovel.caracteristicas ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function formatEndereco(imovel: Imovel) {
  const rua = [imovel.endereco, imovel.numero].filter(Boolean).join(", ");
  const local = imovel.bairro
    ? `${imovel.bairro.nome} · ${imovel.bairro.cidade}/${imovel.bairro.estado}`
    : null;
  return [rua, local].filter(Boolean).join(" — ");
}

// Busca local enquanto a API não oferece filtro. Quando oferecer,
// trocar por um parâmetro em GET /imoveis e remover esta função.
export function filtrarImoveis(imoveis: Imovel[], termo: string) {
  const tokens = normalize(termo).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return imoveis;

  return imoveis.filter((imovel) => {
    const haystack = normalize(
      [
        imovel.titulo,
        imovel.descricao,
        imovel.finalidade,
        imovel.status,
        imovel.endereco,
        imovel.caracteristicas,
        imovel.tipoImovel?.nome,
        imovel.bairro?.nome,
        imovel.bairro?.cidade,
        imovel.bairro?.estado,
      ]
        .filter(Boolean)
        .join(" "),
    );
    return tokens.every((t) => haystack.includes(t));
  });
}

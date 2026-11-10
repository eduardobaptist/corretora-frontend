import { normalize } from "@/lib/format";
import type { Imovel } from "./types";
import type { FiltrosVitrine, Ordenacao } from "./vitrine-params";

export function parseCaracteristicas(imovel: Imovel) {
  return (imovel.caracteristicas ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function formatEndereco(imovel: Imovel) {
  const rua = [imovel.endereco, imovel.numero].filter(Boolean).join(", ");
  const local = imovel.bairro
    ? `${imovel.bairro.nome} · ${formatCidade(imovel)}`
    : null;
  return [rua, local].filter(Boolean).join(" — ");
}

export function formatCidade(imovel: Imovel) {
  return imovel.bairro ? `${imovel.bairro.cidade}/${imovel.bairro.estado}` : null;
}

// ---------------------------------------------------------------------------
// Filtro/ordenação locais: a API pagina e ordena, mas ainda não filtra.
// Quando houver filtro na API, trocar por query params em GET /imoveis e
// remover estas funções (veja `consultarVitrine` em ./api.ts).
// ---------------------------------------------------------------------------

function precoNoNegocio(imovel: Imovel, negocio: FiltrosVitrine["negocio"]) {
  if (negocio === "comprar") return [imovel.precoVenda];
  if (negocio === "alugar") return [imovel.precoAluguel];
  return [imovel.precoVenda, imovel.precoAluguel];
}

export function filtrarImoveis(imoveis: Imovel[], f: FiltrosVitrine) {
  const tokens = normalize(f.q).split(/\s+/).filter(Boolean);
  const temFaixa = f.precoMin != null || f.precoMax != null;

  return imoveis.filter((imovel) => {
    if (f.negocio === "comprar" && imovel.precoVenda == null) return false;
    if (f.negocio === "alugar" && imovel.precoAluguel == null) return false;
    if (f.tipo && String(imovel.tipoImovel?.id) !== f.tipo) return false;
    if (f.cidade && formatCidade(imovel) !== f.cidade) return false;
    if (f.bairro && String(imovel.bairro?.id) !== f.bairro) return false;
    if (f.dormitorios != null && (imovel.dormitorios ?? 0) < f.dormitorios) return false;

    if (temFaixa) {
      const dentro = precoNoNegocio(imovel, f.negocio).some(
        (p) =>
          p != null &&
          (f.precoMin == null || p >= f.precoMin) &&
          (f.precoMax == null || p <= f.precoMax),
      );
      if (!dentro) return false;
    }

    if (tokens.length === 0) return true;
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

/** Ordena como a API, mas com nulos sempre no fim (o MySQL põe nulos primeiro no asc). */
export function ordenarImoveis(imoveis: Imovel[], ordenacao: Ordenacao) {
  return [...imoveis].sort((a, b) => {
    for (const [campo, dir] of ordenacao) {
      const va = a[campo];
      const vb = b[campo];
      if (va === vb) continue;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = va < vb ? -1 : 1;
      return dir === "asc" ? cmp : -cmp;
    }
    return a.id - b.id;
  });
}

export interface Opcao {
  id: string;
  nome: string;
}

export interface OpcoesFiltro {
  tipos: Opcao[];
  cidades: Opcao[];
  bairros: (Opcao & { cidade: string })[];
}

/** Opções dos selects derivadas dos próprios imóveis (/bairros e /tipos-imoveis exigem login). */
export function opcoesDeFiltro(imoveis: Imovel[]): OpcoesFiltro {
  const tipos = new Map<string, Opcao>();
  const cidades = new Map<string, Opcao>();
  const bairros = new Map<string, Opcao & { cidade: string }>();

  for (const imovel of imoveis) {
    if (imovel.tipoImovel) {
      const id = String(imovel.tipoImovel.id);
      tipos.set(id, { id, nome: imovel.tipoImovel.nome });
    }
    const cidade = formatCidade(imovel);
    if (imovel.bairro && cidade) {
      cidades.set(cidade, { id: cidade, nome: cidade });
      const id = String(imovel.bairro.id);
      bairros.set(id, { id, nome: imovel.bairro.nome, cidade });
    }
  }

  const porNome = (a: Opcao, b: Opcao) => a.nome.localeCompare(b.nome, "pt-BR");
  return {
    tipos: [...tipos.values()].sort(porNome),
    cidades: [...cidades.values()].sort(porNome),
    bairros: [...bairros.values()].sort(porNome),
  };
}

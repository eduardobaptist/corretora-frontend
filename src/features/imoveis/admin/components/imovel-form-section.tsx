import { Card, Skeleton } from "@heroui/react";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { ListaErro } from "@/components/admin/lista-estados";
import { ArrowLeft } from "@/components/icons";
import { comoAdmin } from "@/features/auth/api";
import { listarTodosBairros } from "@/features/bairros/api";
import { listarTodosTiposImovel } from "@/features/tipos-imoveis/api";
import { ApiError } from "@/lib/api";
import { normalize } from "@/lib/format";
import { buscarImovel, listarTodosImoveis } from "../../api";
import { ADMIN_IMOVEIS, SUGESTOES_FINALIDADE, SUGESTOES_STATUS } from "../types";
import { ImovelForm, type ImovelFormProps } from "./imovel-form";

/** Sugestões padrão + valores já usados nos cadastros, sem repetir (ignora acento/maiúscula). */
function unir(padrao: string[], usados: string[]) {
  const vistos = new Set<string>();
  return [...padrao, ...usados].filter((v) => {
    const chave = normalize(v.trim());
    if (!chave || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Carrega o que o formulário precisa: imóvel (edição), tipos e bairros (exigem login). */
export async function ImovelFormSection({ params }: { params?: Promise<{ id: string }> }) {
  const id = params ? (await params).id : null;

  let dados: ImovelFormProps;
  try {
    const [imovel, [tipos, bairros], todos] = await Promise.all([
      id ? buscarImovel(id) : null,
      comoAdmin((auth) => Promise.all([listarTodosTiposImovel(auth), listarTodosBairros(auth)])),
      // Só para sugerir finalidade/status: se falhar, ficam as sugestões padrão.
      listarTodosImoveis().catch(() => []),
    ]);
    if (id && !imovel) notFound();
    dados = {
      imovel,
      tipos,
      bairros,
      sugestoes: {
        finalidade: unir(SUGESTOES_FINALIDADE, todos.map((i) => i.finalidade ?? "")),
        status: unir(SUGESTOES_STATUS, todos.map((i) => i.status ?? "")),
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    return (
      <ListaErro
        titulo="Não foi possível abrir o formulário"
        mensagem={error instanceof ApiError ? error.message : "Erro inesperado."}
      />
    );
  }

  return <ImovelForm {...dados} />;
}

export function VoltarParaImoveis() {
  return (
    <Link
      href={ADMIN_IMOVEIS}
      className="flex w-fit items-center gap-1.5 rounded-md text-sm text-muted hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Imóveis
    </Link>
  );
}

/** Imita o formulário: 4 cartões com campos. */
export function ImovelFormSkeleton() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {[4, 2, 5, 5].map((campos, i) => (
        <Card key={i} className="gap-5 p-5 sm:p-6">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: campos }, (_, j) => (
              <div key={j} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

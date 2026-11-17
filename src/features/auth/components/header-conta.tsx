import { Avatar, buttonVariants } from "@heroui/react";
import Link from "next/link";
import { ArrowRightToSquare } from "@/components/icons";
import { lerSessao } from "../session";
import { AREA_HREF, areaDoPapel, iniciais } from "../utils";

/** Visitante: "Criar conta" (só a partir do sm; no celular fica no login) e "Entrar". Logado: atalho para a própria área (admin ou cliente). */
export async function HeaderConta() {
  const sessao = await lerSessao();

  if (!sessao) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/cadastro"
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} hidden sm:inline-flex`}
        >
          Criar conta
        </Link>
        <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
          <ArrowRightToSquare className="size-4" aria-hidden />
          Entrar
        </Link>
      </div>
    );
  }

  const [primeiroNome] = sessao.nome.split(" ");
  return (
    <Link
      href={AREA_HREF[areaDoPapel(sessao.role)]}
      className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:bg-surface-secondary"
    >
      <Avatar size="sm" color="accent">
        <Avatar.Fallback>{iniciais(sessao.nome)}</Avatar.Fallback>
      </Avatar>
      <span>
        <span className="sr-only">Minha área: </span>
        {primeiroNome}
      </span>
    </Link>
  );
}

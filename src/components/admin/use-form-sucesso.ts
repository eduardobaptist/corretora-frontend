"use client";

import { toast } from "@heroui/react";
import { useEffect } from "react";
import type { FormState } from "@/lib/acoes";

/** Quando a Server Action do formulário responde sucesso: toast + callback (fechar o modal). */
export function useFormSucesso(state: FormState, aoConcluir: () => void) {
  useEffect(() => {
    if (state.status !== "sucesso") return;
    if (state.mensagem) toast.success(state.mensagem);
    aoConcluir();
    // Só reage a um novo resultado da action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

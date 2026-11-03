import "server-only";
import { apiGet } from "@/lib/api";
import type { Imovel } from "./types";

export function listarImoveis() {
  return apiGet<Imovel[]>("/imoveis");
}

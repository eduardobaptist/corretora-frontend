import type { NextRequest } from "next/server";
import { repassarPdf } from "@/features/contratos/pdf";

// PDF do contrato (cliente da oferta ou admin) com o token do cookie. `?baixar=1` força o download.
export async function GET(request: NextRequest, ctx: RouteContext<"/api/contratos/[id]/pdf">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return new Response("Contrato não encontrado.", { status: 404 });
  const baixar = request.nextUrl.searchParams.has("baixar");
  return repassarPdf(`/contratos/${id}/pdf`, {}, { baixar });
}

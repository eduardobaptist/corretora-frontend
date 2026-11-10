import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, sessaoDoToken } from "@/features/auth/token";
import { AREA_HREF, areaDaRota, areaDoPapel } from "@/features/auth/utils";

// Checagem otimista (só o cookie, sem chamar a API) antes de renderizar as áreas logadas:
// sem sessão → login; papel errado → a própria área. A checagem definitiva, com o papel vindo
// de GET /auth/me, é `exigirArea()` (features/auth/api.ts), feita no servidor.

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const area = areaDaRota(pathname);
  if (!area) return NextResponse.next();

  const sessao = sessaoDoToken(request.cookies.get(COOKIE_SESSAO)?.value);
  if (!sessao) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const areaDoUsuario = areaDoPapel(sessao.role);
  if (area !== areaDoUsuario) {
    return NextResponse.redirect(new URL(AREA_HREF[areaDoUsuario], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*"],
};

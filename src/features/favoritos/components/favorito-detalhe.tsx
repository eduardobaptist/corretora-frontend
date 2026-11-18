import { visitanteAtual } from "@/features/auth/api";
import { comNext } from "@/features/auth/utils";
import { ehFavorito, favoritosOuNull } from "../api";
import { FavoritoBotao } from "./favorito-botao";

/** Botão "Favoritar" do detalhe do imóvel. Admin não vê; visitante vai ao login e volta. */
export async function FavoritoDetalhe({ imovelId, titulo, href }: { imovelId: number; titulo: string; href: string }) {
  const visitante = await visitanteAtual();
  if (visitante.tipo === "admin") return null;
  if (visitante.tipo === "anonimo") {
    return (
      <FavoritoBotao imovelId={imovelId} titulo={titulo} favorito={false} loginHref={comNext("/login", href)} variante="botao" />
    );
  }
  const favorito = await favoritosOuNull(() => ehFavorito(visitante.auth, imovelId));
  if (favorito == null) return null;
  return <FavoritoBotao imovelId={imovelId} titulo={titulo} favorito={favorito} variante="botao" />;
}

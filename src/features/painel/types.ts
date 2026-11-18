/** Uma barra de gráfico: nome, valor e (opcional) a lista filtrada que ela representa. */
export interface ItemGrafico {
  rotulo: string;
  /** Texto de apoio ao lado do nome (ex.: "Panambi/RS"). */
  detalhe?: string;
  valor: number;
  href?: string;
  /** Cor da barra (`var(--grafico-n)`); sem cor = a cor única do gráfico. */
  cor?: string;
}

import { formatCurrency } from "@/lib/format";

interface PrecoProps {
  rotulo: string;
  valor: number | null;
  sufixo?: string;
  alinhar?: "start" | "end";
  tamanho?: "md" | "lg";
}

export function Preco({ rotulo, valor, sufixo, alinhar = "start", tamanho = "md" }: PrecoProps) {
  // Nulo não renderiza; o <span /> mantém o justify-between de quem usa.
  if (valor == null) return <span />;

  return (
    <div className={alinhar === "end" ? "text-right" : undefined}>
      <p className="text-xs text-muted">{rotulo}</p>
      <p
        className={`font-semibold leading-tight ${tamanho === "lg" ? "text-2xl" : "text-lg"}`}
      >
        {formatCurrency(valor)}
        {sufixo && <span className="text-sm font-normal text-muted">{sufixo}</span>}
      </p>
    </div>
  );
}

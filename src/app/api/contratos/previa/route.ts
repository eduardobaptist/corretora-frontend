import { repassarPdf } from "@/features/contratos/pdf";

// Prévia do contrato gerado (admin): recebe o mesmo JSON de `ContratoGerarInput` e devolve o PDF
// sem salvar nada. O formulário chama com fetch e mostra o blob.
export async function POST(request: Request) {
  const corpo = await request.text();
  return repassarPdf(
    "/contratos/previa",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo },
    { exigirAdmin: true },
  );
}

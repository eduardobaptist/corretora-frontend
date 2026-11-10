// Colunas pela largura disponível (container query), não pela tela: a vitrine aparece no
// site (largura cheia) e nas áreas logadas (ao lado da sidebar).
export function ImoveisGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-5 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

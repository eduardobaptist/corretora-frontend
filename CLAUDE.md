@AGENTS.md

# corretora-frontend

Frontend de um site de imobiliária/corretora. **O nome do produto ainda não foi definido**:
use o placeholder `APP_NAME` em `src/lib/config.ts` e nunca escreva um nome fixo na UI.

## Arquitetura

- **Next.js 16 (App Router) é só frontend.** Nada de banco, ORM, regra de negócio ou
  autenticação própria no Next. A fonte da verdade é a **API Spring em `localhost:8080`**
  (`API_URL` em `.env.local`, veja `.env.example`).
- A API é chamada **do servidor** (Server Components) via `apiGet` em `src/lib/api.ts`
  (`server-only`). Motivo: sem CORS e a URL da API não vai pro navegador. Mutações futuras:
  Server Actions que repassam para a API.
- Client Components só onde há interatividade (busca, filtros, modais). Os dados chegam
  por props do Server Component pai.
- `cacheComponents` está ligado (padrão do Next 16): fetch sem cache precisa ficar dentro de
  `<Suspense>` com fallback de skeleton. É o que dá o PPR da home (casca estática + streaming).
- Leve de propósito: sem axios, sem React Query, sem store global. Adicione só se houver
  necessidade real (ex.: React Query quando surgirem mutações no client).

### Estrutura

```
src/
  app/                 rotas (finas: montam features dentro de Suspense)
  features/<dominio>/  types.ts (espelha o JSON da API), api.ts (server-only),
                       utils.ts, components/
  components/          compartilhados entre features (ex.: icons/)
  lib/                 api.ts (cliente HTTP), format.ts (moeda/área pt-BR), config.ts
  styles/themes/       presets de tema HeroUI
```

## Design system: HeroUI v3

- `@heroui/react` + `@heroui/styles` v3 (Tailwind v4, componentes compostos tipo
  `Card.Header`, `SearchField.Input`, `Alert.Title`). **Não é a API do HeroUI v2/NextUI**:
  não existe `HeroUIProvider` nem `tailwind.config`. Na dúvida, veja os `.d.ts` em
  `node_modules/@heroui/react/dist/components/<nome>/` ou https://heroui.com/docs/react.
- **Use sempre os componentes do HeroUI primeiro** (Card, Chip, Button, SearchField, Alert,
  Skeleton, EmptyState, Separator, Modal, Tabs, Select…). Varie com as props `variant`,
  `color`, `size` antes de escrever CSS. Customização global vai em `globals.css`, via
  classes BEM (`.card`, `.button--primary`) dentro de `@layer components`.
- **Cores só por tokens semânticos**: `bg-background`, `bg-surface`, `bg-surface-secondary`,
  `text-foreground`, `text-muted`, `bg-accent`/`text-accent`, `success`, `warning`,
  `danger`, `border-border`, `bg-field`. Nunca use hex nem paleta crua (`green-500`).
- Ícones: `@gravity-ui/icons` (o set do HeroUI), reexportados de `src/components/icons`.
  Os que faltam no Gravity (Bed, Bath) estão desenhados ali no mesmo estilo.
- Fonte: Inter (`next/font`) → `--font-sans`.

### Tema: preset "Spotify"

- `src/styles/themes/spotify.css` traz o preset oficial "Spotify" do Theme Builder do HeroUI
  (accent verde `oklch(76.97% 0.2123 148.69)`, field-radius extra-small, radius medium),
  com variantes claro e escuro.
- Ativado por `<html data-design-theme="spotify">` em `src/app/layout.tsx`.
- Claro/escuro: `next-themes` com `attribute="class"` (`src/app/providers.tsx`), padrão
  `light`. **O dark mode já funciona no CSS, mas ainda não há toggle na UI**. Para criar
  um, use `useTheme()` do next-themes. Mantenha todo componente compatível com dark
  (por isso: só tokens semânticos).
- Trocar o preset no futuro: substituir o arquivo do tema e o atributo `data-design-theme`.

## API (Spring, `localhost:8080`)

- `GET /imoveis` → `Imovel[]`. Tipos em `src/features/imoveis/types.ts`; campos numéricos
  e relações podem vir `null`. `caracteristicas` é uma string separada por vírgula.
- A busca da home é **local** (`filtrarImoveis` em `features/imoveis/utils.ts`, sem acento e
  sem diferenciar maiúsculas) porque a API ainda não filtra. Quando a API ganhar filtro,
  mover para query param e remover o filtro local.

## Telas

- `/`: título, campo de busca grande (SearchField arredondado) e grid de `ImovelCard`.
  Estados: skeleton (Suspense), erro (Alert danger quando a API está fora), vazio (EmptyState).
  As fotos ainda não vêm da API; o card usa um placeholder com gradiente do accent.

## Convenções

- UI e código de domínio em **português** (nomes de tipos/campos seguem a API).
- Formatação pt-BR via `src/lib/format.ts` (`formatCurrency`, `formatArea`).
- Comandos: `npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit`.

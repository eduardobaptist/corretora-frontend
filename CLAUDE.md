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

**Padrões visuais, receitas de componentes e estados de tela: [`DESIGN.md`](DESIGN.md).**
Siga-o em toda tela nova.

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

**Contrato completo: [`docs/openapi.yaml`](docs/openapi.yaml).** É a referência para toda
feature nova (endpoints, schemas, regras de acesso). Leia antes de criar tipos ou chamadas.
Pontos que pegam de surpresa:

- Auth: `POST /auth/login` → `{ token }` (JWT, 120 min, sem refresh). Rotas protegidas usam
  `Authorization: Bearer`. O payload traz `id`, `nome`, `roles`. 401/403 vêm com corpo vazio.
- Público: `POST /auth/login`, `GET /imoveis`, `GET /imoveis/{id}`, `POST /imoveis/sabermais/{id}`
  e `GET /uploads/**`. `/bairros` e `/tipos-imoveis` exigem login; escrita em imóveis, `/fotos`
  e `/user` exigem ADMIN.
- Listagens são **paginadas**: `page` (0-based), `size` (máx. 100), `sort=campo,dir` (repetível;
  relação com ponto: `bairro.nome`). Resposta `{ content, page: { size, number, totalElements,
  totalPages } }` (`Page<T>` em `src/lib/api.ts`). `sort` com campo inexistente → 500.
- `fotos` em `GET /imoveis` e `GET /imoveis/{id}`: array de URLs absolutas e públicas (capa
  primeiro), direto no `<img>`.
- `POST` de imóvel/bairro/tipo → `201` **sem corpo** (id só no header `Location`).
  `PUT` → `204` e **substitui tudo** (campo omitido vira `null`). Relações vão como `{ "id": n }`.
- `GET /bairros/{id}` e `/tipos-imoveis/{id}` inexistente → `200` com corpo vazio (não 404).
- `GET /user/` exige a barra final; `POST /user` é sem barra.
- CORS não configurado no Spring: mais um motivo para chamar a API só do servidor.

### Imóveis no front (`src/features/imoveis/`)

- `api.ts` (server-only): `listarImoveis` (página da API), `buscarImovel` (`null` se 404,
  deduplicado com `cache()`), `enviarSaberMais`, e `consultarVitrine`, que decide a estratégia:
  - **sem filtro** → paginação e ordenação direto na API;
  - **com filtro** (ou ordenação asc por campo que pode ser nulo, que o MySQL põe no topo) →
    `listarTodosImoveis` (varre as páginas de 100, `'use cache'` + `cacheLife("minutes")`),
    filtra/ordena/pagina localmente (`utils.ts`) e devolve no mesmo formato `Page`.
  A API **ainda não filtra**: quando filtrar, troque o modo local por query params e apague
  `filtrarImoveis`/`ordenarImoveis`/`listarTodosImoveis`.
- `normalizar` (em `api.ts`) trata preço `0` como `null` (cadastros usam 0 para "não se aplica").
- Opções dos filtros (tipo, cidade, bairro) saem dos próprios imóveis (`opcoesDeFiltro`),
  porque `/bairros` e `/tipos-imoveis` exigem login.
- `vitrine-params.ts`: estado da vitrine **na URL** (`q, negocio, tipo, cidade, bairro, dorm,
  min, max, ordem, pagina` 1-based). `parseVitrineParams`/`toSearchParams` são isomórficos.
- `actions.ts`: Server Action `enviarContato` (valida tudo; a API dá 500 com campo nulo).

### Autenticação (`src/features/auth/`)

- Sem auth própria: a sessão é o **JWT da API** num cookie httpOnly `sessao` (`session.ts`),
  com `maxAge` = `exp` do token (não há refresh). O payload é só decodificado (nome, papel,
  validade); quem autoriza é a API.
- `actions.ts`: `entrar` (valida `LoginRequest`, chama `POST /auth/login`, grava o cookie e
  redireciona para `?next=` seguro ou para a área do papel) e `sair` (apaga o cookie → `/`).
  401 do login mostra o texto da API ("E-mail ou senha inválidos.").
- `api.ts`: `usuarioAtual()` confirma a sessão em `GET /auth/me` (com `bearer(token)` de
  `lib/api.ts`). Sem sessão → `/login?next=`; 401/404 → `/login?motivo=expirado&next=`.
  Use-o (ou `lerSessao()`) só **dentro de `<Suspense>`**: lê cookie.
- Chamadas autenticadas futuras: `apiGet(path, { headers: bearer(sessao.token) })` e trate
  401 do mesmo jeito (redirecionar para o login).
- **Acesso por papel**: ADMIN só em `/admin/**`, BASIC só em `/cliente/**` (regra única em
  `utils.ts`: `areaDaRota`/`podeAcessar`). Duas camadas:
  1. `src/proxy.ts` (otimista, só o cookie via `token.ts`): sem sessão → `/login?next=`; papel
     errado → a própria área. Roda antes de renderizar, sem "piscar" a tela.
  2. `exigirArea(area)` (`api.ts`, definitiva, papel vindo de `GET /auth/me`): usada pelo bloco de
     perfil do `AreaShell`. **Toda página ou Server Action de área que buscar/alterar dados deve
     chamar `exigirArea` antes** (o proxy não é autorização; a API ainda responde 403).
  O login só respeita `?next=` se o papel puder abrir a rota.
- Cadastro público não existe na API (`POST /user` é ADMIN): sem tela de cadastro por ora.

## Telas

- `/`: vitrine. Título, busca (debounce, `?q=`), filtros (lateral no desktop, recolhível no
  celular), ordenação, grid de `ImovelCard` (foto de capa ou placeholder) e paginação HeroUI.
  Controles client chamam `useVitrine().navegar(patch)` → `router.push` em transição; o Server
  Component relê `searchParams`. Estados: skeleton, erro, vazio (com/sem filtro, página inexistente).
- `/imoveis/[id]`: breadcrumbs, galeria (setas, miniaturas, teclado), atributos, descrição,
  características, detalhes e card lateral fixo com preço + formulário "saber mais".
  Id inexistente → `notFound()` (`src/app/not-found.tsx`). Metadata com título e foto.
- `/login`: card com e-mail e senha (mostrar/ocultar), erros por campo e Alert para credenciais
  inválidas, API fora ou sessão expirada.
- **A vitrine também existe dentro das áreas**: `/admin/vitrine` e `/cliente/vitrine` (+ `/[id]`).
  As rotas são finas e montam `VitrinePagina`/`ImovelPagina` (`features/imoveis/components/
  paginas.tsx`) com `base` = caminho da listagem; `hrefImovel(base, id)` gera o link do detalhe
  (site: `/imoveis/[id]`; áreas: `${base}/[id]`), e breadcrumbs/voltar usam o mesmo `base`.
- `/admin/*` (Geral: Painel, Vitrine · Cadastros: Imóveis, Bairros, Tipos de imóvel, Usuários) e
  `/cliente/*` (Início, Vitrine, Meu perfil): `AreaShell` = sidebar com as opções do papel + bloco de perfil (avatar, nome, e-mail e
  botão Sair; o chip "Admin" fica no topo, só na área admin). Páginas ainda vazias ("Em breve"), `noindex`.
- Rotas: `app/(site)/` tem o `SiteHeader` (logo + "Entrar" ou avatar com atalho para a área);
  `app/admin` e `app/cliente` usam o `AreaShell`, sem o header do site.

## Convenções

- UI e código de domínio em **português** (nomes de tipos/campos seguem a API).
- Formatação pt-BR via `src/lib/format.ts` (`formatCurrency`, `formatArea`).
- Comandos: `npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit`.

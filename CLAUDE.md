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
                       actions.ts (Server Actions), utils.ts, components/
                       domínios: imoveis (+ imoveis/admin), bairros, tipos-imoveis,
                       usuarios, auth
  components/          compartilhados entre features: icons/, paginacao.tsx,
                       admin/ (peças de CRUD, ver "Cadastros do admin")
  lib/                 api.ts (cliente HTTP), format.ts (moeda/área pt-BR), config.ts,
                       lista.ts (?pagina/?q das listas), acoes.ts (FormState, leitura de
                       FormData), erros.ts (mensagens de falha, server-only)
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

- Auth: `POST /auth/login` → `{ token }` (JWT, 120 min, sem refresh). `POST /auth/cadastro`
  (público, `{ nome, email, senha }`) cria um cliente BASIC e devolve o mesmo `{ token }`; 409 = e-mail
  repetido. Rotas protegidas usam
  `Authorization: Bearer`. O payload traz `id`, `nome`, `roles`. 401/403 vêm com corpo vazio.
- Público: `POST /auth/login`, `POST /auth/cadastro`, `GET /imoveis`, `GET /imoveis/{id}`, `POST /imoveis/sabermais/{id}`
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
- **Validação → `400` com objeto plano `{ campo: mensagem }`** (uma por campo; aninhado com ponto:
  `bairro.id`; JSON malformado → `corpo`). As regras (obrigatório, `maxLength`, `pattern`, mínimos,
  dígitos de decimais) estão nos schemas `*Input`/`*Request` do yaml. Strings só com espaços contam
  como ausentes.
- CORS não configurado no Spring: mais um motivo para chamar a API só do servidor.
- **Fotos não têm listagem**: não existe `GET /fotos` nem `GET /fotos/{id}` (405). `GET /imoveis/{id}`
  só traz as URLs, sem o `id` de cada foto, e `PUT /fotos`, `POST /fotos/{id}` (capa) e
  `DELETE /fotos/{id}` precisam dele. Por isso **o CRUD de fotos não foi implementado**: falta a API
  devolver as fotos com id (ex.: `GET /imoveis/{id}/fotos` → `FotoImovel[]`).
- Exclusão com vínculo (bairro/tipo usado por imóvel, imóvel com fotos): a API não trata a chave
  estrangeira e deve responder 500. O front mostra "verifique se ainda há … vinculados".
- `/user/**` não busca por nome/e-mail nem impede o admin de se excluir ou trocar o próprio papel:
  essas regras ficam no front (ver "Cadastros do admin").

Cliente HTTP (`src/lib/api.ts`): `apiGet`, `apiGetOuNull` (para o 200 com corpo vazio), `apiPost`,
`apiPut`, `apiDelete`, `queryPagina(page, size, sort[])`, `listarTodasPaginas(buscar)` (varre as
páginas de 100) e `paginarLocal(itens, pagina, size)`. Erros viram `ApiError` (`status`, `body`, e
`validacao`: o mapa `{ campo: mensagem }` de um 400, ou `null`).

**Validação em duas camadas** (toda Server Action que manda corpo para a API):
1. **Front primeiro**: a action valida com as mesmas regras do yaml usando `validador()` de
   `lib/acoes.ts` (primeira regra que falha por campo, como a API) e as constantes `MAX_TEXTO` (255),
   `MAX_TEXTO_LONGO` (16000), `MAX_MENSAGEM` (2000), `SENHA_MIN/MAX` (6/72), `CEP`, `TELEFONE`,
   `decimalValido(n, digitosInteiros)`. Os campos têm `maxLength` com o mesmo limite. O front pode ser
   mais estrito que a API (ex.: finalidade/status/endereço do imóvel obrigatórios), nunca mais frouxo.
2. **400 da API**: `falhaDeFormulario(error, acao, CAMPOS)` (`lib/erros.ts`) põe cada mensagem no
   campo do formulário (raiz da chave: `bairro.id` → `bairro`) e o resto (`corpo`, campo fora da tela)
   no Alert geral. Fora de `FormState` (login, contato), use `errosDaApi` + `resumoDaValidacao`.
   `mensagemDeErro` também entende 400 (ações sem formulário, ex.: trocar perfil).

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
- `listarTodosImoveis` tem `cacheTag(TAG_IMOVEIS)`: **toda mutação que muda imóveis (inclusive
  bairro e tipo, que vêm aninhados) chama `updateTag(TAG_IMOVEIS)`**, senão a vitrine fica velha por
  minutos.
- Opções dos filtros (tipo, cidade, bairro) saem dos próprios imóveis (`opcoesDeFiltro`),
  porque `/bairros` e `/tipos-imoveis` exigem login.
- `vitrine-params.ts`: estado da vitrine **na URL** (`q, negocio, tipo, cidade, bairro, dorm,
  min, max, ordem, pagina` 1-based). `parseVitrineParams`/`toSearchParams` são isomórficos.
- `actions.ts`: Server Action `enviarContato` (telefone opcional, com o `pattern` da API + DDD;
  400 vai para os campos; 404 = imóvel removido).

### Autenticação (`src/features/auth/`)

- Sem auth própria: a sessão é o **JWT da API** num cookie httpOnly `sessao` (`session.ts`),
  com `maxAge` = `exp` do token (não há refresh). O payload é só decodificado (nome, papel,
  validade); quem autoriza é a API.
- `actions.ts`: `entrar` (valida `LoginRequest`, chama `POST /auth/login`, grava o cookie e
  redireciona para `?next=` seguro ou para a área do papel), `cadastrar` (autocadastro: valida
  `CadastroRequest`, `POST /auth/cadastro`, grava o cookie do token devolvido e entra em `/cliente`
  ou no `?next=` permitido) e `sair` (apaga o cookie → `/`). 401 do login mostra o texto da API
  ("E-mail ou senha inválidos."); 409 do cadastro vai para o campo e-mail.
- `api.ts`: `usuarioAtual()` confirma a sessão em `GET /auth/me` (com `bearer(token)` de
  `lib/api.ts`). Sem sessão → `/login?next=`; 401/404 → `/login?motivo=expirado&next=`.
  Use-o (ou `lerSessao()`) só **dentro de `<Suspense>`**: lê cookie.
- Chamadas autenticadas de admin: **`comoAdmin((auth, usuario) => ...)`** (`api.ts`). Confirma o
  papel (`exigirArea("admin")`), passa o header Bearer e trata 401 mandando para
  `/login?motivo=expirado`. `usuario` é o admin logado (regra "não excluir a si mesmo").
- **Papel trocado depois do login**: o JWT do cookie guarda o papel antigo (o proxy decide por ele),
  mas `/auth/me` traz o novo. `exigirArea` detecta a divergência e manda para `/login?motivo=perfil`
  (senão proxy e página ficariam em loop de redirecionamento). Um novo login grava o token certo.
- **Acesso por papel**: ADMIN só em `/admin/**`, BASIC só em `/cliente/**` (regra única em
  `utils.ts`: `areaDaRota`/`podeAcessar`). Duas camadas:
  1. `src/proxy.ts` (otimista, só o cookie via `token.ts`): sem sessão → `/login?next=`; papel
     errado → a própria área. Roda antes de renderizar, sem "piscar" a tela.
  2. `exigirArea(area)` (`api.ts`, definitiva, papel vindo de `GET /auth/me`): usada pelo bloco de
     perfil do `AreaShell`. **Toda página ou Server Action de área que buscar/alterar dados deve
     chamar `exigirArea` antes** (o proxy não é autorização; a API ainda responde 403).
  O login só respeita `?next=` se o papel puder abrir a rota.
- Autocadastro em `/cadastro` (só cliente; admin continua sendo criado em `/admin/usuarios`). Login e
  cadastro se linkam levando o `?next=` (`comNext` em `utils.ts`); o header mostra "Criar conta" do
  `sm` para cima.

### Cadastros do admin

Padrão de toda tela de cadastro (`/admin/bairros`, `/admin/tipos-imoveis`, `/admin/usuarios`,
`/admin/imoveis`):

- **Rota fina** → `<Suspense fallback={<XSkeleton />}><XSection searchParams /></Suspense>`.
- **`XSection`** (Server Component): `parseListaParams` (`?pagina=` 1-based, `?q=`), busca a página
  via `comoAdmin` e entrega a `XTabela` (client). Erro → `ListaErro` com a toolbar desabilitada.
  No `catch`, chame `unstable_rethrow(error)` antes de tudo (não engolir o redirect do login).
  Não monte JSX dentro do `try` (regra de lint `react-hooks/error-boundaries`).
- **`XTabela`** (client): `ListaProvider` (URL como fonte da verdade, igual à vitrine), `ListaToolbar`
  (contagem/busca + botão "Novo …"), HeroUI `Table`, `ListaPaginacao`, estados vazios (sem cadastro,
  busca sem resultado, página inexistente). Ações de linha com `AcaoIcone` (ícone + tooltip).
- **Formulário**: em modal (`FormularioModal`) para bairro, tipo e usuário; em página própria para
  imóvel (`/admin/imoveis/novo` e `/admin/imoveis/[id]`, mais de 20 campos). `useActionState` com a
  Server Action ligada ao id (`salvarX.bind(null, id | null)`), erros por campo em
  `validationErrors`, sucesso → `toast.success` (Toast.Provider em `providers.tsx`) e fecha/volta.
  `useAlvo()` guarda o registro aberto e uma `chave` para remontar o formulário zerado.
- **Exclusão** sempre confirmada em `ConfirmarExclusao` (AlertDialog `danger`, cita o nome e que não
  dá para desfazer). Falha da API → o diálogo fica aberto com o erro. `ConfirmarAcao` é a versão
  genérica (usada para trocar perfil).
- **Server Actions** (`features/<d>/actions.ts`): validam tudo com as regras do yaml (o PUT substitui
  o registro inteiro: mande todos os campos; vazio → `null`), chamam a API via `comoAdmin`, traduzem
  falhas com `falhaDeFormulario`/`mensagemDeExclusao` (`lib/erros.ts`) e terminam com `refresh()` (+
  `updateTag(TAG_IMOVEIS)` quando afeta imóveis). Devolvem `FormState` ou `ResultadoAcao`.
- Constantes usadas por Server Components não podem sair de arquivo `"use client"` (viram
  referência de client): deixe-as em `types.ts` ou no próprio arquivo do servidor.

Particularidades:

- **Imóveis**: lista paginada na API (mais recentes primeiro), com miniatura da capa. `finalidade` e
  `status` são texto livre: `ComboBox allowsCustomValue` sugere os valores padrão (`SUGESTOES_*` em
  `imoveis/admin/types.ts`) mais os já usados. Tipo e bairro em `Select` (opção "Sem …" = `null`).
  Preço `0`/vazio é gravado como `null`. Editar não mexe nas fotos.
- **Bairros**: UF em `Select` (`UFS`), CEP normalizado para `00000-000` (`cepOuNull`), faixa validada.
- **Usuários**: busca por nome ou e-mail **local** (a API não busca): com `?q=`,
  `consultarUsuarios` varre todas as páginas e filtra sem acento/maiúscula; sem `q`, pagina na API.
  Quando a API buscar, trocar por query param. "Trocar perfil" relê o usuário na API e faz o PUT com
  nome/e-mail atuais (o PUT sempre os sobrescreve). **O admin não pode excluir a si mesmo nem trocar
  o próprio perfil**: botões desabilitados na linha "Você" e a mesma regra nas actions (a API não
  impede). Senha vazia na edição mantém a atual; 409 → erro no campo e-mail.

## Telas

- `/`: vitrine. Título, busca (debounce, `?q=`), filtros (lateral no desktop, recolhível no
  celular), ordenação, grid de `ImovelCard` (foto de capa ou placeholder) e paginação HeroUI.
  Controles client chamam `useVitrine().navegar(patch)` → `router.push` em transição; o Server
  Component relê `searchParams`. Estados: skeleton, erro, vazio (com/sem filtro, página inexistente).
- `/imoveis/[id]`: breadcrumbs, galeria (setas, miniaturas, teclado), atributos, descrição,
  características, detalhes e card lateral fixo com preço + formulário "saber mais".
  Id inexistente → `notFound()` (`src/app/not-found.tsx`). Metadata com título e foto.
- `/login`: card com e-mail e senha (mostrar/ocultar), erros por campo e Alert para credenciais
  inválidas, API fora, sessão expirada (`?motivo=expirado`) ou perfil trocado (`?motivo=perfil`).
  Link "Criar conta".
- `/cadastro`: mesmo card, com nome, e-mail e senha (`CampoSenha`, 6 a 72); sucesso já entra logado.
- **A vitrine também existe dentro das áreas**: `/admin/vitrine` e `/cliente/vitrine` (+ `/[id]`).
  As rotas são finas e montam `VitrinePagina`/`ImovelPagina` (`features/imoveis/components/
  paginas.tsx`) com `base` = caminho da listagem; `hrefImovel(base, id)` gera o link do detalhe
  (site: `/imoveis/[id]`; áreas: `${base}/[id]`), e breadcrumbs/voltar usam o mesmo `base`.
- `/admin/*` (Geral: Painel, Vitrine · Cadastros: Imóveis, Bairros, Tipos de imóvel, Usuários) e
  `/cliente/*` (Início, Vitrine, Meu perfil): `AreaShell` = sidebar com as opções do papel + bloco de perfil (avatar, nome, e-mail e
  botão Sair; o chip "Admin" fica no topo, só na área admin). `noindex`. Cadastros do admin prontos
  (ver acima); Painel e as páginas do cliente ainda "Em breve".
- Rotas: `app/(site)/` tem o `SiteHeader` (logo + "Entrar" ou avatar com atalho para a área);
  `app/admin` e `app/cliente` usam o `AreaShell`, sem o header do site.

## Convenções

- UI e código de domínio em **português** (nomes de tipos/campos seguem a API).
- Formatação pt-BR via `src/lib/format.ts` (`formatCurrency`, `formatArea`).
- Comandos: `npm run dev` · `npm run build` · `npm run lint` · `npx tsc --noEmit`.

# DESIGN.md

Padrões visuais e de UI **já praticados** no projeto. Cada regra aponta para o arquivo onde
ela aparece; ao criar uma tela nova (login, detalhe do imóvel, admin, "saber mais"), siga
estas receitas antes de inventar outras. Arquitetura e API ficam no [`CLAUDE.md`](CLAUDE.md).

---

## 1. Princípios

1. **HeroUI v3 primeiro.** Use o componente pronto (Card, Chip, SearchField, Alert,
   Skeleton, EmptyState, Separator…) e varie com `variant`, `color`, `size` antes de escrever
   CSS. Classes Tailwind servem para layout e espaçamento, não para recriar o componente.
2. **Só tokens semânticos.** `bg-surface`, `text-muted`, `text-accent`… Nunca hex nem paleta
   crua (`green-500`, `gray-100`).
3. **Tudo funciona em claro e escuro.** Consequência direta do item 2: se só usa tokens,
   o dark mode vem de graça.
4. **Sem nome de produto na UI.** Use `APP_NAME` (`src/lib/config.ts`).
5. **UI em pt-BR**, formatação pt-BR (`src/lib/format.ts`).
6. **Estado de listagem na URL** (busca, filtros, ordem, página): link compartilhável, voltar
   do navegador funciona, e o servidor renderiza já filtrado (`vitrine-params.ts`).

---

## 2. Tema e tokens

### Preset

- Preset **"Spotify"** do Theme Builder do HeroUI em `src/styles/themes/spotify.css`,
  ativado por `<html data-design-theme="spotify">` (`src/app/layout.tsx`).
- Claro/escuro pela classe `.dark` no `<html>`, via `next-themes`
  (`src/app/providers.tsx`: `attribute="class"`, `defaultTheme="light"`,
  `enableSystem={false}`). **Ainda não há toggle**; quando houver, usar `useTheme()`.
- Trocar a identidade visual = trocar o arquivo do preset e o atributo `data-design-theme`.

### Tokens e quando usar

| Token (classe) | Uso |
|---|---|
| `bg-background` | Fundo da página (já aplicado no `<body>`) |
| `bg-surface` | Superfícies elevadas: cards, painéis (o `Card` já usa) |
| `bg-surface-secondary` / `-tertiary` | Áreas de apoio dentro de superfícies, fim de gradientes |
| `text-foreground` | Texto principal (padrão do `<body>`) |
| `text-muted` | Texto secundário: descrições, rótulos, ícones de apoio, contagens |
| `text-accent` / `bg-accent` | Marca (verde). Ênfase pontual, destaque, placeholder de mídia |
| `accent-foreground` | Texto sobre fundo accent (escuro, não branco: o verde é claro) |
| `success` / `warning` / `danger` | Estados semânticos (status do imóvel, alertas) |
| `border-border`, `separator` | Bordas e divisórias (prefira `<Separator />`) |
| `field-*` (`bg-field`) | Campos de formulário (o HeroUI já aplica) |
| `focus` | Anel de foco (igual ao accent) |
| `chart-1` … `chart-5` | Gráficos: escala de luminosidade derivada do accent |

Opacidade sobre token é permitida (`from-accent/25`, `via-accent/10`).

### Raios

- `radius` **medium** para componentes; `--field-radius: 0.125rem` (campos quase retos).
- Exceção intencional: a busca principal é `rounded-full` (ver §6).

### Onde customizar CSS

`src/app/globals.css` declara as camadas `theme, base, components, utilities`. Customização
global de componente HeroUI vai em `@layer components` com as classes BEM do HeroUI
(`.card`, `.button--primary`). Não existe `tailwind.config` nem `HeroUIProvider` (isso é v2).

---

## 3. Tipografia

Fonte **Inter** (`next/font`) → `--font-sans`, aplicada no `<body>` com `antialiased`.

| Papel | Classes | Onde |
|---|---|---|
| Título de página (h1) | `text-3xl sm:text-4xl font-bold tracking-tight` | `src/app/page.tsx` |
| Subtítulo de página | `text-muted` | `src/app/page.tsx` |
| Título de card | `Card.Title` + `text-base line-clamp-1` | `imovel-card.tsx` |
| Corpo / apoio | `text-sm text-muted` | descrição do card, contagem, empty state |
| Rótulo pequeno | `text-xs text-muted` | "Venda", "Aluguel" |
| Valor em destaque | `text-lg font-semibold leading-tight` | preço |
| Sufixo de valor | `text-sm font-normal text-muted` | "/mês" |
| Título de empty state | `font-medium` | `imoveis-explorer.tsx` |

Ênfase de marca numa palavra: `<span className="text-accent">` (o "certo" do h1). Use com
parcimônia, uma vez por tela.

---

## 4. Layout e espaçamento

- **Container de página**: utility `container-site` (`globals.css`): centralizado, até
  `96rem` (1536px), respiro lateral de 16px (24px a partir de `sm`). Use em todo bloco público
  (header, páginas, not-found) em vez de `max-w-*` + `px-*` soltos. Vertical: `py-6 sm:py-10`.
- **Áreas logadas**: conteúdo sem largura máxima, `px-4 sm:px-6`.
- **Pilhas verticais** com `flex flex-col` + `gap`:
  - `gap-8` entre seções (cabeçalho ↔ busca ↔ resultados);
  - `gap-4` entre blocos relacionados (contagem ↔ grid);
  - `gap-1.5` a `gap-3` entre itens (chips, atributos, linhas do card).
- **Grid de cards** (`imoveis-grid.tsx`):
  `grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4` (12 por página
  divide por 2, 3 e 4).
  Reutilize `ImoveisGrid` também no skeleton, para o layout não pular.
- **Lista com filtros** (`vitrine-section.tsx`):
  `grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8`: lateral de 17rem
  e conteúdo com `min-w-0` (sem isso o grid estoura com texto longo).
- **Detalhe** (`imovel-detalhe.tsx`): `lg:grid-cols-[minmax(0,1fr)_22rem]`, com a coluna da
  direita `lg:sticky lg:top-24`.
- **Cabeçalho do site** (`site-header.tsx`): `sticky top-0 h-16`, `bg-background/80
  backdrop-blur border-b`. Tudo que gruda abaixo dele usa `lg:top-24`. À direita, só a conta:
  visitante vê `Link` com `buttonVariants({ variant: "primary", size: "sm" })` "Entrar";
  logado vê avatar + primeiro nome levando à própria área.
- **Áreas logadas** (`area-shell.tsx`): `lg:grid-cols-[16rem_minmax(0,1fr)]`, sidebar
  `bg-surface border-r lg:sticky lg:h-dvh`; conteúdo `px-4 py-8 sm:px-6 lg:px-10`. No celular a
  sidebar vira barra de `h-16` com botão de menu.
- **Telas de formulário isolado** (login): `Card max-w-sm p-6` centralizado na página.
- Mobile first: classe base para celular, breakpoints `sm`/`lg`/`2xl` ampliam.
- **Componentes que aparecem no site e nas áreas logadas** (vitrine, detalhe) usam **container
  queries**, não breakpoints de tela: ao lado da sidebar sobra menos largura. Containers
  nomeados `@container/vitrine` e `@container/detalhe` (layout em `@4xl/…` = 56rem) e o grid de
  cards com `@container` próprio (`@xl:2 · @4xl:3 · @6xl:4` colunas). `sm:` continua valendo
  para ajustes de celular.
- **Sticky** (filtros, card de contato): `top-(--topo-fixo)
  max-h-[calc(100dvh-var(--topo-fixo)-1rem)] overflow-y-auto`. `--topo-fixo` é `6rem` no site
  (abaixo do header) e `1.5rem` nas áreas (definido no `<main>` do `AreaShell`).
- **Celular** (padrões adotados):
  - controles de toolbar ocupam a linha toda (`w-full sm:w-auto`), select com `min-w-0 flex-1`;
  - paginação vira setas + "X de N" (`sm:` mostra os números);
  - breadcrumbs viram "← Voltar" (`sm:hidden` / `hidden sm:flex`);
  - informação decisiva que no desktop fica numa coluna lateral (preço) é repetida perto do
    topo com `lg:hidden`, e escondida na lateral com `hidden lg:flex`;
  - mídia principal mais alta (`aspect-[4/3] sm:aspect-[16/10]`);
  - rótulos de grupos de botões curtos ("Todos", "1+"), para caber em 5 botões na lateral.

---

## 5. Iconografia

- Set: **`@gravity-ui/icons`** (o do HeroUI v3). Importe **sempre** de `@/components/icons`,
  que reexporta os usados e adiciona os que faltam (`src/components/icons/index.tsx`).
- Ícone novo que o Gravity não tem: desenhe ali no mesmo estilo: `viewBox 0 0 16 16`,
  `fill="none"`, `stroke="currentColor"`, `strokeWidth 1.5`, pontas e junções arredondadas,
  `aria-hidden`, aceitando `SVGProps` (veja `Bed` e `Bath`).
- Cor herdada do texto (`currentColor`); para apoio, `text-muted`; para marca, `text-accent`.
- Tamanhos em uso:

| Tamanho | Contexto |
|---|---|
| `size-3` | Dentro de `Chip` sm |
| `size-3.5` | Inline em `Card.Description` |
| `size-4` | Lista de atributos |
| `size-5` | Ícone de campo (SearchField grande) |
| `size-8` | Empty state |
| `size-10` | Confirmação (sucesso do formulário) |
| `size-12` / `size-16` | Placeholder de mídia (card / galeria) |

- Ícone decorativo (ao lado de texto) leva **sempre** `aria-hidden`.

---

## 6. Componentes e receitas

### Card de entidade: `src/features/imoveis/components/imovel-card.tsx`

```
┌──────────────────────────────┐
│ [chip tipo][chip finalidade] [★ Destaque] │  ← mídia aspect-[16/10]
│            (ícone/foto)                   │
├──────────────────────────────┤
│ Título (line-clamp-1)          [status]   │  ← Card.Header px-4
│ 📍 endereço (truncate)                    │
│ descrição (line-clamp-2, muted)           │  ← Card.Content px-4 gap-3
│ 🛏 2 dorm. 🛁 1 banh. 🚗 1 vagas ▦ 68 m²   │
│ [chip][chip][chip][chip][+3]              │
├──────────────────────────────┤  ← <Separator className="mt-auto" />
│ Venda R$ 450.000        Aluguel R$ 2.200/mês │  ← Card.Footer px-4 pb-4
└──────────────────────────────┘
```

- `Card` com `h-full overflow-hidden p-0` (mídia encosta nas bordas; padding vai nas partes).
- `Separator mt-auto` empurra o rodapé para baixo: cards da mesma linha alinham os preços.
- Texto de tamanho variável sempre limitado: `line-clamp-1/2` ou `truncate` (+ `shrink-0`
  no que não pode encolher, como o chip de status e ícones).
- Subcomponentes privados no mesmo arquivo (`Atributo`, `Preco`) quando só esse card usa.

- O card inteiro é clicável por um **link esticado** no título
  (`after:absolute after:inset-0`), com `focus-within:ring-2 ring-focus` e `hover:shadow-md`.
  Na foto, `group-hover:scale-105`. Não envolva o `Card` todo num `<a>`.
- Mais de uma foto: chip `secondary` no canto inferior direito com `Picture` + "N fotos".

### Fotos e placeholder: `imovel-midia.tsx`

- `ImovelFoto`: `next/image` com `fill`, `object-cover`, `sizes` coerente com o grid e
  `unoptimized` (o otimizador do Next recusa `localhost`). `priority` só nos 3 primeiros cards
  e na primeira foto da galeria. `alt` = título do imóvel (miniaturas: `alt=""`).
- `ImovelFotoPlaceholder` quando `fotos` vem vazio:
  `bg-gradient-to-br from-accent/25 via-accent/10 to-surface-secondary` + `House text-accent`.
- Chips sobre a foto: `absolute inset-x-3 top-3`.

### Galeria: `imovel-galeria.tsx`

Foto principal `aspect-[16/10] rounded-2xl`; setas `Button isIconOnly variant="secondary"
rounded-full` nas laterais; contador "3 / 8" em chip; setas do teclado navegam; miniaturas
`h-16 w-24 rounded-lg` em linha com rolagem, a ativa com `ring-2 ring-accent`
e `aria-current`.

### Chips

- Sempre `size="sm"` em cards.
- `variant="secondary"`: metadados sobre a mídia (tipo, finalidade).
- `variant="soft"`: status e características.
- `color="accent" variant="primary"` + `StarFill`: "Destaque". Com ícone, use `Chip.Label`
  para o texto.
- **Status do imóvel → cor** (`StatusChip`, enum `StatusImovel`, texto de `ROTULO_STATUS_IMOVEL`):

| Status | `color` |
|---|---|
| `DISPONIVEL` | `success` |
| `RESERVADO` | `warning` |
| `VENDIDO`, `ALUGADO` | `danger` |

- Listas longas: mostrar no máximo **4** e um chip `+N` com o restante.
- **Oferta → cor** (`OfertaStatusChip`): pendente `accent` (pede ação do admin), em espera `warning`,
  aceita `success`, recusada `danger`, cancelada `default`.
- **Contrato → cor** (`ContratoStatusChip`): aguardando assinatura `warning`, assinado `success`,
  cancelado `default`.
- Negócio da oferta/contrato em `Chip secondary` ("Venda"/"Aluguel"); valor com `ValorOferta`
  (`/mês` em `text-muted` no aluguel).

### Favorito: `favorito-botao.tsx`

- No card: `Button isIconOnly size="sm" variant="secondary" rounded-full` no canto superior direito da
  foto (ao lado do chip "Destaque"), com `relative z-10` para ficar acima do link esticado. Tooltip
  "Salvar nos favoritos"/"Remover dos favoritos"; `aria-pressed`.
- No detalhe: `Button variant="secondary"` ao lado do título, "Favoritar"/"Favoritado".
- Ícone `Heart`; favoritado `HeartFill text-danger` (o vermelho é a convenção do coração).
- Muda na hora (otimista); `toast.success`/`toast.danger` com o resultado. Visitante: o mesmo visual,
  como link para o login.

### Oferta no detalhe: `oferta-bloco.tsx`

Bloco "Quer negociar?" no topo do card lateral (acima do contato, separado por `Separator`), com
`Button primary fullWidth` "Fazer uma oferta" (`CircleDollar`), **só com o imóvel disponível**. Fora disso,
o cliente vê o aviso `rounded-xl bg-surface-secondary p-3 text-sm text-muted` "Este imóvel está reservado e
não recebe ofertas no momento." e o visitante não vê o bloco. Com oferta em aberto, no lugar do botão:
caixa `rounded-xl bg-surface-secondary p-3` com valor, status e link "Acompanhar em Minhas ofertas".
O formulário é um `FormularioModal` (negócio em `ToggleButtonGroup`, valor em `NumberField` BRL com o
preço anunciado na `Description`, mensagem opcional), botão "Enviar oferta" com `PaperPlane`.

### PDF: `pdf-visualizador.tsx`

`Modal size="lg"` alargado (`sm:max-w-5xl`) com `iframe h-[70dvh] rounded-lg border`. Rodapé: à
esquerda "Abrir em nova aba" e "Baixar" (`tertiary`, sempre visíveis: celular costuma não renderizar
PDF em iframe); à direita "Fechar" e a ação do contexto (ex.: `primary` "Assinar contrato").

### Busca principal: `imoveis-search.tsx`

`SearchField fullWidth` com `aria-label`; `SearchField.Group` com
`h-14 rounded-full px-2 text-base shadow-sm`; ícone `size-5 ml-3`; `ClearButton mr-2`.
Placeholder sugere o que pode ser buscado e termina com reticências (`…`). É o único campo
`rounded-full`: campos de formulário comuns seguem o `field-radius` do tema.

### Atributos com ícone: `imovel-atributos.tsx`

- `compacto` (card): `flex flex-wrap gap-x-4 gap-y-1.5 text-sm`, ícone `size-4 text-muted`,
  abreviado (`2 dorm.`, área principal).
- Completo (detalhe): grade `grid-cols-2 sm:grid-cols-3`, cada item em
  `rounded-xl bg-surface-secondary px-3 py-2.5` com ícone `size-5 text-accent`, por extenso
  e com plural correto (`1 vaga` / `2 vagas`).

### Filtros: `vitrine-filtros.tsx`, `filtro-select.tsx`

- Painel num `Card gap-5`, título "Filtros" e `Button ghost sm` "Limpar (n)" quando há filtro.
  Desktop: lateral `lg:sticky`. Celular: escondido, aberto pelo botão "Filtros (n)" da toolbar
  (`aria-expanded`/`aria-controls`).
- Escolha curta e exclusiva (negócio, dormitórios) → `ToggleButtonGroup` `selectionMode="single"`
  `disallowEmptySelection fullWidth size="sm"`, com uma opção neutra ("Todos", "Qualquer").
- Lista → `FiltroSelect` (HeroUI `Select` + `ListBox`), com a primeira opção "Todos"/"Todas"
  valendo `null`. Select dependente (bairro ← cidade) filtra as opções e fica desabilitado sem opções.
- Faixa de valor → dois `NumberField` com `formatOptions` BRL lado a lado num `fieldset`;
  o rótulo acompanha o contexto ("Preço" / "Aluguel mensal").
- Todo filtro aplica na hora (sem botão "Aplicar") e volta para a página 1.

### Toolbar e ordenação: `vitrine-toolbar.tsx`

Contagem à esquerda (`aria-live`); à direita, botão de filtros (só no celular) e
`FiltroSelect` "Ordenar por" (`w-48`, sem opção neutra).

### Paginação: `vitrine-paginacao.tsx`

HeroUI `Pagination`: resumo "Mostrando 13–24 de 57" à esquerda e controles à direita
(empilham no celular). Sempre a primeira página, a última e as vizinhas da atual, com `…` entre
elas. "Anterior"/"Próxima" só com ícone no celular. Some quando há 1 página. Trocar de página
rola para o topo; filtros não rolam.

### Painel e gráficos: `features/painel/components/`

```
[🏠 Imóveis disponíveis 24 de 31 ▬▬▬▬▬▬░░]  [$ Ofertas pendentes 7  (Pede ação)]  [📄 Aguardando assinatura 2]
┌ Imóveis por bairro ─────────────── 31 ┐  ┌ Ofertas por situação ──────── 23 ┐
│ Centro      ███████████████ 9         │  │  ▇    ▅    ▆    ▇    ▁          │
│ …                                     │  │ Pend. Esp. Ac. Rec. Canc.       │
└───────────────────────────────────────┘  │                                 │
┌ Imóveis por finalidade ────────── 31 ┐  │ [Em aberto | Decididas | Aceite] │
│ Residencial ███████████ 22 · 71%      │  │                                 │
└───────────────────────────────────────┘  └─────────────────────────────────┘
```

- **Layout**: indicadores em linha de 3 (`@2xl:grid-cols-3`). Abaixo, `@4xl:grid-cols-[1.2fr_1fr]`:
  à esquerda os gráficos de imóveis empilhados (bairro, finalidade); à direita "Ofertas por
  situação" na altura toda (`preencher`: o gráfico de colunas cresce com o card). No celular, tudo
  numa coluna.
- **Indicador** (`Indicador`): `Card p-0` com corpo `p-5` e rodapé-link separado por `border-t`
  ("Ver …" + `ArrowRight text-accent`, hover `bg-surface-secondary`). Ícone `size-5` num quadrado
  `size-10 rounded-xl bg-accent/15 text-accent`; rótulo `text-sm text-muted`; número `text-4xl
  font-semibold` com complemento menor ao lado ("de 31", "contratos"); apoio `text-sm text-muted`
  com contexto (reservados/vendidos, em espera, assinados). Opcional: medidor fino (`role="meter"`,
  `h-1.5`, trilho `bg-accent/15`, preenchimento `bg-grafico`) e chip `warning soft` "Pede ação".
- **Gráfico** (`GraficoBarras`, Recharts): **uma série**, sem legenda (o título diz o que é).
  - Cabeçalho: ícone no mesmo quadrado do indicador (`size-9`), título + descrição e, à direita, o
    total (`text-2xl font-semibold` + unidade `text-xs text-muted`). `rodape` opcional (resumo em
    `grid-cols-3 divide-x rounded-xl bg-surface-secondary`).
  - `forma="barras"` (horizontais, padrão): nomes longos ou muitas categorias; nome no eixo em uma
    linha, cortado com "…" (`TickNome`; o nome inteiro vai no tooltip). `forma="colunas"`: poucas
    categorias de nome curto (situação da oferta), com a linha de base. **Colunas viram barras
    horizontais quando o card tem menos de 24rem** (container query): cinco rótulos não cabem.
  - Barra sobre um **trilho** `--surface-secondary` que vai até o maior valor (`background` do
    `Bar`). Sem eixo de valores nem grade: o valor de cada barra fica na ponta (`--foreground`,
    `font-medium`, numa linha só via `LabelList` com `content` próprio). Parte do todo:
    `comPercentual` → "22 · 71%".
  - Barra de no máximo 24px, base quadrada e ponta arredondada (4px), mínimo 2px quando > 0;
    hover esmaece a barra (`activeBar`).
  - **Uma cor por barra** (`cor` do `ItemGrafico`, desenhada pelo `shape` do `Bar`), da paleta
    categórica `--grafico-1…8` + `--grafico-neutro` (`globals.css`, claro e escuro, validados com o
    validador de paletas do skill de dataviz). Regras:
    - bairros e finalidade: as cores seguem a **posição na tela**, na ordem 1→8 (a ordem validada
      para vizinhos), via `colorir()` em `painel/api.ts`. Com barras ordenadas por tamanho, cor por
      item poria pares parecidos lado a lado; e aqui nenhum item aparece em outro gráfico ou filtro;
    - situação da oferta (ordem fixa): cor com sentido, pendente azul (1), em espera amarelo (4),
      aceita aqua (3), recusada vermelho (8), cancelada neutro. Verde ao lado do amarelo falhou no
      escuro (daltonismo), por isso aceita é aqua;
    - "Outros", "Sem bairro", "Não informada" e "Cancelada": `--grafico-neutro` (não gastam cor);
    - amarelo, aqua e magenta ficam abaixo de 3:1 no claro: o valor escrito em cada barra e a
      tabela `sr-only` são obrigatórios, não enfeite. Nome e valor sempre visíveis: a cor nunca é
      o único jeito de identificar a barra;
    - sem `cor`, a barra usa `--color-grafico` (`chart-1`/`chart-2`), que também pinta o medidor
      do indicador. Texto nunca na cor da barra (o tooltip tem um traço da cor como chave).
  - Tooltip próprio (`bg-surface border shadow-lg rounded-xl`): valor em destaque, "% do total · nome"
    e "Clique para ver a lista" quando a barra leva à lista filtrada.
  - O SVG fica numa caixa de altura definida com o gráfico em `absolute inset-0` (o Recharts mede
    um tamanho estável). Sem animação (o painel rerenderiza a cada `refresh()`).
  - O SVG é `aria-hidden`; uma `<table className="sr-only">` traz os mesmos números.
  - Ordem: do maior para o menor; categorias com ordem natural (situação da oferta) mantêm o fluxo.
    Mais de 8 categorias: as 7 maiores + "Outros".
  - Vazio: caixa tracejada com uma frase; skeleton imita cards, barras e colunas.
- `PainelConteudo({ dados })` renderiza o painel sem buscar nada (útil para conferir o visual com
  dados de exemplo); `PainelSection` busca e trata erro.

### Sidebar: `area-sidebar.tsx`

- Logo no topo; chip "Admin" (`accent`) ao lado **só na área admin**. Itens agrupados em seções
  (admin: "Geral" e "Cadastros"), rótulo de seção `text-xs uppercase tracking-wide text-muted`.
- O destaque do item ativo depende de `usePathname()`: fica num `<Suspense>` com fallback do
  menu sem destaque (senão as rotas dinâmicas perdem a casca estática). O menu do celular fecha
  no clique do link.
- Item: `rounded-xl px-3 py-2 text-sm`, ícone `size-4`. Ativo: `bg-accent/15 font-medium` com
  ícone `text-accent` e `aria-current="page"`. Inativo: `text-muted`, hover
  `bg-surface-secondary text-foreground`.
- Rodapé (`mt-auto`): **bloco de perfil** (`perfil-bloco.tsx`):
  `rounded-2xl border bg-surface-secondary p-3`, `Avatar color="accent"` com iniciais, nome e
  e-mail com `truncate` (sem papel) e, embaixo, `Button variant="danger-soft" fullWidth` "Sair"
  dentro de `<form action={sair}>`.

### Login: `login-form.tsx`

- Mesmo padrão de formulário do contato (abaixo). Campos com `InputGroup`: ícone de prefixo
  (`Envelope` no e-mail, `Lock` na senha, `size-4 text-muted`) e botão `isIconOnly ghost` de mostrar/ocultar senha no sufixo (`Eye`/`EyeSlash`).
- Erros: por campo (`validationErrors`) para campo vazio/e-mail inválido; `Alert danger` para
  credenciais (texto da API) ou API fora; `Alert warning` para sessão expirada (`?motivo=expirado`).

### Cadastro: `cadastro-form.tsx`

- Mesmo card e padrão do login: nome (`Person`), e-mail (`Envelope`) e `CampoSenha` (o mesmo
  campo do login, com `Description` "De 6 a 72 caracteres."). Botão `primary fullWidth` com
  `PersonPlus` ("Criando conta…"). Rodapé `text-sm text-muted` com link `text-accent` para o
  login ("Já tem conta? Entrar"); o login tem o inverso ("Ainda não tem conta? Criar conta").
- E-mail repetido (409) aparece no campo e-mail; demais erros da API, nos campos ou no Alert.

### Formulário: `contato-form.tsx`

- HeroUI `Form` + `TextField` (`Label`, `Input`/`TextArea`, `FieldError`), `isRequired`,
  `type` e `autoComplete` certos. Erros do servidor vão em `validationErrors` e aparecem no campo.
- `maxLength` no campo com o limite da API (o usuário não consegue passar dele). Opcional se diz no
  rótulo ("Telefone (opcional)"). Regra que o usuário precisa saber antes (tamanho da senha) vai
  em `Description`, não só no erro.
- Mensagens do `400` da API são mostradas como chegam, no campo correspondente; o Alert geral diz
  "Confira os campos destacados." e lista o que não tem campo na tela.
- Envio por `onSubmit` + `startTransition(formAction)`, para o React não limpar o formulário
  quando o servidor devolve erro. Botão `primary fullWidth isPending` ("Enviando…").
- Falha geral → `Alert danger` acima do botão. Sucesso → o formulário dá lugar a uma
  confirmação (`CircleCheck text-success`, `role="status"`) com "Enviar outra mensagem".
- Mensagem já vem preenchida com o título e o código do imóvel.

### Cadastros do admin: `src/components/admin/`

```
Título da página (AreaCabecalho)
[busca (só usuários)] 6 bairros cadastrados              [+ Novo bairro]   ← ListaToolbar
┌────────────────────────────────────────────────────────────────────┐
│ Bairro      Cidade        Faixa de CEP              Ações          │   ← HeroUI Table
│ Centro      Panambi/RS    98280-000 a 98289-999      ✎  🗑          │
└────────────────────────────────────────────────────────────────────┘
Mostrando 1–20 de 57                         ‹ 1 2 3 ›                ← Paginacao (a mesma da vitrine)
```

- **Toolbar** (`ListaToolbar`): contagem `text-sm text-muted` com `aria-live` e plural certo
  ("1 bairro cadastrado" / "6 bairros cadastrados"); busca `SearchField` normal (não `rounded-full`,
  esse é só da vitrine) `w-full sm:max-w-sm`; botão `primary` "Novo …" com `Plus`, `w-full sm:w-auto`.
- **Tabela**: HeroUI `Table` > `ScrollContainer` > `Content` com `aria-label` e `min-w-[…]` (rola na
  horizontal no celular, não espreme). Primeira coluna `isRowHeader` em `font-medium`; dados de
  apoio `text-muted`; vazio não renderiza nada. "Ações" alinhada à direita (`text-end` + `justify-end`).
- **Ações de linha** (`AcaoIcone`): `Button isIconOnly size="sm" variant="ghost"` com `aria-label` e
  `Tooltip` do mesmo texto, que diz o registro ("Editar Centro"). Excluir com o ícone `text-danger`.
  Ação proibida (o admin na própria linha) fica `isDisabled` e o tooltip explica o motivo.
- **Linha de imóvel**: miniatura `h-12 w-16 rounded-lg` (capa ou `ImovelFotoPlaceholder` com ícone
  `size-5`), título `line-clamp-1` + `StarFill text-accent` se destaque, "Cód. N · Bairro, Cidade/UF"
  em `text-xs text-muted`; finalidade em `Chip secondary`, status em `StatusChip`.
- **Linha de usuário**: `Avatar size="sm"` com iniciais (`accent` para admin), chip `secondary` "Você"
  na própria linha, perfil em `Chip soft` (`accent` = Administrador, `default` = Cliente).
- **Formulário curto em modal** (`FormularioModal`): `Modal size="md" scroll="inside"`, título
  "Novo …"/"Editar …", campos HeroUI empilhados (`gap-4`; pares curtos lado a lado, ex.: Cidade +
  UF, CEP inicial + final). Rodapé: `tertiary` "Cancelar" + `primary` com `FloppyDisk`
  ("Cadastrar …" / "Salvar alterações", "Salvando…" com `isPending`). Erro geral em `Alert danger`
  no fim do corpo. Opcional se diz no rótulo ("Descrição (opcional)") ou na descrição do modal.
- **Filtro de status** (ofertas, contratos): `FiltroSelect` "Situação" (`w-full sm:w-52`) à esquerda da
  contagem, ligado a `?status=`; vazio com filtro oferece "Ver todas/todos".
- **Ação principal de linha** que o usuário precisa achar (cliente: "Ler e assinar") vira `Button size="sm"
  primary` com texto em vez de `AcaoIcone`.
- **Formulário longo em página** (imóvel): `max-w-4xl`, um `Card p-5 sm:p-6` por seção (Anúncio,
  Valores, Características, Localização) com `Card.Title text-base` + `Card.Description`, campos em
  `grid sm:grid-cols-2`. Link "← Imóveis" acima do título. Botões no fim, à direita
  (`flex-col-reverse` no celular: o principal fica em cima).
- **Campos**: dinheiro e números em `NumberField` (`formatOptions` BRL; área com "(m²)" no rótulo);
  relação em `Select` com opção neutra "Sem …"; enum (status do imóvel) em `Select`; texto livre com sugestões (finalidade) em
  `ComboBox allowsCustomValue`; liga/desliga em `Switch`; lista separada por vírgula em `TextArea`
  com `Description` explicando. Senha com mostrar/ocultar, como no login.
- **Confirmação** (`ConfirmarExclusao` / `ConfirmarAcao`; quando a ação já é "Cancelar …", o botão
  de desistir vira "Voltar" com `rotuloFechar`): `AlertDialog size="sm"`, ícone `danger`
  (excluir) ou `accent` (mudança sensível, ex.: trocar perfil). Título em pergunta ("Excluir
  bairro?"), corpo com o nome em `<strong className="text-foreground">`, a consequência e "Isso não
  pode ser desfeito.". Botões "Cancelar" (`tertiary`) e o da ação (`danger`/`primary`). Se a API
  recusar, o diálogo fica aberto com `Alert danger`.
- **Feedback de sucesso**: `toast.success("Bairro cadastrado.")` (região `bottom end`, em
  `providers.tsx`). Frase curta no particípio, com ponto final.
- **Estados**: skeleton = a mesma `Table` com 8 linhas de `Skeleton` (`TabelaSkeleton`) e toolbar
  com o botão desabilitado; erro = `ListaErro`; vazio = `ListaVazia` com a borda tracejada da área
  e uma ação (cadastrar, limpar busca, ir para a primeira página).

### Valores e campos nulos

- Moeda e área **só** via `formatCurrency` / `formatArea` (`src/lib/format.ts`; BRL sem
  centavos, `m²`).
- Campo `null` **não renderiza** nada: nada de "R$ 0", "—" ou "não informado" no card.
  Preço `0` vindo da API é tratado como `null` (`normalizar` em `features/imoveis/api.ts`).
- `Preco` (`preco.tsx`): `tamanho="lg"` (`text-2xl`) no card lateral do detalhe.
  (Em `Preco`, retorna `<span />` para manter o `justify-between` do rodapé.)
- Área: prefere `areaConstruida`, cai para `areaTotal`.
- Endereço montado por `formatEndereco` (`features/imoveis/utils.ts`):
  `Rua, nº — Bairro · Cidade/UF`.

---

## 7. Estados de tela

Toda tela que busca dados mostra os quatro estados abaixo. Referência:
`imoveis-section.tsx` e `imoveis-explorer.tsx`.

| Estado | Receita |
|---|---|
| **Carregando** | `<Suspense>` com skeleton que **imita o layout final**: mesmo grid, mesmas proporções (`aspect-[16/10]`, linhas de larguras variadas `w-3/4`, `w-1/2`…). Controles aparecem com `isDisabled`, não somem. 6 cards no skeleton. |
| **Erro** | `Alert status="danger"` composto: `Alert.Indicator`, `Alert.Content`, `Alert.Title` (o que falhou), `Alert.Description` (mensagem do `ApiError` + "Tente novamente em instantes."). Controles continuam visíveis, desabilitados. |
| **Vazio** | `EmptyState` centralizado (`flex flex-col items-center gap-2 py-16 text-center`): ícone `size-8 text-muted`, título `font-medium`, dica `text-sm text-muted` que **muda conforme o contexto** (com filtro: "Tente outros termos…" + botão "Limpar busca e filtros"; página inexistente: "Ir para a primeira página"; sem cadastro: "Ainda não há … cadastrados"). |
| **Recarregando** (filtro, página) | A tela atual fica, esmaecida (`opacity-50`, `aria-busy`), dentro de uma transição (`VitrineResultados`). Não volta ao skeleton. |
| **Não encontrado** (detalhe) | `notFound()` → `src/app/not-found.tsx` (EmptyState + link para a vitrine). |
| **Com dados** | Contagem acima do conteúdo (`text-sm text-muted`, `aria-live="polite"`, singular/plural corretos: "1 imóvel encontrado" / "N imóveis encontrados"). |

Esqueleto: `Skeleton` com `rounded-md` em linhas de texto e `rounded-none` na mídia.

---

## 8. Acessibilidade

- `<html lang="pt-BR">`.
- Campo sem rótulo visível → `aria-label` (ex.: "Buscar imóveis").
- Ícone decorativo → `aria-hidden`.
- Resultado que muda sem navegação → região `aria-live="polite"`.
- Filtro local com `useDeferredValue` para a digitação não travar.
- Componentes HeroUI (React Aria por baixo) já cuidam de foco e teclado: não substitua por
  `div` clicável.

---

## 9. Texto (UX copy)

- Tom direto, próximo e informal: "Encontre o imóvel certo **pra você**".
- Cards compactos com abreviações fixas: `dorm.`, `banh.`, `vagas`, `/mês`.
- Mensagem de erro = **o que aconteceu + o que fazer** ("Não foi possível carregar os
  imóveis" + "Tente novamente em instantes.").
- Valores vindos da API como texto livre (`finalidade`, `status`) são exibidos como chegam.

---

## 10. Não fazer

- Hex, `rgb()`, `oklch()` solto ou paleta crua do Tailwind em componentes.
- API do HeroUI v2/NextUI (`HeroUIProvider`, `tailwind.config`, `nextui-*`).
- CSS custom antes de tentar `variant` / `color` / `size`.
- Nome do produto escrito na UI.
- Componente pensado só para o modo claro (sombra/cor fixa que some no escuro).
- Ícones de outra biblioteca.
- Spinner de tela cheia no lugar de skeleton.

---

## 11. Pendências de design

- **Toggle claro/escuro**: CSS pronto, falta o controle na UI.
- **Otimização de imagens**: fotos servidas de `localhost` vão `unoptimized`; com host/CDN
  público, remover e configurar `images.remotePatterns`.
- **Filtros sem apoio da API**: filtragem local sobre a lista completa (cache de minutos).
- **`finalidade` e `status` são texto livre** na API: não há lista fechada para padronizar
  rótulos/cores além do mapa de status acima. Na base real os valores são "Residencial"/"Comercial"
  e "Disponível" (o formulário do admin sugere esses).
- **Gestão de fotos no admin**: falta a API listar as fotos com `id` (ver CLAUDE.md). Quando existir,
  seguir a galeria do detalhe (miniaturas `rounded-lg`, capa com `ring-2 ring-accent`).

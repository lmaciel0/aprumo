# Design system do Aprumo

Fonte da verdade: `frontend/src/index.css` (tokens) e os componentes de `frontend/src`. Este documento descreve o que existe; quando os dois divergirem, o código vence e o documento é corrigido. O teste `frontend/src/designSystemDoc.test.ts` confere que todo token `--cor-*` de `:root` tem exatamente uma linha na tabela de Cores, com o valor de `:root` na coluna Claro e o de `:root[data-tema='escuro']` na coluna Escuro (o do claro quando o escuro não redefine), e que a tabela de Presets bate com os blocos de preset do `index.css`. Texto fora dessas tabelas, como a coluna Uso e a prosa, não é conferido.

## Identidade

- Produto: Aprumo, finanças pessoais e notas. Tom calmo e direto, textos curtos em português do Brasil.
- Dois temas: claro (padrão, fundo creme `#f4ede0`, texto marinho e destaque coral) e escuro (fundo grafite `#141415` e destaque coral claro). O tema escuro liga com `data-tema='escuro'` no `<html>`.
- Três presets de cor de destaque (ver Presets). O destaque muda, o resto da paleta não.
- Superfícies sólidas com borda fina de 1 px. A profundidade vem de degraus de cor (`--cor-fundo`, `--cor-card`, `--cor-elevado`), não de desfoque, degradê entre matizes nem sombra colorida.
- Assinatura "fio de prumo": linha vertical de 2 px em `--cor-principal`, só no item ativo da navegação lateral, no mês atual do gráfico e na conta mais próxima de hoje.
- Só tokens `--cor-*`. Cor nunca é o único sinal: estado ativo, erro e pago também têm texto ou forma.

## Cores

Todos os tokens `--cor-*` de `:root`. A coluna "Claro" é o valor de `:root`; "Escuro" é o de `:root[data-tema='escuro']`. Em um preset, `--cor-principal`, `--cor-sobre-principal` e `--cor-principal-fundo` mudam (ver Presets); `--cor-principal-clara` e os tons de gráfico que dependem deles acompanham.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--cor-fundo` | `#f4ede0` | `#141415` | Fundo da página, o degrau mais baixo. |
| `--cor-card` | `#fbf7f0` | `#19191b` | Fundo de cards, campos e modais (`--superficie`). |
| `--cor-elevado` | `#ece3d3` | `#232325` | Superfície acima do card, como campo dentro de card ou item em foco. |
| `--cor-linha` | `#ded9d0` | `#2a2a2c` | Bordas, divisores e fundo dos esqueletos. |
| `--cor-texto` | `#14213d` | `#ededed` | Texto principal. |
| `--cor-secundario` | `#3a4459` | `#a1a1a6` | Texto de apoio, um degrau abaixo do principal. |
| `--cor-mutado` | `#5a6275` | `#8e8e94` | Texto secundário, rótulos, legendas. |
| `--cor-principal` | `#b83e31` | `#ff6b5b` | Tom do acento seguro como texto, link, borda, anel de foco e fio de prumo. |
| `--cor-principal-clara` | `color-mix(in srgb, var(--cor-principal) 45%, var(--cor-card))` | `color-mix(in srgb, var(--cor-principal) 45%, var(--cor-card))` | Variação suave do acento, misturada com o card. |
| `--cor-principal-fundo` | `#ff6b5b` | `#ff6b5b` | Acento vivo, só preenchimento, com `--cor-sobre-principal-fundo` por cima; nunca texto no claro (2,4:1 sobre o creme). |
| `--cor-sobre-principal` | `#f4ede0` | `#141415` | Texto e ícone sobre `--cor-principal`. |
| `--cor-sobre-principal-fundo` | `#14213d` | `#141415` | Texto e ícone sobre `--cor-principal-fundo`. |
| `--cor-sobre-principal-suave` | `#fbede9` | `#3a1a16` | Texto secundário sobre `--cor-principal` (card da sobra). |
| `--cor-sobre-imagem` | `#f4ede0` | `#f4ede0` | Texto e ícone sobre foto ou imagem com véu escuro, igual nos dois temas. |
| `--cor-positivo` | `#2e7d4f` | `#4cc38a` | Verde de receitas em barras e fundos (não em texto pequeno). |
| `--cor-positivo-texto` | `#1f6b3f` | `#5fd68f` | Verde para texto pequeno (4,5:1 sobre card, fundo e chip). |
| `--cor-negativo` | `#b42318` | `#e5484d` | Vermelho de despesas, bordas de erro e ações destrutivas em barras e fundos. |
| `--cor-negativo-texto` | `#a11d14` | `#ff8a80` | Vermelho para texto pequeno (4,5:1 sobre card, fundo e chip). |
| `--cor-sobre-negativo` | `#f4ede0` | `#141415` | Texto sobre `--cor-negativo` (ações destrutivas). |
| `--cor-sobre-positivo` | `#ffffff` | `#141415` | Texto sobre `--cor-positivo` (botões e selos de status positivo). |
| `--cor-erro-fundo` | `#f6dcd5` | `#2e1a1a` | Fundo de mensagem de erro. |
| `--cor-ok-fundo` | `#dcead9` | `#15261c` | Fundo de chip e aviso de sucesso. |
| `--cor-aviso-fundo` | `#f5e2b8` | `#2b2410` | Fundo de aviso. |
| `--cor-aviso-texto` | `#6b4e00` | `#f2c94c` | Texto de aviso sobre `--cor-aviso-fundo`. |
| `--cor-auth-campo-borda` | `#7d8496` | `#6e6e73` | Contorno dos campos de auth, 3:1 sobre o card (WCAG 1.4.11). |
| `--cor-grafico-receitas` | `#14213d` | `#a9b8d6` | Barras de receitas realizadas no gráfico do ano. |
| `--cor-grafico-despesas` | `var(--cor-principal-fundo)` | `var(--cor-principal-fundo)` | Barras de despesas realizadas no gráfico do ano. |
| `--cor-grafico-receitas-previstas` | `color-mix(in srgb, var(--cor-grafico-receitas) 40%, var(--cor-card))` | `color-mix(in srgb, var(--cor-grafico-receitas) 40%, var(--cor-card))` | Fundo das receitas previstas no gráfico do ano. |
| `--cor-grafico-despesas-previstas` | `color-mix(in srgb, var(--cor-grafico-despesas) 40%, var(--cor-card))` | `color-mix(in srgb, var(--cor-grafico-despesas) 40%, var(--cor-card))` | Fundo das despesas previstas no gráfico do ano. |
| `--cor-nota-vermelho` | `#c0392b` | `#ff8a8a` | Categoria de nota vermelha (4,5:1 sobre `--cor-card`). |
| `--cor-nota-laranja` | `#b45309` | `#fb9a4b` | Categoria de nota laranja. |
| `--cor-nota-amarelo` | `#8a6500` | `#f2c94c` | Categoria de nota amarela. |
| `--cor-nota-verde` | `#1f7a45` | `#5fd68f` | Categoria de nota verde. |
| `--cor-nota-azul` | `#1d5fbf` | `#60a5fa` | Categoria de nota azul. |
| `--cor-nota-roxo` | `#7c3aed` | `#a78bfa` | Categoria de nota roxa. |
| `--cor-nota-rosa` | `#be185d` | `#f472b6` | Categoria de nota rosa. |
| `--cor-nota-cinza` | `#5b5876` | `#9ca3af` | Categoria de nota cinza. |

Regras de uso:

- Texto pequeno de valor positivo ou negativo usa `--cor-positivo-texto` e `--cor-negativo-texto`; `--cor-positivo` e `--cor-negativo` ficam para barras e fundos.
- O par de contraste mínimo é 4,5:1 para texto e 3:1 para contornos de campo e componentes. `frontend/src/estilos.test.ts` confere contraste AA do texto nos temas claro e escuro, 3:1 em bordas de campo e no botão de tema, proíbe cor fixa em TSX e exige `prefers-reduced-motion`.
- Fundos de chip e aviso usam os tokens `*-fundo`, nunca cor fixa.

## Presets

Três presets de cor de destaque, escolhidos pelo usuário e aplicados com `data-preset` no `<html>`: `coral`, `musgo` e `ceu`. `coral` é o padrão e não tem bloco próprio: valem os tokens da tabela de Cores. `musgo` e `ceu` trocam só `--cor-principal`, `--cor-sobre-principal` e `--cor-principal-fundo`, em cada tema.

| Preset | Principal (claro) | Sobre principal (claro) | Fundo (claro) | Principal (escuro) | Sobre principal (escuro) | Fundo (escuro) |
|---|---|---|---|---|---|---|
| `coral` | `#b83e31` | `#f4ede0` | `#ff6b5b` | `#ff6b5b` | `#141415` | `#ff6b5b` |
| `musgo` | `#3f6b47` | `#f4ede0` | `#8db384` | `#9cc79f` | `#141415` | `#9cc79f` |
| `ceu` | `#245e86` | `#f4ede0` | `#7fb3d5` | `#8ec1e3` | `#141415` | `#8ec1e3` |

Todo componente novo precisa ficar legível nos três presets nos dois temas, o que só vale se ele usar tokens.

## Tipografia

- Fonte única: Inter Variable (`@fontsource-variable/inter`), declarada em `--font-sans` e no `html`, com `ui-sans-serif, system-ui, sans-serif` de reserva.
- Valores de dinheiro usam a classe `.valor` (`font-variant-numeric: tabular-nums`) para alinhar em coluna.
- Corpo no celular: campos de formulário com 16 px (menos que isso o iOS dá zoom ao focar); nenhum texto abaixo de 12 px em tela de auth. Rótulos e legendas pequenas usam 11 a 12 px com `--cor-mutado`.
- Título de página: `text-[28px] font-bold tracking-tight`. Número de destaque: 26 a 30 px em negrito (`CardSobra`, `FaixaSaldo`). Título do card de auth: 28 px, peso 500.

## Raio, superfícies e sombras

| Token | Valor | Uso |
|---|---|---|
| `--raio-card` | `14px` | Raio de `.card`, cards de nota e card da sobra. |
| `--superficie` | `var(--cor-card)` | Fundo sólido de `.superficie` e `.card`. |
| `--superficie-borda` | `var(--cor-linha)` | Borda de 1 px de `.superficie` e `.card`. |
| `--sombra-flutuante` | `0 1px 2px rgb(20 33 61 / 6%)` no claro; `none` no escuro | Sombra mínima de `.superficie` e `.card`. |
| `--sombra-elevada` | `0 8px 24px rgb(20 33 61 / 8%)` no claro; `inset 0 1px 0 rgb(255 255 255 / 6%)` no escuro | Só para o que flutua: dock, menu, modal e card de auth. |
| `--curva` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva única de toda animação e transição. |

- `.card`: superfície sólida com `--raio-card`, `padding: 1rem`, sem `backdrop-filter`. Cards compactos dentro de grades sobrescrevem o padding (`!p-3.5`).
- Escala de raio: tag 6 px, controle (campo e botão) 10 px, card 14 px, painel e folha de 16 a 20 px. Pílula (`rounded-full`) só em avatar, botão "Criar", ponto de status e interruptor de tema. O card de auth usa 18 px e seus campos e botão 10 px.
- Código antigo ainda usa `rounded-2xl`, `rounded-3xl` e `rounded-full` em chips e botões; a migração para a escala acontece por tela e não por esta tabela.

## Espaçamento e primeira dobra no celular

Resumo de `docs/superpowers/plans/2026-11-12-painel-espacamento-primeira-dobra.md` (medido em 360x640, tela inicial `/`):

- Entre blocos da tela, o espaço é um só (`gap-5`, 20 px). Um wrapper que pode renderizar vazio conta o `gap` duas vezes: o widget de meta devolve `null` sem metas, então ele recebe `className` e `style` e anima a própria `<section>`, sem `div` embrulhador.
- Não aninhar card dentro de card. O bloco "Finanças do mês" é uma `<section>` sem `.card`; os quatro cards de dentro são os cards. Isso devolve largura útil (296 px em vez de 262 px de 360). A mensagem de erro do bloco é a exceção: leva `.card` para não ficar solta sobre o fundo.
- A "Sobra do mês" deve caber inteira acima da dock inferior (que começa perto de y = 555 em 640 de altura). Resultado medido em produção: espaço de 20 px entre os blocos e sobra de y 383 a 530.
- O cabeçalho da frase do dia cabe em uma linha em 360 px: o subtítulo "Sabedoria diária" some abaixo de `sm` (`hidden sm:inline`). O `flex-wrap` do cabeçalho permanece, porque em 320 px o selo e os três botões somam mais que a área útil.
- A ordem dos blocos da tela inicial não muda sem pedido do dono.
- A dock flutuante cobre o fundo da tela: o conteúdo principal precisa ficar acima dela. Elementos fixos embaixo (como o aviso de saída em `frontend/src/App.tsx`) sobem `6.5rem + env(safe-area-inset-bottom)` no celular.

## Componentes existentes

Só o que existe hoje. Ícones: SVGs de `frontend/src/layout/icones.tsx` e componentes de `lucide-react` (Metas, Painel, Notas). Foco por teclado: `foco` de `frontend/src/layout/classesFoco.ts` (contorno de 2 px, deslocado 2 px, em `--cor-principal`).

### Genéricos (`frontend/src/componentes`)

- `Carregando`: dot-spinner de 8 pontos com `role="status"` e texto opcional; usa `--cor-principal`.
- `Esqueleto`: variantes `texto` (com `linhas`), `circulo` e `card`; classe `.esqueleto-shimmer`, `role="status"`, `aria-busy` e `rotuloAcessivel`.
- `ErroDeCarregamento`: fronteira de erro das páginas lazy; aviso com `role="alert"` e botão "Recarregar" dentro da moldura.
- `LimiteDeErro`: última barreira da aplicação; tela inteira com "Algo deu errado" e "Recarregar".

### Layout e navegação (`frontend/src/layout`)

- `AppShell`, `HeaderPrincipal`, `Sidebar` e `DockLateral` (desktop), `DockInferior` (celular, menos de 768 px).
- `DockInferior`: barra flutuante sólida (`rounded-2xl`, `--cor-card`, `--sombra-elevada`) com Início, Notas, Orçamento e Mais; o botão "Criar" é o único círculo, fica elevado no centro, usa `--cor-principal-fundo` e abre `FolhaAcaoRapida` (`AcaoRapida.tsx`). Só o item ativo mostra o rótulo (`.dock-rotulo`) e leva fundo `--cor-elevado`, sem fio de prumo.
- Item ativo de `Sidebar` e `DockLateral`: degrau `--cor-elevado` com texto `--cor-texto` em peso 500 e o fio de prumo (`shadow-[inset_2px_0_0_var(--cor-principal)]`), nunca bloco preenchido no acento.
- `CabecalhoPagina`: título (só para leitor de tela no celular), `SeletorMes` e atalho "+ Lançar" nas telas do mês.
- `PaletaNavegacao` ("Ir para...", Ctrl K), `AvisoServidor`, `Logo`, `useDialogoModal` (foco preso, Esc e rolagem travada).
- `BotaoTema` (`frontend/src/tema`): interruptor de tema com contraste não textual de 3:1.

### Formulários e autenticação (`frontend/src/auth`)

- `CampoTexto`: rótulo visível ligado ao `input`, `min-h-11`, `text-base`, borda `--cor-linha`.
- `MensagemDeErro`: `role="alert"`, borda `--cor-negativo`, fundo `--cor-erro-fundo`.
- `LayoutAuth`, `TelaAuth`, `BotaoGoogle`, `BotaoReenviar`; o visual das telas de auth vive em `.auth-card` no `index.css`.

### Padrões recorrentes por módulo (`frontend/src/paginas`)

- Painel (`painel`): `CardReflexao` (frase do dia), `AtalhosRapidosMobile` (grade de 4 atalhos configuráveis, `ModalPersonalizarAtalhos`), `FinancasDoMes`, `NotaFixada` (conteúdo somente leitura, caixinhas marcáveis).
- Visão geral (`inicio`): `CardSobra` (fundo `--cor-principal`), `CardsTotais` (cards compactos com chip de variação), `GraficoResultado` (cores `--cor-grafico-*` e tabela equivalente para leitor de tela), `OndeMaisGastou` (barras por categoria), `ProximasContas`, `ResumoCartoes`.
- Orçamento (`lancamentos`): `FaixaSaldo` (saldo grande no destaque), `ReceitasCard`, `GrupoCategoria` (linhas tocáveis, chip que alterna o status), `LancamentoForm` dentro de `Moldura` (tela cheia no celular, janela modal a partir de 768 px).
- Cartões (`cartoes`): `CardCartao` (visual `cartao-premium` em `CardCartao.css`), `EditorCartao`.
- Categorias (`categorias`): `LinhaCategoria`, `LinhaSubcategoria`, `SeletorCor` e `SeletorIcone` (paleta fixa em `paletaCores.ts`), `PaginacaoTabela`.
- Metas (`metas`): `CardMeta`, `WidgetMetaInicio`, `CardConselheiroMetas`, `ModalMetaForm` e `ModalAporteMeta` (folha que sobe de baixo no celular, centralizada a partir de `sm`).
- Notas (`notas`): `CartaoNota` (entrada escalonada `.nota-entra`), `FaixaCategorias` (chips de filtro), `NotaEditor` com `BarraFormatacao` (Tiptap), `nota-editor.css` e `nota-leitura.css`.
- Relatórios (`relatorios`): `TabelaAnual` (só o contêiner rola de lado, coluna Item fixa).
- Mais (`mais`): `MaisPage` (lista em cartão com divisores e seta à direita, `max-w-md`).
- Movimento: `.item-entra` e `.nota-entra` (fade com subida de 6 a 8 px, escalonados por `--i`), `.folha-painel`, `.dock-rotulo`, `.menu-painel`, `.paleta-entra`. Só cor, opacidade e transform animam, de 150 a 250 ms; tudo desliga em `prefers-reduced-motion`.

## Regras de 360 px

360 px é a largura de referência do celular; 320 px é o mínimo (`body { min-width: 320px }`). Confira toda tela nova em 360, 768 e 1280 px, nos dois temas.

- Nada de rolagem horizontal da página. Só um contêiner próprio pode rolar de lado (como em `TabelaAnual`). Texto longo usa `min-w-0` com `break-words`, `truncate` ou `line-clamp`.
- Alvo de toque de 44 px (`min-h-11`, `min-w-11` ou `size-11`) em todo botão, link e linha tocável.
- Barras de ação e cabeçalhos usam `flex-wrap` para quebrar em vez de cortar em 320 px.
- Largura útil conta: sem card dentro de card, sem padding duplicado, sem wrapper vazio com `gap`.
- O conteúdo principal precisa ficar acima da dock flutuante; elemento fixo embaixo sobe `6.5rem + env(safe-area-inset-bottom)` (o botão "Criar" elevado chega a 5 rem do fundo).
- Modal no celular é folha que sobe de baixo (`rounded-t-3xl`, `max-h-[92vh]`) ou tela cheia (`Moldura`); a partir de `sm` ou `md` vira janela centralizada.
- Texto de campo em 16 px, para não dar zoom no iOS.

## Acessibilidade

- Contraste: 4,5:1 para texto e 3:1 para contornos de campo e de componentes, nos dois temas e nos três presets. Texto pequeno em verde ou vermelho usa os tons `*-texto`.
- Foco visível em todo controle (`foco` de `classesFoco.ts` ou o equivalente com contorno de 2 px em `--cor-principal`); alvos de 44 px.
- Rótulo visível em campo (`CampoTexto`), `aria-label` em botão só de ícone, `role="alert"` em erro, `role="status"` em carregamento.
- Cor nunca é o único sinal: o item ativo da dock é um degrau elevado com texto (e, na lateral, o fio de prumo), o status pago tem chip com texto.
- Movimento: uma só curva (`--curva`); toda animação e transição respeita `prefers-reduced-motion`.
- Gráfico com tabela equivalente para leitor de tela (`GraficoResultado`); título de página único (`<h1>`), mesmo quando só leitor de tela o vê no celular.
- Modais prendem o foco, fecham com Esc e devolvem o foco ao elemento de origem (`useDialogoModal`, `Moldura`).

## Referências visuais

Interpretação a validar pelo Lucas. Ele citou cinco apps, sem prints e sem dizer o que gosta em cada um. As leituras abaixo são gerais e prováveis, não decisões.

- Netflix: conteúdo em destaque e poucas cores.
- Spotify: tema escuro e listas densas.
- Uber: preto e branco, ação primária única e rótulos curtos.
- Headspace: formas arredondadas, calma e ilustração.
- Cash App: números grandes e ação principal clara.

Estas referências não substituem os tokens existentes. Em conflito, o design system atual vence.

Perguntar ao Lucas o que ele gosta em cada app antes de redesenhar uma tela.

unslop, de Damir Sokolovsky (https://github.com/heydamir/unslop), CC BY 4.0

## O que NÃO fazer

Nasce das armadilhas registradas no projeto e das regras de 360 px.

- Não usar cor fixa (`bg-white`, `text-white`, `bg-[#...]`, `text-[#...]`): `estilos.test.ts` reprova. Use `--cor-*`.
- Não usar a paleta do Tailwind (`red-600`, `emerald-500`, `amber-*`, `from-black/80`) em tela nova. Hoje há desvios em `metas` (`CardMeta`, `MetasPage`, `ModalMetaForm`, `ModalAporteMeta`, `CardConselheiroMetas`, `WidgetMetaInicio`), em `CardCartao` e em um ponto de `CardReflexao`. São dívida a corrigir com os tokens `--cor-negativo`, `--cor-positivo` e `--cor-sobre-*`, não padrão a copiar.
- Não usar `--cor-positivo` e `--cor-negativo` em texto pequeno: use `--cor-positivo-texto` e `--cor-negativo-texto` (4,5:1).
- Não usar `backdrop-filter` nem `backdrop-blur`: `estilos.test.ts` reprova no `index.css` e em todo TSX de produção. Superfície que precisa esconder o que rola por baixo usa fundo sólido (`--cor-fundo` ou `--cor-card`).
- Não usar degradê entre matizes, brilho nem sombra colorida (como `shadow-[0_8px_18px_color-mix(... --cor-principal ...)]`).
- Não usar peso 700 a 900 em título ou rótulo novo; use 500 ou 600.
- Não usar caixa-alta com tracking em rótulo (`uppercase tracking-wider`).
- Não usar `--cor-principal-fundo` como texto nem como linha fina: ele é só preenchimento (2,4:1 sobre o creme). Texto e linha usam `--cor-principal`.
- Valor negativo vai na cor do texto com o sinal "−"; vermelho (`--cor-negativo`, `--cor-negativo-texto`) só em status e alerta.
- Não trocar paleta, fonte ou presets por sugestão de ferramenta (`ui-ux-pro-max`, 21st) sem o Lucas pedir. O resultado delas é referência; este documento vence.
- Não instalar HeroUI, shadcn, framer-motion nem 21st como dependência. Código de referência do 21st é só inspiração de estrutura, reescrito com os tokens.
- Não animar `width`, `height` nem `top`. Só cor, opacidade e transform, de 150 a 250 ms, e sempre com `prefers-reduced-motion`.
- Não usar `dangerouslySetInnerHTML`. O conteúdo de nota é JSON do Tiptap e se alinha com a lista permitida do backend (`ConteudoNota`).
- Não deixar botão, link ou linha tocável com menos de 44 px (`min-h-11`) nem sem foco visível.
- Não pôr card dentro de card nem wrapper vazio com `gap`: em 360 px isso custa largura útil e dobra o espaço entre blocos.
- Não deixar a tela inicial com a "Sobra do mês" parcialmente atrás da dock inferior em 360x640.
- Não deixar a página rolar de lado em 320 px. Pendência conhecida: a tela inicial e `/financeiro` rolam na horizontal por causa de `<table className="sr-only">` em `frontend/src/paginas/inicio/GraficoResultado.tsx` (a tabela ignora `width: 1px`). A correção sugerida é embrulhar a tabela em `<div className="sr-only">`; precisa de "ok" do dono e PR próprio. Não replicar esse padrão.
- Não usar `sr-only` solto sem um ancestral posicionado (`relative`): o texto é absoluto e alarga a página, como `TabelaAnual` já previne.
- Não usar emoji como ícone: use os SVGs de `layout/icones.tsx` ou `lucide-react`.
- Não dar a campo de formulário menos de 16 px de texto (zoom no iOS) nem tirar o rótulo visível.
- Não confiar só em cor para indicar estado (ativo, pago, erro): inclua texto ou forma.
- Não redesenhar tela com base nas referências visuais antes de perguntar ao Lucas o que ele gosta em cada app.

# Visual sem cara de IA — Fase 2 (limpeza nos componentes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tirar dos componentes os sinais de "UI de IA" que a fase 1 (tokens) não alcança: formato de número, pesos 700-900, caixa-alta, pílulas, `transition-all`/`hover:scale`, coral espalhado e copy com "!", emoji e saudação.

**Architecture:** Varredura por tipo de sinal, um task por sinal. Cada task acrescenta a `frontend/src/estilos.test.ts` (ou ao teste do módulo) uma regra que proíbe o sinal nos TSX de produção, com uma lista de exceção para os arquivos que as fases 3 e 4 reescrevem. Os componentes só trocam classes e textos; nenhuma prop, rota ou dado muda.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-visual-sem-cara-de-ia-design.md` (seções Tipo, Superfície/raio, Movimento, Copy, Semânticos, Fases)

## Global Constraints

- Ler `docs/DESIGN_SYSTEM.md` antes de qualquer tela; ele vence escolhas de skill.
- Arquivos fora desta fase (fases 3 e 4), não tocar: `paginas/metas/**`, `paginas/cartoes/CardCartao.tsx`, `paginas/cartoes/CardCartao.css`, `paginas/painel/CardReflexao.tsx`, `paginas/lancamentos/FaixaSaldo.tsx`, `paginas/lancamentos/ReceitasCard.tsx`, `paginas/inicio/GraficoResultado.tsx` (só o formato de número da Task 1 entra nele). Todo teste de varredura desta fase usa esta lista como `EXCECOES_FASE_3_4`.
- Pesos: 400 e 500; 600 (`font-semibold`) só para ênfase rara. Proibidos `font-bold`, `font-extrabold`, `font-black` e `font-weight` 700 a 900.
- Sem `uppercase` com tracking; rótulo em sentence case; `tracking-tight` só em texto de 28 px ou mais; tracking 0 abaixo de 16 px.
- Raio: tag e chip 6 px (`rounded-md`), botão, campo, linha e botão só de ícone 10 px (`rounded-[10px]`), card `rounded-[var(--raio-card)]`, folha e modal 16 a 20 px (`rounded-2xl` = 16, `rounded-t-[20px]` na folha do celular). `rounded-full` só em: avatar, ponto de status, trilho e barra de progresso, botão "Criar" da dock, interruptor de tema e spinner.
- Movimento: sem `transition-all`; propriedades nomeadas (`transition-colors`, `transition-[transform,opacity]`, `transition-opacity`); sem `hover:scale-*` nem `hover:-translate-*`; toque pode usar `active:scale-[0.98]`; `animate-pulse` só em carregamento. `motion-reduce` continua respeitado.
- Acento: `--cor-principal-fundo` + `--cor-sobre-principal-fundo` só na ação principal de cada tela; seleção em grupo (chip de filtro, segmentado) é `bg-[var(--cor-texto)] text-[var(--cor-fundo)]`; avatar é `bg-[var(--cor-elevado)] text-[var(--cor-texto)]`; marca do logo é `bg-[var(--cor-principal-fundo)] text-[var(--cor-sobre-principal-fundo)]` com peso 600; texto, ícone, link e borda de destaque continuam `--cor-principal`.
- Número: um formato. Negativo `−R$ 1.234,56` (U+2212 colado no `R$`, sem espaço); abreviação `−2,5 mil` (vírgula decimal, nunca `k`). Bom e ruim em número ficam na cor do texto (ou secundário), com sinal e seta lucide (`ArrowUp`/`ArrowDown`, 12 px); verde e vermelho só em status (pago, recebido, atrasada, erro, ação destrutiva).
- Copy: sem "!" em texto de interface, sem emoji, rótulo curto sem ponto final.
- Código de front escrito pelo agent `frontend-developer`. Comandos em `frontend/`: `npx vitest run <arquivo>`, `npm run build`, `npx oxlint src` (o `npm run lint` tem um erro de parse de saída que já existia).
- Alvo de 44 px, foco visível e regras de 360 px intactos.

## Review Focus

1. Valor zero e valores de 1 centavo: `formatarMoeda(0)` sem sinal, `−R$ 0,01` com sinal (Task 1).
2. Mês com déficit no gráfico e no tooltip continua legível sem vermelho: o sinal "−" e a seta dizem que é ruim (Task 1).
3. Rótulo que era caixa-alta por CSS e tem texto-fonte em caixa-alta ou estranho ("FINANCEIRO" escrito assim no código): vira sentence case de verdade, não só perde a classe (Task 2).
4. Botão só de ícone que deixou de ser círculo mantém 44 px de alvo e o foco visível (Task 3).
5. Tela sem nenhuma ação principal coral e tela com duas: cada tela tem no máximo uma (Task 5).

---

### Task 1: Formato de número e bom/ruim neutro

**Files:**
- Modify: `frontend/src/formato/moeda.ts` (`formatarMoeda`), `frontend/src/paginas/inicio/valores.ts` (`formatarComSinal`, `resultadoCurto`, e qualquer outro formatador de sinal do arquivo)
- Modify: componentes que pintam número bom/ruim de verde/vermelho: `paginas/inicio/CardsTotais.tsx` (chip de variação), `paginas/inicio/BarrasDoResultado.tsx`, `paginas/inicio/TooltipResultado.tsx`, `paginas/inicio/GraficoResultado.tsx` (só cor/sinal dos rótulos de resultado), `frontend/src/index.css` (`.diferenca-negativa`); procurar outros com `grep -rn "cor-negativo-texto\|cor-positivo-texto" src --include=*.tsx` e manter só os de status
- Test: `formato/moeda.test.ts`, `paginas/inicio/valores.test.ts`, testes dos componentes acima, `estilos.test.ts` (`celula_paga_e_diferenca_negativa...`)

**Interfaces:**
- Produces: `formatarMoeda(valor: string | number): string` devolve `−R$ 1.234,56` para negativo (U+2212, sem espaço) e nunca `-R$`; `formatarComSinal(valor: string): string` igual; `resultadoCurto(resultado: number, compacto: boolean): string` devolve `−2,5 mil` / `+80` / `0` e ignora `compacto` para o sufixo (sempre ` mil`; `compacto` pode só encurtar casas, decisão do implementador, mas nunca `k`).

- [ ] **Step 1: Testes que falham**

```ts
expect(formatarMoeda(-636.59)).toBe('−R$ 636,59')
expect(formatarMoeda(0)).toBe('R$ 0,00')
expect(formatarComSinal('-0.01')).toBe('−R$ 0,01')
expect(resultadoCurto(-2500, false)).toBe('−2,5 mil'); expect(resultadoCurto(-2500, true)).not.toMatch(/k$/)
expect(resultadoCurto(-2500, true)).toMatch(/,/)  // vírgula decimal
```

Nos componentes: variação ruim em `CardsTotais` não tem classe com `cor-negativo` nem `cor-erro-fundo`, tem o texto com sinal e um ícone `aria-hidden`; rótulo de mês com déficit no gráfico/tooltip não usa `--cor-negativo*`. `.diferenca-negativa` usa `var(--cor-texto)` (o teste de `estilos.test.ts` muda; `.celula-paga` continua verde, é status).

- [ ] **Step 2:** `npx vitest run src/formato src/paginas/inicio src/estilos.test.ts` → FAIL.
- [ ] **Step 3:** Implementar. Ajustar asserções de outras suítes que esperavam `-R$`/`− R$`/`k` (listar no relatório).
- [ ] **Step 4:** Mesmo comando e depois `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(visual): um formato de número e bom/ruim neutro com sinal e seta`.

---

### Task 2: Pesos, caixa-alta e tracking

**Files:**
- Modify: todo TSX de produção fora de `EXCECOES_FASE_3_4` que tenha `font-bold|font-extrabold|font-black|uppercase|tracking-(wide|wider|widest)` ou `tracking-tight` em texto menor que 28 px (hoje cerca de 46 arquivos; `grep -rlE ... src --include=*.tsx`), inclusive `layout/Logo.tsx`, `layout/DockLateral.tsx`, `layout/Sidebar.tsx`, `paginas/painel/PainelPage.tsx`, `paginas/mais/MaisPage.tsx`, `paginas/relatorios/TabelaAnual.tsx`, `preferencias/PreferenciasModal.tsx`, `paginas/categorias/*`, `paginas/painel/AtalhosRapidosMobile.tsx`
- Modify: `docs/DESIGN_SYSTEM.md` seção Tipografia (título de página `text-[28px] font-medium`; número de destaque 28 a 32 px `font-medium`; pesos permitidos)
- Test: `frontend/src/estilos.test.ts` (novo describe `tipografia`)

**Interfaces:**
- Produces: `EXCECOES_FASE_3_4: string[]` exportado de um helper de teste `frontend/src/teste/varredura.ts` com `tsxDeProducao(): string[]` (movido de `estilos.test.ts`) e `infratores(regex: RegExp, excecoes?: string[]): string[]`; as Tasks 3, 4 e 5 usam os mesmos.

Mapeamento: `font-black`/`font-extrabold`/`font-bold` → `font-medium` em título e número; `font-semibold` só onde a linha precisa de uma ênfase (o resto fica `font-medium` ou normal). Rótulo com `uppercase` perde a classe e o tracking, e o texto-fonte vira sentence case ("Financeiro", "Reflexão do dia", "Preset de cor", "Modo do tema").

- [ ] **Step 1: Testes que falham** — `infratores(/font-(bold|extrabold|black)\b/, EXCECOES_FASE_3_4)` é `[]`; idem `/\buppercase\b/` e `/tracking-(wide|wider|widest)\b/`; `index.css` sem `font-weight:\s*(700|800|900|bold)`.
- [ ] **Step 2:** `npx vitest run src/estilos.test.ts` → FAIL (lista de arquivos).
- [ ] **Step 3:** Trocar as classes e os textos. Testes de componente que procuram texto em caixa-alta ou a classe antiga mudam junto.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Atualizar a seção Tipografia do `DESIGN_SYSTEM.md`; `npx vitest run src/designSystemDoc.test.ts` → PASS.
- [ ] **Step 6:** Commit `feat(visual): pesos 400 a 600 e rótulos em sentence case`.

---

### Task 3: Raios por tamanho, menos pílula

**Files:**
- Modify: TSX de produção fora de `EXCECOES_FASE_3_4` com `rounded-full`, `rounded-2xl`, `rounded-3xl`, `rounded-t-3xl` ou `rounded-[2x/3xpx]` que não sejam do tipo permitido (Global Constraints), por exemplo botões "+ Lançar", "+ Novo cartão", busca do cabeçalho, chips de filtro, botões só de ícone, `SeletorMes`, folhas do celular, `MaisPage`, `PreferenciasModal`
- Modify: `docs/DESIGN_SYSTEM.md` "Raio, superfícies e sombras" (lista de outros raios em uso) e "Regras de 360 px" (folha `rounded-t-[20px]`)
- Test: `frontend/src/estilos.test.ts` (describe `raios`)

- [ ] **Step 1: Testes que falham** — `infratores(/rounded-(3xl|t-3xl)\b/, EXCECOES_FASE_3_4)` é `[]`; e, para `rounded-full`, uma lista explícita `PILULAS_PERMITIDAS` (arquivo e motivo: avatar, ponto, trilho de progresso, Criar, spinner) contra a qual se compara `infratores(/rounded-full/, [...EXCECOES_FASE_3_4, ...PILULAS_PERMITIDAS.map(p => p.arquivo)])`, que deve ser `[]`. Em arquivo com uso misto (pílula permitida e não permitida), o teste de componente daquele arquivo confere a classe do elemento não permitido.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Trocar raios. Botões e campos `rounded-[10px]`; chips e tags `rounded-md`; cards `rounded-[var(--raio-card)]`; modal `rounded-2xl`; folha `rounded-t-[20px]`. Raio interno = externo − padding, mínimo 4.
- [ ] **Step 4:** `npx vitest run` → PASS; atualizar o documento; `designSystemDoc` → PASS.
- [ ] **Step 5:** Commit `feat(visual): raios por tamanho e pílula só onde é forma`.

---

### Task 4: Movimento

**Files:**
- Modify: TSX de produção fora de `EXCECOES_FASE_3_4` com `transition-all`, `hover:scale-*`, `hover:-translate-*`, `hover:translate-*` ou `animate-pulse` fora de carregamento (hoje `layout/DockLateral.tsx`, `layout/HeaderPrincipal.tsx`, `paginas/categorias/*`, `paginas/painel/ModalPersonalizarAtalhos.tsx`, `paginas/notas/NotaPage.tsx`, `paginas/notas/NotasPage.tsx`, `paginas/painel/NotaFixada.tsx`, `preferencias/PreferenciasModal.tsx`)
- Test: `frontend/src/estilos.test.ts` (describe `movimento`)

- [ ] **Step 1: Testes que falham** — `infratores(/transition-all\b/, EXCECOES_FASE_3_4)`, `infratores(/hover:-?(scale|translate)/, EXCECOES_FASE_3_4)` vazios; `animate-pulse` só em elementos com `role="status"` ou `aria-busy` (teste do componente de notas que o usa).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Nomear as transições pelo que de fato muda; tirar escala/deslocamento no hover; `animate-pulse` decorativo sai.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(visual): transições nomeadas, sem escala no hover`.

---

### Task 5: Acento só onde manda

**Files:**
- Modify: os cerca de 36 TSX com `bg-[var(--cor-principal)]` fora de `EXCECOES_FASE_3_4` (`grep -rln "bg-\[var(--cor-principal)\]" src --include=*.tsx`)
- Modify: `docs/DESIGN_SYSTEM.md` (regra de uso do acento: ação principal, seleção, avatar, logo)
- Test: testes dos componentes tocados

**Interfaces:**
- Consumes: `--cor-principal-fundo`, `--cor-sobre-principal-fundo`, `--cor-elevado`, `--cor-texto`, `--cor-fundo`.

Regra por caso (Global Constraints): ação principal de cada tela (por exemplo "+ Lançar" de `CabecalhoPagina`, "Salvar" de formulário, "Criar primeira meta" fica para a fase 4) → `bg-[var(--cor-principal-fundo)] text-[var(--cor-sobre-principal-fundo)]`; ações secundárias → `bg-[var(--cor-elevado)] text-[var(--cor-texto)] border border-[var(--cor-linha)]`; chip/segmentado selecionado → `bg-[var(--cor-texto)] text-[var(--cor-fundo)]`; avatar → `bg-[var(--cor-elevado)] text-[var(--cor-texto)]`; marca do logo → coral vivo; botão destrutivo continua `--cor-negativo`. Em tela com duas ações principais coral, a segunda vira secundária ("+ Novo cartão" e "+ Lançar" em Cartões: "+ Lançar" é a principal).

- [ ] **Step 1: Testes que falham** — por componente: o botão principal tem `bg-[var(--cor-principal-fundo)]`; o avatar tem `bg-[var(--cor-elevado)]`; o chip selecionado tem `bg-[var(--cor-texto)]`; e `infratores(/bg-\[var\(--cor-principal\)\]/, EXCECOES_FASE_3_4)` só lista os casos que ficaram de propósito, registrados numa lista `ACENTO_ESCURO_PERMITIDO` com o motivo.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Trocar por caso.
- [ ] **Step 4:** `npx vitest run` → PASS; documento atualizado; `designSystemDoc` → PASS.
- [ ] **Step 5:** Commit `feat(visual): coral só na ação principal; seleção, avatar e logo sem acento espalhado`.

---

### Task 6: Copy, saudação e página offline

**Files:**
- Modify: `paginas/painel/PainelPage.tsx` e `paginas/painel/saudacao.ts` (saudação vira título do mês)
- Modify: `paginas/painel/CardReflexao.tsx` só a string `'Copiado!'` (a fase 3 reescreve o resto)
- Modify: `frontend/public/offline.html` (cores e pesos na paleta nova: fundo `#F4EDE0`, texto `#14213D`, botão coral `#FF6B5B` com texto `#14213D`; escuro via `prefers-color-scheme: dark` com `#141415`/`#EDEDED`; peso máximo 600; sem roxo)
- Test: `paginas/painel/PainelPage.test.tsx` (ou o teste existente da página), `paginas/painel/saudacao.test.ts`, teste de `offline.html` se existir

**Interfaces:**
- Produces: `tituloDoMes(data: Date): string` em `saudacao.ts` (renomear o arquivo para `cabecalhoPainel.ts` é opcional) devolvendo `Novembro de 2026` para 2026-11-20; `saudacao` e `primeiroNome` saem se ficarem sem uso.

- [ ] **Step 1: Testes que falham** — o `<h1>` do painel é `Novembro de 2026` (data fixa 2026-11-20), em `font-medium`, sem "Bom dia/Boa tarde/Boa noite" e sem o nome; abaixo, a data por extenso em `--cor-secundario`; `tituloDoMes` com mês em maiúscula inicial; o `title` do botão de copiar é `Copiado` sem "!"; `offline.html` não contém `#27187E` nem `font-weight: 700|800|900`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(painel): título do mês no lugar da saudação; copy sem exclamação`.

---

### Fechamento da fase

- [ ] `npx vitest run`, `npx oxlint src`, `npm run build` em `frontend/` verdes.
- [ ] Gate visual com a API falsa local (mesmas rotas e larguras da fase 1) e `ui-ux-designer` + `accessibility-auditor`; correções pelo `frontend-developer`.
- [ ] `code-reviewer` no diff da branch; PR; merge.

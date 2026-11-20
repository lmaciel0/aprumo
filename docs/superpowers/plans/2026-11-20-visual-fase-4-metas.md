# Visual sem cara de IA — Fase 4 (Metas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pagar a dívida visual de Metas: tirar a paleta crua do Tailwind, os degradês coloridos e as regras da fase 2 que Metas ainda descumpre, e zerar `EXCECOES_FASE_3_4` para que as varreduras valham no app inteiro.

**Architecture:** Três tasks por área de Metas (card e widget, página e conselheiro, modais). A foto da meta é o momento do card: fica, com véu neutro escuro; o tom do preset deixa de pintar o card. A última task remove `paginas/metas/` da exceção e apaga a constante.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-visual-sem-cara-de-ia-design.md` (Fases item 4; Semânticos; Tipo; Superfície e raio; Movimento; Copy)

## Global Constraints

- Regras da fase 2 valem: pesos 400-600; sem caixa-alta; raio por tamanho (folha `rounded-t-[20px]`, modal `rounded-2xl`, botão `rounded-[10px]`, chip `rounded-md`; pílula só em trilho/barra de progresso e ponto); transições nomeadas, sem `hover:scale`; número `−R$ 1.234,56`; coral (`--cor-principal-fundo`) só na ação principal da tela ("Nova meta"; no modal, o botão de confirmar).
- Sem `emerald-*`, `sky-*`, `amber-*`, `red-*`, `blue-*`, `black/*`, `white/*` em classe. Status usa tokens: concluída/ok `--cor-positivo` com `--cor-sobre-positivo` (preenchido) ou `--cor-positivo-texto` sobre `--cor-ok-fundo` (chip); erro `--cor-negativo-texto` sobre `--cor-erro-fundo`, borda `--cor-negativo`; aviso `--cor-aviso-texto` sobre `--cor-aviso-fundo`.
- Véu sobre foto: `linear-gradient` de `rgb(0 0 0 / 0%)` a `rgb(0 0 0 / 65%)` via estilo inline ou classe `veu-foto` no `index.css` (não é degradê de matiz; é sombra para o texto). Texto e ícone sobre a foto: `--cor-sobre-imagem`.
- Barra de progresso de meta: trilho `--cor-elevado`, barra `--cor-grafico-receitas` (dinheiro guardado); meta concluída: barra `--cor-positivo`.
- Copy sem "!" e sem emoji ("Objetivo alcançado", "…férias ou reformas", "Concluída").
- Código pelo `frontend-developer`; comandos em `frontend/`: `npx vitest run`, `npm run build`, `npx oxlint src`. Ler `docs/DESIGN_SYSTEM.md` antes.

## Review Focus

1. Meta personalizada sem foto: o card não fica sem hero nem com texto ilegível (Task 1).
2. Meta com valor guardado acima do alvo (mais de 100%): barra limitada a 100% e texto coerente (Task 1).
3. Erro de validação no formulário de meta e no aporte em tema escuro: mensagem legível com os tokens de erro (Task 3).
4. Folha do celular com teclado aberto em 360 px: botão de confirmar alcançável (Task 3).
5. Tela de Metas vazia: ícone e texto sem ✨ nem "!", ação "Criar primeira meta" é a ação principal coral (Task 2).

---

### Task 1: Card de meta e widget da tela inicial

**Files:**
- Modify: `frontend/src/paginas/metas/CardMeta.tsx`, `frontend/src/paginas/metas/WidgetMetaInicio.tsx`, `frontend/src/paginas/metas/presetsVisuais.ts` (só se os campos de cor do preset deixarem de ser usados na UI; manter se a API ou o formulário personalizado os usarem)
- Modify: `frontend/src/index.css` (classe `.veu-foto`, se escolhida)
- Test: `CardMeta.test.tsx`, `WidgetMetaInicio.test.tsx`

Visual: hero do card = foto com véu neutro, título em `--cor-sobre-imagem` `font-medium`; sem tinta colorida do preset sobre a foto; meta personalizada sem foto usa como fundo do hero a cor escolhida pelo usuário (conteúdo dele) com véu, ou `--cor-elevado` se não houver cor. Selo da categoria do preset: chip `rounded-md` `bg-[var(--cor-card)]/90 text-[var(--cor-texto)]`, sem coral. Selo "Concluída": chip de status ok com ícone `Check` 12 px. Lápis de editar: botão só de ícone `size-11 rounded-[10px]` sobre véu, ícone `--cor-sobre-imagem`. Números `font-medium`. Barra pela regra global. "Guardar" é ação secundária (`--cor-elevado`, borda `--cor-linha`, texto `--cor-texto`); "Resgatar" é botão de texto `--cor-secundario` com hover `--cor-elevado`. Valor mensal sugerido em `--cor-secundario` (sem coral). Widget da tela inicial: ícone em tile `--cor-elevado` com ícone `--cor-texto` (sem degradê), barra pela regra, percentual `--cor-secundario`.

- [ ] **Step 1:** Testes que falham: nenhuma classe com `emerald|sky|amber|red|black/|white/|gradient` nos dois arquivos; título com `text-[var(--cor-sobre-imagem)]` e `font-medium`; barra com `--cor-grafico-receitas` (ou `--cor-positivo` se concluída) e largura máxima 100% quando guardado > alvo; "Guardar" sem `--cor-principal-fundo`; selo "Concluída" com `--cor-ok-fundo`; meta personalizada sem foto renderiza hero com texto legível.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(metas): card de meta com foto e véu neutro, status em tokens`.

---

### Task 2: Página de Metas e conselheiro

**Files:**
- Modify: `frontend/src/paginas/metas/MetasPage.tsx`, `frontend/src/paginas/metas/CardConselheiroMetas.tsx`, `frontend/src/paginas/metas/iconesMeta.tsx` (se precisar do ícone novo)
- Test: `MetasPage.test.tsx`, `CardConselheiroMetas.test.tsx`

Visual: título da página `text-[28px] font-medium` (sem ícone em tile colorido ao lado, ou ícone `--cor-secundario` sem tile); três totais como cards de número (rótulo `--cor-secundario`, número `font-medium`), sem tiles de ícone coloridos (verde/azul/âmbar); estado vazio com ícone lucide `PiggyBank` 24 px em `--cor-mutado`, sem tile verde, texto sem "!"; "Nova meta" e "Criar primeira meta" com `--cor-principal-fundo` (só uma visível por vez). Conselheiro: `card` neutro, ícone `--cor-secundario` sem tile colorido, sem degradê, mensagens de status com os tokens de aviso/ok.

- [ ] **Step 1:** Testes que falham: sem paleta crua/degradê nos dois arquivos; estado vazio sem "!" e com o ícone `PiggyBank` (por `data-icone` ou `aria-hidden` + classe `lucide-piggy-bank`); só um botão com `--cor-principal-fundo` por estado da tela.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(metas): página e conselheiro sem cor crua`.

---

### Task 3: Modais de meta e aporte; fim das exceções

**Files:**
- Modify: `frontend/src/paginas/metas/ModalMetaForm.tsx`, `frontend/src/paginas/metas/ModalAporteMeta.tsx`
- Modify: `frontend/src/teste/varredura.ts` (remover `EXCECOES_FASE_3_4` e seus usos, ou deixá-la vazia e apagá-la), `frontend/src/estilos.test.ts`
- Modify: `docs/DESIGN_SYSTEM.md` (remover de "O que NÃO fazer" a nota de dívida em `metas`, `CardCartao` e `CardReflexao`; registrar o véu sobre foto)
- Test: `ModalMetaForm.test.tsx`, `ModalAporteMeta.test.tsx`, `estilos.test.ts`

Visual: folha `rounded-t-[20px]` no celular, `rounded-2xl` a partir de `sm`; campos pelo padrão de `CampoTexto` (raio 10, borda `--cor-linha`, texto 16 px); seleção de preset como chips/cartões com seleção invertida (`--cor-texto`/`--cor-fundo`) ou borda `--cor-principal` 2 px, sem degradê no ícone; botão confirmar `--cor-principal-fundo`; cancelar secundário; erros com tokens de erro; valores com `formatarMoeda`.

- [ ] **Step 1:** Testes que falham: `EXCECOES_FASE_3_4` não existe mais (ou está vazia) e todas as varreduras de `estilos.test.ts` passam sem exceção no app inteiro; os modais sem paleta crua, sem `rounded-t-3xl`, erro com `--cor-erro-fundo`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar; atualizar o documento. **Step 4:** `npx vitest run` e `npx vitest run src/designSystemDoc.test.ts` → PASS.
- [ ] **Step 5:** Commit `feat(metas): modais nos tokens e fim das exceções de varredura`.

---

### Fechamento da fase

- [ ] `npx vitest run`, `npx oxlint src`, `npm run build` verdes.
- [ ] Gate visual com a API falsa (`/metas`, `/` com widget, modal de nova meta e de aporte; 360, 768, 1280; claro, escuro, escuro com musgo) e `ui-ux-designer` + `accessibility-auditor`.
- [ ] `code-reviewer`; PR; merge.

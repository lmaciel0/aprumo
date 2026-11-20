# Visual sem cara de IA — Fase 3 (momentos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever os blocos que ainda carregam degradê, brilho e cor crua (reflexão do dia, faixa de saldo, receitas, cartões) e dar ao app os seus momentos: o gráfico do ano com o fio de prumo, a conta mais próxima de hoje marcada e os cartões com a cor real do banco.

**Architecture:** Cada task reescreve um bloco e o tira de `EXCECOES_FASE_3_4` (`frontend/src/teste/varredura.ts`), para que as varreduras da fase 2 (pesos, caixa-alta, raios, movimento, acento) passem a valer nele. Cores dos bancos viram dado num módulo próprio.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-visual-sem-cara-de-ia-design.md` (Direção, Momentos, Assinatura, Fases item 3)

## Global Constraints

- Tudo da fase 2 vale para os arquivos que saem da exceção: pesos 400-600, sem caixa-alta, raio por tamanho, sem `transition-all`/`hover:scale`, coral só na ação principal, número `−R$ 1.234,56`, bom/ruim neutro com sinal e seta.
- Sem degradê entre matizes, sem brilho, sem sombra colorida, sem padrão pontilhado decorativo. Variação de tom dentro do mesmo matiz só no material do cartão.
- Fio de prumo: linha vertical de 2 px em `var(--cor-principal)`; só no mês atual do gráfico do ano, no item ativo da navegação lateral (já feito) e na conta mais próxima de hoje em Próximas contas.
- Ler `docs/DESIGN_SYSTEM.md` antes; código pelo `frontend-developer`; comandos em `frontend/`: `npx vitest run`, `npm run build`, `npx oxlint src`.
- A ordem dos blocos da tela inicial não muda; "Sobra do mês" continua acima da dock em 360x640 (sem widget de meta).

## Review Focus

1. Mês atual sem dados (zero receitas e despesas) ainda mostra o fio de prumo no lugar certo (Task 3).
2. Próximas contas com todas as contas vencidas ou pagas: nenhuma recebe o fio, e a lista não quebra (Task 3).
3. Cartão com nome que bate em dois bancos ("Itaú Nubank") e nome vazio: escolha determinística e material neutro (Task 4).
4. Texto sobre a cor do banco claro (amarelo, azul-claro) mantém 4,5:1 (Task 4).
5. Reflexão do dia com citação longa em 360 px sem estourar o card e com os três botões alcançáveis (Task 1).

---

### Task 1: Reflexão do dia sem bloco coral

**Files:**
- Modify: `frontend/src/paginas/painel/CardReflexao.tsx`
- Modify: `frontend/src/teste/varredura.ts` (tirar `paginas/painel/CardReflexao.tsx` de `EXCECOES_FASE_3_4`)
- Test: `frontend/src/paginas/painel/CardReflexao.test.tsx`

Visual: `card` neutro (sem `--cor-principal`, sem degradê, sem brilho no canto, sem paleta crua do Tailwind); rótulo "Reflexão do dia" em `text-xs font-medium text-[var(--cor-mutado)]`, sentence case, sem selo preenchido; "Sabedoria diária" continua `hidden sm:inline` em `--cor-mutado`; citação em `--cor-texto`, 16 a 17 px, peso 400; autor em `font-medium` `--cor-secundario`, obra em itálico (convenção bibliográfica, decisão do spec), restante em `--cor-mutado`; os três botões só de ícone `size-11 rounded-[10px] text-[var(--cor-secundario)] hover:bg-[var(--cor-elevado)]` com foco visível; divisor `--cor-linha`.

- [ ] **Step 1:** Testes que falham: a `section` tem `card` e não tem `bg-[var(--cor-principal)]`, `gradient`, `uppercase`, `font-bold`; o rótulo lê "Reflexão do dia"; o título do botão de copiar é "Copiar citação"/"Copiado"; as varreduras de `estilos.test.ts` passam sem a exceção.
- [ ] **Step 2:** `npx vitest run src/paginas/painel src/estilos.test.ts` → FAIL.
- [ ] **Step 3:** Implementar; manter comportamento (copiar, favoritar, trocar) e `aria-*` atuais.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(painel): reflexão do dia em card neutro`.

---

### Task 2: Faixa de saldo e card de receitas

**Files:**
- Modify: `frontend/src/paginas/lancamentos/FaixaSaldo.tsx`, `frontend/src/paginas/lancamentos/ReceitasCard.tsx`
- Modify: `frontend/src/teste/varredura.ts` (tirar os dois da exceção)
- Test: `FaixaSaldo.test.tsx`, `ReceitasCard.test.tsx` (criar se não existirem)

Visual: `FaixaSaldo` vira `card` neutro com o saldo como número protagonista (`text-[28px] md:text-[32px] font-medium text-[var(--cor-texto)]`, sem `tracking-tight` abaixo de 28 px), rótulos em `--cor-secundario`, divisor `--cor-linha`, sem degradê nem `--sombra-flutuante` extra. `ReceitasCard`: sem padrão pontilhado, número em `font-medium` `--cor-texto` (receita recebida não é "verde"; o status "Recebido" continua com chip de status), barra de progresso sólida em `var(--cor-grafico-receitas)` sobre trilho `var(--cor-elevado)`, `rounded-full` só no trilho e na barra.

- [ ] **Step 1:** Testes que falham: sem `gradient`, `font-extrabold`, `--cor-principal` de fundo; número com `font-medium`; barra com `bg-[var(--cor-grafico-receitas)]`; varreduras sem exceção.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(orcamento): saldo e receitas em card neutro, sem degradê`.

---

### Task 3: Gráfico do ano e Próximas contas com o fio de prumo

**Files:**
- Modify: `frontend/src/paginas/inicio/BarrasDoResultado.tsx` (destaque do mês atual), `frontend/src/paginas/inicio/GraficoResultado.tsx` (o que restar de cor/peso), `frontend/src/paginas/inicio/ProximasContas.tsx`
- Create: `frontend/src/paginas/inicio/contaMaisProxima.ts`
- Modify: `frontend/src/teste/varredura.ts` (tirar `GraficoResultado.tsx` da exceção)
- Test: `BarrasDoResultado.test.tsx`/`GraficoResultado.test.tsx`, `ProximasContas.test.tsx`, `contaMaisProxima.test.ts`

**Interfaces:**
- Produces: `indiceContaMaisProxima<T extends { vencimento: string }>(contas: T[], hoje: Date): number` — índice da primeira conta com vencimento (data local `AAAA-MM-DD`) maior ou igual a hoje, contando a lista na ordem recebida; `-1` se nenhuma. Adaptar o nome do campo de data ao tipo real usado por `ProximasContas`.

Visual: no gráfico, o mês atual perde o contorno coral em caixa e ganha o fio de prumo: linha vertical de 2 px em `var(--cor-principal)`, atravessando a altura da área das barras, centrada na coluna do mês, `aria-hidden`; o rótulo do mês atual fica `font-medium --cor-texto`, os outros `--cor-mutado`. Meses passados e futuros sem mudança de cor das séries (receitas `--cor-grafico-receitas`, despesas `--cor-grafico-despesas`, previstos com as cores de previsto). Em Próximas contas, a linha da conta mais próxima de hoje ganha `shadow-[inset_2px_0_0_var(--cor-principal)]` e `pl-3`; a data dela em `font-medium`. Nenhuma outra linha recebe o fio.

- [ ] **Step 1:** Testes que falham: `indiceContaMaisProxima` com lista vazia (−1), todas vencidas (−1), hoje igual ao vencimento (aquele índice), mistura (primeira futura); o mês atual tem um elemento de fio `data-fio-prumo` e nenhum contorno com `--cor-principal-fundo`/`outline`; mês atual sem valores ainda tem o fio; Próximas contas marca só uma linha.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(inicio): fio de prumo no mês atual e na conta mais próxima de hoje`.

---

### Task 4: Cartões com a cor real do banco

**Files:**
- Create: `frontend/src/paginas/cartoes/coresBancos.ts`
- Modify: `frontend/src/paginas/cartoes/CardCartao.tsx` (usa o módulo; tira caixa-alta, pesos, `transition-all`, paleta crua), `frontend/src/paginas/cartoes/CardCartao.css` (sem brilho/glow colorido, sem sombra roxa)
- Modify: `frontend/src/teste/varredura.ts` (tirar `CardCartao.tsx` e `CardCartao.css` da exceção)
- Test: `coresBancos.test.ts`, `CardCartao.test.tsx`

**Interfaces:**
- Produces: `interface MaterialCartao { fundo: string; texto: string; neutro: boolean }` e `materialDoBanco(nome: string): MaterialCartao`. `fundo` é um `linear-gradient(135deg, <tom claro>, <tom escuro>)` do mesmo matiz; `texto` é a cor do texto sobre ele (4,5:1 contra os dois tons). Banco desconhecido ou nome vazio: `neutro: true`, `fundo` e `texto` em variáveis de tema (`linear-gradient(135deg, var(--cor-elevado), var(--cor-card))` e `var(--cor-texto)`).

Bancos e cores (tom claro, tom escuro, texto): Nubank `#8A05BE`/`#5B0380`/`#F4EDE0`; Inter `#FF7A00`/`#D45F00`/`#14213D`; Itaú (itau, itaú, uniclass, personnalite) `#EC7000`/`#C25A00`/`#14213D`; Bradesco `#CC092F`/`#8E0620`/`#F4EDE0`; Santander `#EC0000`/`#B00000`/`#F4EDE0`; American Express (amex, american express) `#2E77BB`/`#1F5A91`/`#F4EDE0`; C6 `#2B2B2B`/`#141414`/`#EDEDED`; Caixa `#005CA9`/`#003F75`/`#F4EDE0`; Mercado Pago `#00B1EA`/`#0090C1`/`#14213D`; Banco do Brasil (banco do brasil, bb) `#FCFC30`/`#E3E32A`/`#14213D`; PicPay `#21C25E`/`#18A04C`/`#14213D`; ShopeePay (shopee) `#EE4D2D`/`#C93E21`/`#F4EDE0`. Ordem de checagem: a lista acima, primeiro que casar no nome normalizado (minúsculas, sem acento). As palavras de cor antigas (`roxo`, `verde`, `vermelho`, `azul`, `ultravioleta`) saem do casamento. O texto "CARTÃO" genérico no cartão sai; aparece o nome do banco/cartão em sentence case quando conhecido, ou nada. O chip EMV pode ficar como detalhe físico, sem brilho.

- [ ] **Step 1:** Testes que falham: cada banco da lista devolve seu material; "Itaú Uniclass" é Itaú; nome vazio e "Cartão Loja" são neutros; contraste `texto` contra os dois tons ≥ 4,5:1 para todos (função de contraste em hex no teste); `CardCartao` sem "CARTÃO" em caixa-alta, sem `#4f46e5`/`#7c3aed`, sem `transition-all`; varreduras sem exceção.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar; o CSS não define cor de marca (a cor vem do estilo inline do material). **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(cartoes): cor real do banco e material neutro para cartão desconhecido`.

---

### Task 5: Proporções da tela inicial e da visão geral em 1280 px

**Files:**
- Modify: `frontend/src/paginas/inicio/InicioPage.tsx`, `frontend/src/paginas/painel/FinancasDoMes.tsx` (só grade/alinhamento), `frontend/src/paginas/inicio/CardSobra.tsx` só se precisar (`self-start`/`h-fit`)
- Test: testes existentes das páginas (classes de grade)

Hoje, em 1280 px, o card da Sobra estica até a altura da coluna vizinha e fica com um vazio grande, e "Onde você mais gastou" estica até a altura da lista de cartões. Regra: card de número não estica além do conteúdo (`self-start` ou grade com `items-start`), os dois cards de Receitas/Despesas ao lado ficam com a mesma altura entre si, e listas longas (Próximas contas, Cartões) podem ser mais altas que o vizinho. Nada muda em 360 e 768 px além do que o alinhamento implicar.

- [ ] **Step 1:** Testes que falham: o contêiner da linha de finanças tem `md:items-start` (ou a Sobra tem `md:self-start`); "Onde você mais gastou" tem `md:self-start`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `fix(inicio): cards de número sem esticar em 1280 px`.

---

### Fechamento da fase

- [ ] `npx vitest run`, `npx oxlint src`, `npm run build` verdes; `EXCECOES_FASE_3_4` só com `paginas/metas/`.
- [ ] Gate visual com a API falsa (rotas `/`, `/financeiro`, `/lancamentos`, `/cartoes`; 360, 768, 1280; claro, escuro, escuro com musgo) e `ui-ux-designer` + `accessibility-auditor`; Sobra acima da dock em 360x640 sem metas.
- [ ] `code-reviewer`; PR; merge.

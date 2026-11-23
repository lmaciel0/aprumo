# Início: cartão, gastos por categoria e atalhos — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a tela Início (`/`, `PainelPage`) passa a mostrar atalhos, 1 cartão e as 3 categorias com mais gasto no mês, com a "Sobra do mês" ainda acima da dock em 360x640.

**Architecture:** só front-end. Preferência nova `cartaoInicioId` no `localStorage` (mesmo mecanismo dos atalhos). Dois blocos novos em `paginas/painel/`, cada um com `useQuery` inline e uma função pura de seleção testada à parte. `PainelPage` reordena os blocos e volta a renderizar `AtalhosRapidosMobile`.

**Tech Stack:** React + TypeScript, @tanstack/react-query 5, vitest + Testing Library + MSW, Tailwind com tokens `--cor-*`.

**Spec:** `docs/superpowers/specs/2026-11-23-inicio-cartao-orcamento-atalhos-design.md`

Todos os caminhos abaixo são relativos a `frontend/src/`, salvo indicação.

## Global Constraints

- Nenhuma cor fixa em TSX: `estilos.test.ts` reprova. Usar tokens `--cor-*`, `COR_DA_BARRA`/`CLASSE_DO_CHIP` de `paginas/cartoes/faixas.ts` e `obterCorValida` de `paginas/categorias/paletaCores.ts`.
- Nenhuma requisição nova além de `/api/cartoes` e `/api/categorias`. Reusar as chaves existentes: `['resumo', ano, mes]` (com `endpoints.resumo` e `placeholderData: keepPreviousData`, igual a `paginas/painel/FinancasDoMes.tsx:21-25`), `['cartoes', ano, mes]` com `endpoints.cartoes.listar(ano, mes)`, `['categorias']` com `endpoints.categorias.listar()`.
- Fixtures de teste copiadas do JSON real da API (testes do backend em `backend/src/test/`), não montadas no formato do front (lição do #76).
- Alvos de toque de no mínimo 44 px. Barras com valor em texto (`aria-valuetext`), não só visual.
- "Sobra do mês" inteira acima de y ≈ 555 em 360x640 (`docs/DESIGN_SYSTEM.md` L98 e L191).
- Valores em reais e percentuais com os helpers de `paginas/inicio/valores.ts` (`formatarPercentual`, `larguraDaBarra` e o formatador de moeda que já existe ali).
- Textos em português do Brasil.
- Branch: `feat/inicio-cartao-orcamento`, criada da `main` depois do merge do PR #77.

## Review Focus

1. Cartão salvo na preferência deixou de existir (removido) → mostra o de maior fatura, sem erro. Teste na Task 2.
2. Cartão sem limite (`limite: null`, `faixa: 'SEM_LIMITE'`) → sem barra, texto "Sem limite definido". Teste na Task 3.
3. Categoria do resumo que não está em `/api/categorias` (ou `cor` inválida) → ícone `ICONE_PADRAO` e cor de `obterCorValida`. Teste na Task 4.
4. `/api/cartoes` com erro 500 → só o bloco do cartão mostra erro; Finanças do mês continua visível. Teste na Task 5.
5. `localStorage` com `cartaoInicioId` inválido (texto, negativo, decimal) → lido como `null`. Teste na Task 1.

---

### Task 1: Preferência `cartaoInicioId`

**Files:**
- Modify: `preferencias/preferenciasTipos.ts:15-22`
- Modify: `preferencias/preferenciasStorage.ts` (`PREFERENCIAS_PADRAO` :7, `lerPreferenciasSalvas` :49)
- Modify: `preferencias/PreferenciasContext.tsx` (`PreferenciasContextValor` :16-25, provider)
- Test: `preferencias/preferenciasStorage.test.ts`, `preferencias/usePreferencias.test.tsx`

**Interfaces:**
- Produces: `PreferenciasUsuario.cartaoInicioId: number | null` (padrão `null`); `setCartaoInicioId(id: number | null): void` em `PreferenciasContextValor`, exposto por `usePreferencias()`. `restaurarPadroes()` volta o campo a `null`.

- [ ] **Step 1: Testes falhando**

Em `preferenciasStorage.test.ts`:
- `'cartaoInicioId começa nulo'`: `expect(lerPreferenciasSalvas().cartaoInicioId).toBeNull()` com storage vazio.
- `'lê cartaoInicioId salvo'`: grava `{ ...PREFERENCIAS_PADRAO, cartaoInicioId: 7 }` em `CHAVE_PREFERENCIAS`; espera `7`.
- `'descarta cartaoInicioId inválido'`: para `'7'`, `-1`, `2.5` e `0`, espera `null`.
- `'preferência antiga sem o campo continua válida'`: JSON sem `cartaoInicioId` e com `atalhosMobile` válido; espera `cartaoInicioId === null` e os atalhos preservados.

Em `usePreferencias.test.tsx`:
- `'setCartaoInicioId grava e restaurarPadroes limpa'`: `act(() => result.current.setCartaoInicioId(3))` → `result.current.preferencias.cartaoInicioId === 3` e `JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS)!).cartaoInicioId === 3`; depois `restaurarPadroes()` → `null`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd frontend; npx vitest run src/preferencias`
Expected: FAIL nos testes novos.

- [ ] **Step 3: Implementar**

Campo no tipo, `cartaoInicioId: null` no padrão, validação em `lerPreferenciasSalvas` (aceita só inteiro positivo, senão `null`), setter no provider no mesmo padrão de `setAtalhosMobile`.

- [ ] **Step 4: Rodar e ver passar**

Run: `cd frontend; npx vitest run src/preferencias`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/preferencias
git commit -m "feat(inicio): preferência do cartão exibido na Início"
```

---

### Task 2: Escolha do cartão e fixtures reais

**Files:**
- Create: `paginas/painel/escolherCartaoInicio.ts`
- Create: `teste/fixturesInicio.ts`
- Test: `paginas/painel/escolherCartaoInicio.test.ts`

**Interfaces:**
- Consumes: `CartaoResponse` (`api/tipos.ts:92-106`).
- Produces: `escolherCartaoInicio(cartoes: CartaoResponse[], idPreferido: number | null): CartaoResponse | null`. Fixtures exportadas: `CARTOES_API: CartoesResponse` (no mínimo 3 cartões, um deles com `limite: null` e `faixa: 'SEM_LIMITE'`, um com `diaVencimento: null`), `RESUMO_API: ResumoResponse` (com `categorias` de pelo menos 4 itens), `CATEGORIAS_API: CategoriaResponse[]` (sem uma das categorias do resumo, para o caso do Review Focus 3).

Regra: se `idPreferido` casa com `itemId` de algum cartão, devolve esse. Senão, o de maior `Number(fatura)`; empate fica com o primeiro da lista. Lista vazia → `null`.

- [ ] **Step 1: Montar as fixtures** copiando o JSON de resposta dos testes do backend de `/api/cartoes`, `/api/resumo` e `/api/categorias` (procurar em `backend/src/test/`). Ajustar só valores, nunca nomes de campo.

- [ ] **Step 2: Testes falhando** em `escolherCartaoInicio.test.ts`:
- `'devolve o cartão preferido'`: `escolherCartaoInicio(cartoes, cartoes[2].itemId)` é `cartoes[2]`.
- `'sem preferência, devolve o de maior fatura'`: com faturas `'100.00'`, `'1240.50'`, `'99.90'`, devolve o de `'1240.50'`.
- `'preferido removido cai no de maior fatura'`: `idPreferido = 9999` → maior fatura.
- `'empate fica com o primeiro'`.
- `'lista vazia devolve null'`.

- [ ] **Step 3: Rodar e ver falhar** — `cd frontend; npx vitest run src/paginas/painel/escolherCartaoInicio.test.ts` → FAIL.

- [ ] **Step 4: Implementar** `escolherCartaoInicio`.

- [ ] **Step 5: Rodar e ver passar** — mesmo comando → PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/paginas/painel/escolherCartaoInicio.ts frontend/src/paginas/painel/escolherCartaoInicio.test.ts frontend/src/teste/fixturesInicio.ts
git commit -m "feat(inicio): regra de qual cartão aparece na Início"
```

---

### Task 3: Bloco `CartaoInicio`

**Files:**
- Create: `paginas/painel/CartaoInicio.tsx`
- Create: `paginas/painel/ModalEscolherCartao.tsx`
- Test: `paginas/painel/CartaoInicio.test.tsx`

**Interfaces:**
- Consumes: `escolherCartaoInicio` (Task 2), `usePreferencias().preferencias.cartaoInicioId` e `setCartaoInicioId` (Task 1), `CARTOES_API` (Task 2).
- Produces: `export function CartaoInicio({ ano, mes }: { ano: number; mes: number })`; `export function ModalEscolherCartao({ aberto, aoFechar, cartoes }: { aberto: boolean; aoFechar: () => void; cartoes: CartaoResponse[] })`.

Conteúdo do bloco: título "Cartão"; nome do cartão (trunca com reticências); "vence dia N" (omitido se `diaVencimento` for `null`); "Fatura" + valor; barra de `uso` com `role="progressbar"`, `aria-valuenow`, `aria-valuetext="62% do limite usado"` e cor por `COR_DA_BARRA[faixa]` (mesma lógica de `paginas/cartoes/CardCartao.tsx:178-191`); "Disponível" + `limiteDisponivel`. Sem limite: sem barra, texto "Sem limite definido". Botão "Trocar" (só com 2 ou mais cartões) abre `ModalEscolherCartao`, que lista os cartões como opções de rádio e grava com `setCartaoInicioId` ao escolher. Link "Ver cartões" para `/cartoes`. O bloco inteiro **não** é um link (teria um botão dentro dele); o link fica separado (ajuste do spec, já registrado lá).

Estados: carregando → esqueleto da mesma altura; erro → "Não foi possível carregar o cartão." com botão "Tentar de novo" (`refetch`); sem cartões → o componente devolve `null`.

Testes renderizam com `renderComApp` envolto em `PreferenciasProvider` e MSW (`servidor.use(http.get('/api/cartoes', ...))`).

- [ ] **Step 1: Testes falhando** em `CartaoInicio.test.tsx`:
- `'mostra o cartão de maior fatura sem preferência'`: espera o nome do cartão de maior fatura de `CARTOES_API`, o texto de vencimento e o valor da fatura formatado.
- `'mostra o cartão escolhido na preferência'`: `localStorage` com `cartaoInicioId` do 2º cartão → nome dele.
- `'trocar grava a preferência'`: clica "Trocar", escolhe outro cartão no rádio → bloco mostra o novo nome e `localStorage` tem o novo id.
- `'cartão sem limite não mostra barra'`: preferência no cartão `SEM_LIMITE` → `queryByRole('progressbar')` nulo e texto "Sem limite definido".
- `'sem vencimento omite a linha'`: preferência no cartão com `diaVencimento: null` → sem "vence dia".
- `'sem cartões não renderiza nada'`: `/api/cartoes` com `cartoes: []` → `queryByText('Cartão')` nulo.
- `'erro mostra tentar de novo'`: `/api/cartoes` com 500 → texto de erro e botão "Tentar de novo".
- `'barra tem o valor em texto'`: `getByRole('progressbar')` com `aria-valuetext` contendo "% do limite usado".

- [ ] **Step 2: Rodar e ver falhar** — `cd frontend; npx vitest run src/paginas/painel/CartaoInicio.test.tsx` → FAIL.

- [ ] **Step 3: Implementar** os dois componentes.

- [ ] **Step 4: Rodar e ver passar** — mesmo comando e `npx vitest run src/estilos.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/paginas/painel/CartaoInicio.tsx frontend/src/paginas/painel/ModalEscolherCartao.tsx frontend/src/paginas/painel/CartaoInicio.test.tsx
git commit -m "feat(inicio): bloco do cartão na Início com troca de cartão"
```

---

### Task 4: Bloco `OndeMaisGastou`

**Files:**
- Create: `paginas/painel/topCategorias.ts`
- Create: `paginas/painel/OndeMaisGastou.tsx`
- Test: `paginas/painel/topCategorias.test.ts`, `paginas/painel/OndeMaisGastou.test.tsx`

**Interfaces:**
- Consumes: `CategoriaTotal`, `CategoriaResponse` (`api/tipos.ts`), `RESUMO_API` e `CATEGORIAS_API` (Task 2), `obterCorValida`, `renderizarIcone` e `ICONE_PADRAO` (`paginas/categorias/catalogoIcones.tsx:38,73`).
- Produces: `type CategoriaDestaque = CategoriaTotal & { icone: string; cor: string }`; `topCategorias(totais: CategoriaTotal[], catalogo: CategoriaResponse[], limite = 3): CategoriaDestaque[]`; `export function OndeMaisGastou({ ano, mes }: { ano: number; mes: number })`.

Regra de `topCategorias`: mantém a ordem de `totais` (o backend já ordena por valor), pega os `limite` primeiros e junta `icone` e `cor` por `categoriaId === id`; sem par no catálogo → `icone: ICONE_PADRAO`, `cor: ''` (o componente passa por `obterCorValida`).

Conteúdo do bloco: título "Onde mais gastou"; para cada categoria, ícone na cor da categoria, nome (trunca), valor e barra com largura `larguraDaBarra(percentual)` e `aria-valuetext="32% das despesas"`; link "Ver orçamento" para `/lancamentos`. Sem despesas no mês: o bloco aparece com "Nenhuma despesa lançada neste mês." (decisão do plano: mantém o layout estável). Carregando: esqueleto. Erro: mensagem curta com "Tentar de novo".

- [ ] **Step 1: Testes falhando** em `topCategorias.test.ts`:
- `'pega as 3 primeiras na ordem do resumo'`: com 4 totais, devolve os 3 primeiros `categoriaId` na mesma ordem.
- `'junta ícone e cor do catálogo'`: `icone` e `cor` iguais aos da `CategoriaResponse` de mesmo id.
- `'categoria fora do catálogo usa o ícone padrão'`: `icone === ICONE_PADRAO`.
- `'menos de 3 devolve o que houver'` e `'lista vazia devolve []'`.

Em `OndeMaisGastou.test.tsx`:
- `'mostra as 3 maiores categorias'`: com `RESUMO_API` e `CATEGORIAS_API`, os 3 nomes aparecem e o 4º não.
- `'sem despesas mostra o estado vazio'`: resumo com `categorias: []` → "Nenhuma despesa lançada neste mês.".
- `'link leva ao orçamento'`: `getByRole('link', { name: 'Ver orçamento' })` com `href` `/lancamentos`.
- `'usa a mesma chave do resumo'`: um `QueryClient` só com `FinancasDoMes` e `OndeMaisGastou` renderizados juntos faz uma única chamada a `/api/resumo` (contar no handler do MSW).

- [ ] **Step 2: Rodar e ver falhar** — `cd frontend; npx vitest run src/paginas/painel/topCategorias.test.ts src/paginas/painel/OndeMaisGastou.test.tsx` → FAIL.

- [ ] **Step 3: Implementar** `topCategorias` e `OndeMaisGastou`.

- [ ] **Step 4: Rodar e ver passar** — mesmo comando e `npx vitest run src/estilos.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/paginas/painel/topCategorias.ts frontend/src/paginas/painel/topCategorias.test.ts frontend/src/paginas/painel/OndeMaisGastou.tsx frontend/src/paginas/painel/OndeMaisGastou.test.tsx
git commit -m "feat(inicio): bloco das categorias com mais gasto no mês"
```

---

### Task 5: Início com a nova ordem, atalhos e documentação

**Files:**
- Modify: `paginas/painel/PainelPage.tsx:16-35`
- Modify: `paginas/painel/atalhosCatalogo.tsx:70` e `:96`
- Modify: `docs/DESIGN_SYSTEM.md` (raiz do repositório; L94-100 e L130)
- Test: `paginas/painel/PainelPage.test.tsx`, `paginas/painel/atalhosCatalogo.test.ts` (novo)

**Interfaces:**
- Consumes: `CartaoInicio` (Task 3), `OndeMaisGastou` (Task 4), `AtalhosRapidosMobile` (sem props, `paginas/painel/AtalhosRapidosMobile.tsx:23`).

Ordem final em `PainelPage`: saudação e data → `AtalhosRapidosMobile` → `FinancasDoMes` → `CartaoInicio` → `OndeMaisGastou` → `WidgetMetaInicio` → `CardReflexao`. `ano` e `mes` vêm do mesmo lugar que `FinancasDoMes` usa hoje. Atalhos só abaixo do breakpoint `md` (em telas largas a dock lateral já leva a esses destinos). Rotas: `orcamento` → `/lancamentos`, `visao-geral` → `/financeiro`.

- [ ] **Step 1: Testes falhando**

`atalhosCatalogo.test.ts`:
- `'orcamento aponta para /lancamentos'` e `'visao-geral aponta para /financeiro'`.
- `'toda rota do catálogo existe no app'`: para cada item de `LISTA_ATALHOS`, o caminho sem query começa por uma das rotas declaradas em `App.tsx` (`/lancamentos`, `/cartoes`, `/notas`, `/relatorios`, `/categorias`, `/financeiro`).

`PainelPage.test.tsx`:
- `'blocos na ordem nova'`: os títulos aparecem nesta ordem no DOM: atalhos, "Sobra do mês", "Cartão", "Onde mais gastou", meta, frase do dia (comparar `compareDocumentPosition`).
- `'atalhos aparecem na Início'`: os 4 atalhos padrão (`ATALHOS_PADRAO`) estão na tela.
- `'erro nos cartões não derruba o resto'`: `/api/cartoes` com 500 → "Sobra do mês" e "Onde mais gastou" continuam visíveis.

- [ ] **Step 2: Rodar e ver falhar** — `cd frontend; npx vitest run src/paginas/painel` → FAIL nos novos.

- [ ] **Step 3: Implementar** a ordem, os atalhos e as rotas.

- [ ] **Step 4: Rodar tudo** — `cd frontend; npx vitest run; npx tsc -b; npx oxlint` → tudo PASS, sem erro de tipo nem de lint.

- [ ] **Step 5: Atualizar `docs/DESIGN_SYSTEM.md`**: L100 passa a listar a ordem nova ("definida pelo dono em 2026-11-23"); L130 passa a dizer que a Início mostra `AtalhosRapidosMobile`, `CartaoInicio` e `OndeMaisGastou` (tirar `NotaFixada`). A medição da L98 é atualizada depois do gate visual, com os números novos.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/paginas/painel docs/DESIGN_SYSTEM.md
git commit -m "feat(inicio): atalhos de volta, cartão e categorias na Início com a nova ordem"
```

---

## Depois das tasks (sessão principal)

1. Gate visual (`docs/TESTING.md` :36-45): `agent-browser` sessão `prints` (sem `--restore`), 360, 768 e 1280, claro e escuro; medir em 360x640 onde termina a "Sobra do mês" (precisa ficar abaixo de y ≈ 555). Prints vão ao `ui-ux-designer` (com `accessibility-auditor`); falhas voltam ao `frontend-developer`. Atualizar a medição da L98 do `DESIGN_SYSTEM.md`.
2. `code-reviewer` no diff da branch.
3. Verificação final: `cd frontend; npx vitest run; npm run build`.

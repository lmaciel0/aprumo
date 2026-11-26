# Conselheiro de Metas com tokens — plano

**Objetivo:** tirar a paleta crua do Tailwind (`emerald-*`) de `CardConselheiroMetas` e usar os tokens do design system, fechando o achado do gate visual (verde fora de `--cor-positivo-texto` em `/financeiro`, tema claro, 360/768/1280).

**Referência:** `docs/DESIGN_SYSTEM.md` (seção de proibições, linha com a lista de desvios em `metas`).

### Task 1: Conselheiro sem paleta crua

**Faixa:** comum

**Files:**
- Modify: `frontend/src/paginas/metas/CardConselheiroMetas.tsx`
- Test: `frontend/src/paginas/metas/CardConselheiroMetas.test.tsx`
- Modify: `docs/DESIGN_SYSTEM.md`

- [ ] **Step 1:** Teste que falha em `CardConselheiroMetas.test.tsx`: o HTML renderizado do card (com sugestões) não contém nenhuma classe da paleta crua do Tailwind (regex `/\b(?:bg|text|border|from|to)-(?:emerald|green|red|amber|blue|sky|slate|gray)-\d/`), e o valor sugerido de cada caixinha (ex.: `+ R$ 461,54`) tem a classe `text-[var(--cor-positivo-texto)]`.
- [ ] **Step 2:** `npx vitest run src/paginas/metas/CardConselheiroMetas.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar:
  - valor sugerido (hoje `text-emerald-600 dark:text-emerald-400`, perto da linha 85): `text-[var(--cor-positivo-texto)]`, mantendo `shrink-0 pl-2 text-xs font-bold`;
  - ícone do cabeçalho (hoje tile `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`, perto da linha 133): sem tile colorido; ícone em `text-[var(--cor-mutado)]`, mesmo tamanho, `aria-hidden`. Card continua neutro, sem degradê.
  - Não mexer em regra de negócio, textos nem nos outros componentes de `metas`.
- [ ] **Step 4:** `npx vitest run` (todo o front) → PASS. `npx tsc -b` e `npm run lint` sem erro novo.
- [ ] **Step 5:** Em `docs/DESIGN_SYSTEM.md`, tirar `CardConselheiroMetas` da lista de desvios em `metas` (o resto da lista fica).

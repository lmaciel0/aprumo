# Visual sem cara de IA — Fase 1 (tokens) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a paleta, os presets, as superfícies e o item ativo da navegação pelo visual novo (marinho, creme, coral no claro; grafite e coral no escuro), sem vidro e sem degradê, deixando o app todo coerente.

**Architecture:** Quase tudo é token em `frontend/src/index.css`; componentes já leem `var(--cor-*)`. `--cor-principal` vira o tom escuro do acento (seguro como texto), e o coral vivo entra pelo token novo `--cor-principal-fundo`. Testes de contraste em `estilos.test.ts` e o teste do documento (`designSystemDoc.test.ts`) mudam junto com o CSS e com `docs/DESIGN_SYSTEM.md`.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (CSS-first), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-19-visual-sem-cara-de-ia-design.md`

## Global Constraints

- Contraste: texto 4,5:1, contorno de campo e componente 3:1, nos dois temas e nos presets `coral` (base), `musgo`, `ceu`.
- Só tokens `--cor-*` em TSX (`estilos.test.ts` reprova `bg-white`, `bg-[#`, `text-[#`, `text-white`).
- Nada de `backdrop-filter`/`backdrop-blur` em `.card`, `.superficie`, dock e cabeçalho; nada de degradê de fundo.
- Uma curva de movimento: `--curva: cubic-bezier(0.22, 1, 0.36, 1)`; só cor, opacidade e transform animam; `prefers-reduced-motion` desliga.
- Alvo de toque 44 px, foco visível, regras de 360 px do `DESIGN_SYSTEM.md` continuam.
- Código de front escrito pelo agent `frontend-developer`. Comandos a partir de `frontend/`: `npx vitest run <arquivo>`, `npm run lint`, `npm run build`.
- Crédito: "unslop, de Damir Sokolovsky (https://github.com/heydamir/unslop), CC BY 4.0" no `DESIGN_SYSTEM.md`.

## Review Focus

1. Quem tem `presetCor` antigo salvo (`azul`, `lima`, `esmeralda`, `indigo`) abre o app e cai no preset novo equivalente, sem tela quebrada (Task 3).
2. Componentes ainda não migrados (`bg-[var(--cor-principal)] text-[var(--cor-sobre-principal)]`, cerca de 56 usos) seguem AA em todos os presets e temas (Task 1, teste de pares).
3. Campos da tela de auth no claro, agora sobre creme, têm contorno visível de 3:1 (Task 1).
4. Texto mutado sobre a superfície elevada no escuro (linha ativa, chip) passa de 4,5:1 (Task 1).
5. A barra do navegador acompanha o tema ao alternar, inclusive antes do React montar (`tema-init.js`) (Task 4).

---

### Task 1: Paleta e presets em tokens

**Files:**
- Modify: `frontend/src/index.css:8-143` (blocos `:root`, `:root[data-tema='escuro']`, presets)
- Modify: `frontend/src/estilos.test.ts:44-140, 142-160` (tokens, presets, pares de contraste, campo de auth)
- Modify: `frontend/src/designSystemDoc.test.ts:38-39, 116` (lista de presets e tokens do preset)
- Modify: `docs/DESIGN_SYSTEM.md` seções "Cores" e "Presets" (tabelas)

**Interfaces:**
- Produces: tokens `--cor-principal-fundo`, `--cor-sobre-principal-fundo`, `--cor-secundario`, `--cor-elevado` (claro e escuro); presets `html[data-preset='musgo']`, `html[data-preset='ceu']` e as versões `html[data-tema='escuro'][data-preset=...]`. Removidos: `--cor-principal-fim`, `--cor-auth-borda`, `--cor-auth-fundo-fim` e os presets `lima`, `esmeralda`, `indigo`.

Valores (claro em `:root` / escuro em `:root[data-tema='escuro']`; "—" = não redefine):

| Token | Claro | Escuro |
|---|---|---|
| `--cor-fundo` | `#f4ede0` | `#141415` |
| `--cor-card` | `#fbf7f0` | `#19191b` |
| `--cor-elevado` | `#ece3d3` | `#232325` |
| `--cor-linha` | `#ded9d0` | `#2a2a2c` |
| `--cor-texto` | `#14213d` | `#ededed` |
| `--cor-secundario` | `#3a4459` | `#a1a1a6` |
| `--cor-mutado` | `#5a6275` | `#8e8e94` |
| `--cor-principal` | `#b83e31` | `#ff6b5b` |
| `--cor-principal-clara` | `color-mix(in srgb, var(--cor-principal) 45%, var(--cor-card))` | — |
| `--cor-principal-fundo` | `#ff6b5b` | `#ff6b5b` |
| `--cor-sobre-principal` | `#f4ede0` | `#141415` |
| `--cor-sobre-principal-fundo` | `#14213d` | `#141415` |
| `--cor-sobre-principal-suave` | `#fbede9` | `#3a1a16` |
| `--cor-positivo` | `#2e7d4f` | `#4cc38a` |
| `--cor-positivo-texto` | `#1f6b3f` | `#5fd68f` |
| `--cor-negativo` | `#b42318` | `#e5484d` |
| `--cor-negativo-texto` | `#a11d14` | `#ff8a80` |
| `--cor-sobre-negativo` | `#f4ede0` | `#141415` |
| `--cor-erro-fundo` | `#f6dcd5` | `#2e1a1a` |
| `--cor-ok-fundo` | `#dcead9` | `#15261c` |
| `--cor-aviso-fundo` | `#f5e2b8` | `#2b2410` |
| `--cor-aviso-texto` | `#6b4e00` | `#f2c94c` |
| `--cor-auth-campo-borda` | `#7d8496` | `#6e6e73` |
| `--cor-grafico-receitas` | `#14213d` | `#a9b8d6` |
| `--cor-grafico-despesas` | `var(--cor-principal-fundo)` | — |
| `--cor-grafico-receitas-previstas` | `color-mix(in srgb, var(--cor-grafico-receitas) 40%, var(--cor-card))` | — |
| `--cor-grafico-despesas-previstas` | `color-mix(in srgb, var(--cor-grafico-despesas) 40%, var(--cor-card))` | — |
| `--cor-nota-*` | sem mudança | sem mudança |

Presets (só `--cor-principal`, `--cor-sobre-principal`, `--cor-principal-fundo`):

| Preset | claro: principal / sobre / fundo | escuro: principal / sobre / fundo |
|---|---|---|
| `musgo` | `#3f6b47` / `#f4ede0` / `#8db384` | `#9cc79f` / `#141415` / `#9cc79f` |
| `ceu` | `#245e86` / `#f4ede0` / `#7fb3d5` | `#8ec1e3` / `#141415` / `#8ec1e3` |

`coral` é o padrão: sem bloco próprio, valem os tokens base.

- [ ] **Step 1: Reescrever os testes de token em `estilos.test.ts`**

Substituir os testes que fixam valores antigos (`verde e vermelho...`, `texto pequeno...`, `o tema escuro usa fundo neutro obsidian...`, `declara regras para os presets...`, `o tema escuro mantém contraste AA...`, `no tema escuro, texto sobre o principal...`, os dois de campo de auth) por:

```ts
const PRESETS = ['base', 'musgo', 'ceu'] as const
const TEMAS = ['claro', 'escuro'] as const
// cor(tema, preset, nome): hex do bloco do preset no tema, senão o do tema, senão o do claro (escuro herda de :root)

it('o claro usa marinho, creme e coral; o escuro usa grafite', () => {
  expect(token('cor-fundo')).toBe('#f4ede0'); expect(token('cor-texto')).toBe('#14213d')
  expect(token('cor-principal-fundo')).toBe('#ff6b5b')
  // bloco escuro: --cor-fundo #141415, --cor-card #19191b, --cor-elevado #232325
})
it('declara só os presets musgo e ceu, sem lima, esmeralda nem indigo', ...)
it.each(TEMAS × PRESETS)('texto, secundário e mutado passam de 4,5:1 sobre card, fundo e elevado (%s, %s)', ...)
it.each(TEMAS × PRESETS)('principal como texto passa de 4,5:1 sobre card e fundo (%s, %s)', ...)
it.each(TEMAS × PRESETS)('sobre-principal/principal, sobre-principal-fundo/principal-fundo, sobre-principal-suave/principal passam de 4,5:1 (%s, %s)', ...)
it.each(TEMAS)('sobre-negativo/negativo e positivo-texto, negativo-texto e aviso-texto sobre card e seus fundos passam de 4,5:1 (%s)', ...)
it.each(TEMAS)('a borda do campo de auth passa de 3:1 sobre o card (%s)', ...)
```

Manter `celula_paga_e_diferenca_negativa_usam_os_tons_de_texto`, `cores fixas` (exceto o de pares do escuro, absorvido acima) e os de botão de tema. Aviso-texto é medido sobre `--cor-aviso-fundo`; positivo-texto e negativo-texto sobre `--cor-card` e `--cor-fundo`.

- [ ] **Step 2: Ajustar `designSystemDoc.test.ts`**

`PRESETS = ['musgo', 'ceu']`; `TOKENS_DO_PRESET = ['cor-principal', 'cor-sobre-principal', 'cor-principal-fundo']`; rótulos `['Principal (claro)', 'Sobre principal (claro)', 'Fundo (claro)', 'Principal (escuro)', 'Sobre principal (escuro)', 'Fundo (escuro)']`. A tabela continua com 7 células.

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/estilos.test.ts src/designSystemDoc.test.ts`
Expected: FAIL (valores antigos no CSS e no documento).

- [ ] **Step 4: Aplicar os valores das tabelas acima em `index.css`**

Atualizar os comentários dos blocos (sem "obsidian", "azul moderno", "lavanda"). Remover os tokens e presets listados em Produces.

- [ ] **Step 5: Atualizar as tabelas "Cores" e "Presets" do `docs/DESIGN_SYSTEM.md`**

Uma linha por token `--cor-*` de `:root`, valores idênticos aos do CSS (inclusive as expressões `color-mix(...)` e `var(...)`), coluna Uso em uma frase. Na coluna Uso de `--cor-principal`: "Tom do acento seguro como texto, link, borda, anel de foco e fio de prumo"; de `--cor-principal-fundo`: "Acento vivo, só preenchimento, com `--cor-sobre-principal-fundo` por cima; nunca texto no claro (2,4:1 sobre o creme)". Tabela de Presets com colunas `Preset | Principal (claro) | Sobre principal (claro) | Fundo (claro) | Principal (escuro) | Sobre principal (escuro) | Fundo (escuro)`, linhas `coral` (base), `musgo`, `ceu`. Texto da seção Presets: três presets, `coral` é o padrão.

- [ ] **Step 6: Rodar e ver passar**

Run: `npx vitest run src/estilos.test.ts src/designSystemDoc.test.ts src/paginas/notas`
Expected: PASS (as cores de nota continuam com 4,5:1 sobre o card novo; se `coresCategoria.test.ts` falhar, escurecer só a cor reprovada no claro e registrar na tabela).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/index.css frontend/src/estilos.test.ts frontend/src/designSystemDoc.test.ts docs/DESIGN_SYSTEM.md
git commit -m "feat(visual): paleta marinho, creme e coral, grafite no escuro, presets coral, musgo e céu"
```

---

### Task 2: Superfície sólida, raio, sombra, curva e telas de auth

**Files:**
- Modify: `frontend/src/index.css:52-62, 103-106` (tokens de superfície), `:162-179` (`.superficie`, `.card`), `:200-250` (auth), `:313-339, 393, 404-437, 529, 545-547` (curva e spinner)
- Modify: `frontend/src/layout/AppShell.tsx:174` (fundo) e `:190` (camada com `backdrop-blur` atrás do cabeçalho)
- Modify: `frontend/src/estilos.test.ts:200-269` (fluidez e superfícies)
- Modify: `docs/DESIGN_SYSTEM.md` seções "Identidade", "Raio, superfícies e sombras", "Acessibilidade" (movimento), "O que NÃO fazer"

**Interfaces:**
- Consumes: `--cor-card`, `--cor-linha`, `--cor-principal-fundo`, `--cor-sobre-principal-fundo`, `--cor-auth-campo-borda` (Task 1).
- Produces: `--sombra-elevada` (flutuantes: dock, menu, modal) e `--curva`; `--fundo-degrade` removido; `--superficie` = `var(--cor-card)`.

Valores:
- `--raio-card: 14px`; `--superficie: var(--cor-card)`; `--superficie-borda: var(--cor-linha)` (só em `:root`).
- `--sombra-flutuante`: claro `0 1px 2px rgb(20 33 61 / 6%)`, escuro `none`.
- `--sombra-elevada`: claro `0 8px 24px rgb(20 33 61 / 8%)`, escuro `inset 0 1px 0 rgb(255 255 255 / 6%)`.
- `--curva: cubic-bezier(0.22, 1, 0.36, 1)`; toda `cubic-bezier(0.16, 1, 0.3, 1)` e `ease-out` de animação do `index.css` passam a `var(--curva)`.
- `.auth-card`: `border-radius: 18px; padding: 24px 32px; border: 1px solid var(--cor-linha); background: var(--cor-card); box-shadow: var(--sombra-elevada)`. `h1`: 28 px, peso 500, `var(--cor-texto)`. `input`: `border: 1px solid var(--cor-auth-campo-borda)` nos dois temas, raio 10 px, `padding: 12px 16px`, sem sombra; foco `border-color: var(--cor-principal)`. Botão submit: `background: var(--cor-principal-fundo); color: var(--cor-sobre-principal-fundo)`, raio 10 px, `padding-block: 12px`, `transition: transform 150ms var(--curva)`; sem `scale` no hover; `:active` `scale(0.98)`.
- `.dot-spinner__dot::before`: sem `box-shadow`.

- [ ] **Step 1: Escrever os testes que falham em `estilos.test.ts`**

```ts
it('declara superfície sólida, sombras e curva; sem degradê de fundo', () => {
  expect(token('superficie')).toBe('var(--cor-card)')
  expect(token('fundo-degrade')).toBeUndefined()
  expect(token('raio-card')).toBe('14px')
  expect(token('curva')).toBe('cubic-bezier(0.22, 1, 0.36, 1)')
  expect(token('sombra-elevada')).toBeDefined()
})
it('nenhum backdrop-filter no index.css nem backdrop-blur em TSX de produção', ...) // varre css e tsxDeProducao()
it('o card de auth é sólido, sem degradê, sem peso 900 e sem hover com scale', ...) // .auth-card sem linear-gradient; h1 sem font-weight: 900; button:hover sem scale
it('nenhuma animação usa a curva antiga', () => expect(css).not.toMatch(/cubic-bezier\(0\.16, 1, 0\.3, 1\)/))
```

Trocar `card_e_superficie_usam_os_tokens` para exigir `background: var(--superficie)`, borda e sombra, e **não** ter `backdrop-filter`. Remover `superficie_translucida_mantem_contraste_AA` (coberto pelos pares da Task 1 sobre `--cor-card`). Manter `transition-duration: 150ms` e o teste de `item-entra`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/estilos.test.ts`
Expected: FAIL nos testes novos.

- [ ] **Step 3: Aplicar os valores em `index.css` e tirar o degradê e o blur de `AppShell.tsx`**

Em `AppShell.tsx:174`, `style={{ background: 'var(--fundo-degrade)' }}` vira `bg-[var(--cor-fundo)]`; em `:190`, a camada atrás do cabeçalho perde `backdrop-blur-*` e usa `bg-[var(--cor-fundo)]` sólido (mesma função: esconder o conteúdo que rola por baixo).

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/estilos.test.ts src/layout src/auth`
Expected: PASS.

- [ ] **Step 5: Atualizar o `docs/DESIGN_SYSTEM.md`**

- Identidade: claro creme com texto marinho e acento coral; escuro grafite com o mesmo coral; superfícies sólidas com borda fina, profundidade por degraus (`--cor-fundo`, `--cor-card`, `--cor-elevado`); assinatura "fio de prumo" (linha vertical de 2 px em `--cor-principal`, só no item ativo da navegação lateral, no mês atual do gráfico e na conta mais próxima de hoje). Remover a frase "O desfoque dos cards é decisão do dono e não se remove."
- Raio, superfícies e sombras: tabela com os valores desta task (`--raio-card` 14 px, `--superficie`, `--superficie-borda`, `--sombra-flutuante`, `--sombra-elevada`, `--curva`), escala de raio do spec (tag 6, controle 10, card 14, painel e folha 16 a 20; pílula só em avatar, botão "Criar", ponto de status e interruptor de tema).
- Acessibilidade/movimento: uma curva (`--curva`).
- O que NÃO fazer: remover "Não remover o `backdrop-filter: blur`..."; acrescentar: não usar `backdrop-filter`/`backdrop-blur`; não usar degradê entre matizes nem brilho ou sombra colorida; não usar peso 700 a 900; não usar caixa-alta com tracking em rótulo; não usar `--cor-principal-fundo` como texto ou linha fina; valor negativo vai na cor do texto com "−", vermelho só em status e alerta.
- Crédito ao unslop (Global Constraints) ao fim de "Referências visuais".

- [ ] **Step 6: Rodar o teste do documento**

Run: `npx vitest run src/designSystemDoc.test.ts`
Expected: PASS (títulos e ordem das seções mantidos).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/index.css frontend/src/layout/AppShell.tsx frontend/src/estilos.test.ts docs/DESIGN_SYSTEM.md
git commit -m "feat(visual): superfícies sólidas sem blur nem degradê, raio 14, curva única, auth sem degradê"
```

---

### Task 3: Presets coral, musgo e céu nas preferências

**Files:**
- Modify: `frontend/src/preferencias/preferenciasTipos.ts:2`
- Modify: `frontend/src/preferencias/preferenciasStorage.ts:9, 58-60`
- Modify: `frontend/src/preferencias/PreferenciasModal.tsx:13-18, 156`
- Test: `frontend/src/preferencias/preferenciasStorage.test.ts`, `frontend/src/preferencias/PreferenciasModal.test.tsx`, `frontend/src/preferencias/usePreferencias.test.tsx`

**Interfaces:**
- Produces: `type PresetCor = 'coral' | 'musgo' | 'ceu'`; `PREFERENCIAS_PADRAO.presetCor === 'coral'`; `export function migrarPresetCor(valor: unknown): PresetCor` em `preferenciasStorage.ts`.

- [ ] **Step 1: Testes que falham**

```ts
it.each([
  ['coral', 'coral'], ['musgo', 'musgo'], ['ceu', 'ceu'],
  ['azul', 'coral'], ['lima', 'musgo'], ['esmeralda', 'musgo'], ['indigo', 'ceu'],
  ['roxo', 'coral'], [undefined, 'coral'], [42, 'coral'],
])('migrarPresetCor(%s) devolve %s', (entrada, esperado) => expect(migrarPresetCor(entrada)).toBe(esperado))

it('lerPreferenciasSalvas migra o preset antigo salvo', () => {
  localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ presetCor: 'indigo' }))
  expect(lerPreferenciasSalvas().presetCor).toBe('ceu')
})
```

No modal: os botões de preset são exatamente "Coral", "Musgo" e "Céu", e clicar em "Musgo" chama `setPresetCor('musgo')`. Atualizar testes existentes que citam `azul`/`lima`/`esmeralda`/`indigo`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/preferencias`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Tipo e padrão novos; `lerPreferenciasSalvas` usa `migrarPresetCor(parsed.presetCor)`. Mapa: `azul→coral`, `lima→musgo`, `esmeralda→musgo`, `indigo→ceu`; desconhecido → `coral`. Lista do modal: `{ id: 'coral', nome: 'Coral', cor: '#FF6B5B' }`, `{ id: 'musgo', nome: 'Musgo', cor: '#8DB384' }`, `{ id: 'ceu', nome: 'Céu', cor: '#7FB3D5' }` (bolinha com `style`, como hoje), grade `grid-cols-3`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/preferencias`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/preferencias
git commit -m "feat(preferencias): presets coral, musgo e céu com migração do preset salvo"
```

---

### Task 4: Cor da barra do navegador e do PWA

**Files:**
- Modify: `frontend/src/tema/tema.ts:27-28`, `frontend/public/tema-init.js:13`, `frontend/index.html:5`, `frontend/public/manifest.webmanifest:10-11`
- Test: `frontend/src/index-html.test.ts:42`, `frontend/src/manifest.test.ts:46`, `frontend/src/tema/temaInit.test.ts`, `frontend/src/tema/useTema.test.tsx`

**Interfaces:**
- Produces: `COR_BARRA = { claro: '#14213D', escuro: '#141415' }`.

- [ ] **Step 1: Testes que falham** — `theme-color` do `index.html` e `theme_color` do manifest `#14213D`; `background_color` `#F4EDE0`; `tema-init.js` põe `#141415` no escuro e `#14213D` no claro; `aplicarTema('escuro')` põe `#141415`.
- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/index-html.test.ts src/manifest.test.ts src/tema` → FAIL.
- [ ] **Step 3: Trocar os valores** nos quatro arquivos; comentário de `COR_BARRA`: "o marinho da marca e o `--cor-fundo` escuro".
- [ ] **Step 4: Rodar e ver passar** — mesmo comando → PASS.
- [ ] **Step 5: Commit**

```bash
git add frontend/src/tema frontend/public/tema-init.js frontend/index.html frontend/public/manifest.webmanifest frontend/src/index-html.test.ts frontend/src/manifest.test.ts
git commit -m "feat(visual): barra do navegador e manifest em marinho e grafite"
```

---

### Task 5: Item ativo da navegação e dock inferior

**Files:**
- Modify: `frontend/src/layout/Sidebar.tsx:39-44`, `frontend/src/layout/DockLateral.tsx:100-110`, `frontend/src/layout/DockInferior.tsx:9, 20-30 (comentário), 68, 94-96, 109`
- Test: `frontend/src/layout/Sidebar.test.tsx`, `frontend/src/layout/DockLateral.test.tsx`, `frontend/src/layout/DockInferior.test.tsx`
- Modify: `docs/DESIGN_SYSTEM.md` "Componentes existentes" (linha da `DockInferior`) e "Acessibilidade" ("o item ativo da dock é um bloco preenchido com texto" vira degrau com texto)

**Interfaces:**
- Consumes: `--cor-elevado`, `--cor-principal`, `--cor-principal-fundo`, `--cor-sobre-principal-fundo`, `--sombra-elevada` (Tasks 1 e 2).

Classes:
- Ativo em `Sidebar` e nas duas variantes de `DockLateral`: `bg-[var(--cor-elevado)] font-medium text-[var(--cor-texto)] shadow-[inset_2px_0_0_var(--cor-principal)]` (sem `bg-[var(--cor-principal)]`, sem `shadow-md`/`shadow-xs`, sem `font-semibold`).
- `DockInferior`: `<nav>` com `rounded-2xl bg-[var(--cor-card)] shadow-[var(--sombra-elevada)]`, sem `rounded-full`, sem `backdrop-blur-*`, sem sombra com `--cor-principal`. Item: `rounded-[10px] font-medium` no lugar de `rounded-full font-bold`; ativo `bg-[var(--cor-elevado)] text-[var(--cor-texto)]`, sem fio de prumo. Botão "Criar": `rounded-full bg-[var(--cor-principal-fundo)] text-[var(--cor-sobre-principal-fundo)] shadow-[var(--sombra-elevada)]`, mantém `size-14`, `ring-4 ring-[var(--cor-card)]` e o `active:scale-95`.
- Comentários que citam o `backdrop-blur` do nav como motivo da folha ser irmã: reescrever para o motivo que continua (a folha cobre a dock e não pode ficar presa ao `<nav>` fixo) ou remover se não valer mais.

- [ ] **Step 1: Testes que falham**

```ts
// Sidebar e DockLateral (expandida e recolhida): link ativo
expect(ativo).toHaveClass('bg-[var(--cor-elevado)]', 'shadow-[inset_2px_0_0_var(--cor-principal)]')
expect(ativo.className).not.toMatch(/bg-\[var\(--cor-principal\)\]/)
// DockInferior
expect(nav.className).not.toMatch(/backdrop-blur|rounded-full/)
expect(ativo).toHaveClass('bg-[var(--cor-elevado)]'); expect(ativo.className).not.toMatch(/inset_2px/)
expect(criar).toHaveClass('size-14', 'rounded-full', 'bg-[var(--cor-principal-fundo)]')
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/layout` → FAIL.
- [ ] **Step 3: Aplicar as classes** nos três componentes.
- [ ] **Step 4: Rodar e ver passar** — `npx vitest run src/layout` → PASS.
- [ ] **Step 5: Atualizar as duas linhas do `DESIGN_SYSTEM.md`** e rodar `npx vitest run src/designSystemDoc.test.ts` → PASS.
- [ ] **Step 6: Commit**

```bash
git add frontend/src/layout docs/DESIGN_SYSTEM.md
git commit -m "feat(layout): item ativo em degrau com fio de prumo e dock sólida"
```

---

### Task 6: Card da Sobra neutro

**Files:**
- Modify: `frontend/src/paginas/inicio/CardSobra.tsx:27-49`
- Create: `frontend/src/paginas/inicio/CardSobra.test.tsx`

**Interfaces:**
- Consumes: `.card`, `--cor-texto`, `--cor-secundario`, `--cor-mutado`, `--cor-elevado` (Tasks 1 e 2). Props de `CardSobra` não mudam.

Classes: `<section>` `card flex flex-col md:col-span-11` (sem `bg-[var(--cor-principal)]`, sem `rounded-[var(--raio-card)] p-4` duplicados); título `text-xs font-normal text-[var(--cor-secundario)]`; valor `valor m-0 mt-1.5 text-[28px] font-medium text-[var(--cor-texto)] md:text-[32px]` (sem `font-bold`, sem `tracking-tight`); percentual e "No ano" em `text-[var(--cor-mutado)]`; comparação em `rounded-md bg-[var(--cor-elevado)] px-2 py-0.5 text-xs text-[var(--cor-secundario)]` (sem `rounded-full`, sem `font-semibold`). Comentário do componente: "Destaque da tela: quanto sobrou no mês, em card neutro com o número grande; o negativo vai com o prefixo −."

- [ ] **Step 1: Teste que falha**

```tsx
it('mostra a sobra em card neutro, número grande em peso 500 e negativo com sinal', () => {
  render(<CardSobra sobra="-2508.45" sobraAno="-8507.49" receitas="12390.97" anterior={null} nomeMesAnterior="outubro" />)
  const secao = screen.getByRole('region', { name: 'Sobra do mês' })
  expect(secao).toHaveClass('card'); expect(secao.className).not.toMatch(/bg-\[var\(--cor-principal\)\]/)
  const valor = within(secao).getByText(/R\$\s?2\.508,45/)
  expect(valor.textContent).toMatch(/^[−-]/)
  expect(valor).toHaveClass('font-medium', 'text-[var(--cor-texto)]'); expect(valor).not.toHaveClass('font-bold')
})
```

Usar o formato real de `formatarComSinal` (ler `paginas/inicio/valores.ts`) na asserção do texto.

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run src/paginas/inicio/CardSobra.test.tsx` → FAIL.
- [ ] **Step 3: Aplicar as classes.**
- [ ] **Step 4: Rodar e ver passar** — mesmo comando e `npx vitest run src/paginas/inicio src/paginas/painel` → PASS.
- [ ] **Step 5: Commit**

```bash
git add frontend/src/paginas/inicio/CardSobra.tsx frontend/src/paginas/inicio/CardSobra.test.tsx
git commit -m "feat(inicio): sobra do mês em card neutro com número protagonista"
```

---

### Fechamento da fase

- [ ] `npx vitest run` (tudo), `npm run lint`, `npm run build` em `frontend/` — tudo verde.
- [ ] Gate visual (`docs/TESTING.md`): prints de `/`, `/financeiro`, `/lancamentos`, `/cartoes`, `/notas`, `/metas`, `/mais` e `/login` em 360, 768 e 1280, claro e escuro, mais o escuro com preset `musgo`; `ui-ux-designer` com `accessibility-auditor` compara com o `DESIGN_SYSTEM.md`; o `frontend-developer` corrige as falhas.
- [ ] `code-reviewer` no diff da branch; PR; merge.

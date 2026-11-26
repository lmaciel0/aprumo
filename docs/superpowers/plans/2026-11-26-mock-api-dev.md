# API falsa em dev (modo mock) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npm run dev:mock` sobe o front com uma API falsa em `/api/*`, para o gate visual ver as telas autenticadas com dados.

**Architecture:** Plugin próprio do Vite (`apply: 'serve'`, só em `--mode mock`) registra um middleware em `/api` que carrega `frontend/mock/handlersDev.ts` via `server.ssrLoadModule` e responde com `getResponse(handlers, request)` do `msw`. Nada em `src/` de produção nem no `dist/`. Não usar `msw/vite` (injeta worker no bundle do cliente).

**Tech Stack:** Vite 8, Vitest 5, MSW 3.0.3 (`getResponse`, `http`, `HttpResponse` de `msw`), React 19, TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-26-mock-api-dev-design.md`

## Global Constraints
- Nada do mock no build de produção: `dist/` sem `aprumo-api-falsa` nem `handlersDev`.
- `npm run dev` (sem `--mode mock`) continua com proxy `'/api' -> 'http://localhost:8080'`.
- Sem dependência nova.
- Dados do mock vêm das fixtures de `frontend/src/teste/` (formato do backend); não criar fixtures paralelas, só compor as existentes.
- Endpoint sem handler: `501` com JSON `{ "erro": "sem mock: <MÉTODO> <caminho>" }` e `console.warn` com a mesma frase.
- Todos os comandos rodam em `frontend/`: `npm run test -- --run`, `npm run lint`, `npm run build`.

## Review Focus
- Connect tira o prefixo de `req.url` em `middlewares.use('/api', …)`: a URL do `Request` tem de usar `req.originalUrl` (teste e2e de `/api/auth/me` cobre — Task 2).
- `POST`/`PATCH` sem handler não pode travar esperando corpo: responde 501 (teste — Task 2).
- Query string `?ano=&mes=` não impede o casamento do handler (teste com `/api/resumo?ano=2026&mes=11` — Task 1).
- `Content-Type` da resposta do MSW chega ao navegador (teste e2e lê `.json()` — Task 2).
- Config em `build` não carrega o plugin, mesmo com `--mode mock` (teste — Task 2).

---

### Task 1: Handlers de dev com dados preenchidos

**Faixa:** comum

**Files:**
- Create: `frontend/mock/handlersDev.ts`
- Test: `frontend/mock/handlersDev.test.ts`

**Interfaces:**
- Consumes: `usuarioFicticio` (`src/teste/auth.ts`), `RESUMO_API`, `CARTOES_API`, `CATEGORIAS_API` (`src/teste/fixturesInicio.ts`), `META_API_EM_ANDAMENTO`, `META_API_CONCLUIDA`, `META_API_SEM_PRAZO`, `CONSELHEIRO_API` (`src/teste/fixturesMetas.ts`), `lancamento(...)` e `categoriasFicticias()` (`src/teste/lancamentos.ts`).
- Produces: `export const handlersDev: HttpHandler[]`.

- [ ] **Step 1: Teste falhando** (`// @vitest-environment node` no topo). Com `getResponse(handlersDev, new Request('http://localhost' + caminho))`:
  - `/api/auth/me` → 200 e `json()` igual a `usuarioFicticio`.
  - `/api/resumo?ano=2026&mes=11` → 200 e igual a `RESUMO_API`.
  - `/api/cartoes?ano=2026&mes=11`, `/api/categorias`, `/api/metas`, `/api/metas/conselheiro`, `/api/notas/fixada`, `/api/categorias-nota`, `/api/saldo?ano=2026&mes=11` → 200.
  - `/api/lancamentos?ano=2026&mes=11` → 200 e array com pelo menos 5 itens.
  - `/api/inexistente` → `undefined`.
- [ ] **Step 2:** `npm run test -- --run mock/handlersDev` → FAIL (módulo não existe).
- [ ] **Step 3: Implementar `handlersDev`.** Só `http.get` com `HttpResponse.json(...)`. `metas`: as 3 metas. `saldo`: `{ ativo: true, saldo: '<valor>' }` no tipo do `api/tipos`. `lancamentos`: 5 a 8 itens montados com `lancamento(...)`, cobrindo receita, despesa, paga e pendente, com categorias de `categoriasFicticias()`. `notas/fixada`: `{ nota: null }`. `categorias-nota`: `[]`.
- [ ] **Step 4:** `npm run test -- --run mock/handlersDev` → PASS.
- [ ] **Step 5:** `npm run lint` passa. Se `mock/` ficar fora do tsconfig, incluí-lo no tsconfig que já cobre `vite.config.ts` (o `tsc -b` do build tem de checar `mock/`).

### Task 2: Plugin do modo mock, config do Vite e script

**Faixa:** comum

**Files:**
- Create: `frontend/mock/pluginApiFalsa.ts`
- Modify: `frontend/vite.config.ts`, `frontend/package.json` (scripts), `docs/TESTING.md` (uma linha sobre `npm run dev:mock`)
- Test: `frontend/mock/pluginApiFalsa.test.ts`

**Interfaces:**
- Consumes: `handlersDev` (Task 1), carregado por `server.ssrLoadModule('/mock/handlersDev.ts')` a cada requisição.
- Produces: `export function apiFalsa(): Plugin` com `name: 'aprumo-api-falsa'` e `apply: 'serve'`. `vite.config.ts` passa a exportar `defineConfig(({ mode }) => ({ ... }))`.

- [ ] **Step 1: Testes falhando** (`// @vitest-environment node`):
  - `apiFalsa().apply === 'serve'` e `name === 'aprumo-api-falsa'`.
  - Chamando a função da config de `vite.config.ts`: `{ mode: 'mock', command: 'serve' }` → plugins incluem `aprumo-api-falsa` e `server.proxy` sem `/api`. `{ mode: 'development', command: 'serve' }` → sem o plugin e `server.proxy['/api'] === 'http://localhost:8080'`. `{ mode: 'mock', command: 'build' }` → o plugin não roda (`apply: 'serve'`; verificar via `resolveConfig(..., 'build', 'mock')` que nenhum plugin se chama `aprumo-api-falsa`).
  - E2E: `createServer({ configFile: <vite.config.ts>, mode: 'mock', server: { port: 0 } })`, `listen()`. `GET /api/auth/me` → 200 e `json()` igual a `usuarioFicticio`. `GET /api/inexistente` → 501 e `{ erro: 'sem mock: GET /api/inexistente' }`. `POST /api/lancamentos` com corpo JSON → 501 sem travar (timeout do teste 10 s). Fecha o servidor no `afterAll`.
- [ ] **Step 2:** `npm run test -- --run mock/pluginApiFalsa` → FAIL.
- [ ] **Step 3: Implementar `apiFalsa()`.** O middleware monta `new Request('http://localhost' + req.originalUrl, { method, headers, body })`, com corpo só fora de GET/HEAD (ler o stream do `req`). Chama `getResponse(handlersDev, request)`. Com resposta: copia status, headers e corpo para `res`. Sem resposta: 501, JSON da constraint e `console.warn`.
- [ ] **Step 4: Config e script.** `vite.config.ts`: o plugin entra só se `mode === 'mock'`; o proxy `/api` sai nesse modo. O bloco `test` fica igual. `package.json`: `"dev:mock": "vite --mode mock"`.
- [ ] **Step 5:** `npm run test -- --run` (suíte inteira), `npm run lint` e `npm run build` → todos passam.
- [ ] **Step 6: Guarda.** `grep -rE "aprumo-api-falsa|handlersDev|sem mock:" dist` → sem saída.

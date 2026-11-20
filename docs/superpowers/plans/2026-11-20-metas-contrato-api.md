# Metas — alinhar o front ao contrato da API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer Metas funcionar contra o backend real: hoje o front envia e lê campos que a API não tem (`titulo`, `prazo`, `fotoUrl`, `sobraPrevistaMes`...), então criar/editar meta responde 400, o card aparece sem título e o conselheiro diz sempre "sem sobra".

**Architecture:** Corrigir só o front, com um adaptador na fronteira da API. O backend segue o spec de Metas (`docs/superpowers/specs/2026-11-09-metas-caixinhas.md`), tem migration (`V14__metas.sql`) e testes (`MetaControllerTest`); não muda. Os componentes continuam com o tipo de UI atual; `endpoints.ts` converte formato da API ↔ formato da UI. As fixtures de teste passam a usar o JSON real da API.

**Tech Stack:** React 19, TypeScript, Vitest + MSW.

**Diagnóstico:** investigação do agent `debugger` em 2026-11-20 (registrada no ledger da fase 4 do visual). Evidência: `MetaController.java:15-67`, `MetaRequest.java:9-31`, `MetaResponse.java:12-19`, `ResumoConselheiroResponse.java`, `SugestaoAporte.java`; front `endpoints.ts:127-137`, `tipos.ts:270-316`, `ModalMetaForm.tsx:81-87`, `CardMeta.tsx:79,148`, `CardConselheiroMetas.tsx:26,57`; fixtures em `teste/servidor.ts:31-32`, `CardMeta.test.tsx`, `CardConselheiroMetas.test.tsx` usam o formato do front e mascaram o defeito.

## Global Constraints

- Não alterar backend, migration nem contrato HTTP.
- Tipos da API espelham os records Java campo a campo (nomes, nulabilidade, `String` para valores monetários como hoje).
- Prazo: a API guarda `mesAlvo` e `anoAlvo` (sem dia). O formulário passa a pedir mês e ano (`<input type="month">`, rótulo "Prazo estimado (opcional)"); sem prazo = ambos `null`.
- Ícone: a API não guarda ícone; o ícone vem do preset (`PRESETS_VISUAIS[preset].icone`); `presetVisual` nulo da API vira `'personalizado'` na UI.
- Foto: `imagemUrl` da API ↔ `fotoUrl` da UI; `corGradiente` da API é ignorado na UI e enviado como hoje o backend espera (ou `null`, se opcional no `MetaRequest`).
- Código pelo `frontend-developer`; comandos em `frontend/`: `npx vitest run`, `npm run build`.
- Visual de Metas (fase 4 do redesenho) não muda.

## Review Focus

1. Meta sem prazo: `mesAlvo`/`anoAlvo` nulos ida e volta, card mostra "Sem prazo fixo".
2. Editar meta mantém foto, preset e prazo (PUT com todos os campos que o `MetaRequest` exige).
3. Conselheiro com `sugestoes` vazia e com `sobraMes` negativa.
4. Valor monetário com vírgula digitado no form chega à API no formato que ela aceita hoje (não regredir).
5. Guardar e resgatar (`/{id}/guardar`, `/{id}/resgatar`) com o corpo que a API espera.

---

### Task 1: Tipos da API e adaptador

**Files:**
- Modify: `frontend/src/api/tipos.ts` (acrescentar `MetaApi`, `MetaRequestApi`, `ResumoConselheiroApi`, `SugestaoAporteApi` espelhando os records Java; manter os tipos de UI)
- Create: `frontend/src/api/adaptadorMetas.ts` com `metaDaApi(m: MetaApi): Meta`, `metaParaApi(m: NovaMeta | EdicaoMeta): MetaRequestApi`, `conselheiroDaApi(r: ResumoConselheiroApi): ResumoConselheiro` (nomes dos tipos de UI conforme `tipos.ts` atual)
- Modify: `frontend/src/api/endpoints.ts:127-137` (as funções de metas usam o adaptador na ida e na volta; guardar/resgatar com o corpo da API)
- Create: `frontend/src/teste/fixturesMetas.ts` com JSON real da API (copiado dos casos de `backend/src/test/java/.../MetaControllerTest.java` e dos records)
- Test: `frontend/src/api/adaptadorMetas.test.ts`, `frontend/src/api/endpoints.test.ts` (ou o teste existente de endpoints)

**Interfaces:**
- Produces: `metaDaApi`, `metaParaApi`, `conselheiroDaApi`; fixtures `META_API_EM_ANDAMENTO`, `META_API_CONCLUIDA`, `META_API_SEM_PRAZO`, `CONSELHEIRO_API`, `CONSELHEIRO_API_SEM_SUGESTOES`.

- [ ] **Step 1:** Testes que falham: `metaDaApi(META_API_EM_ANDAMENTO).titulo === 'Viagem...'` (o `nome`), prazo derivado de `mesAlvo`/`anoAlvo`, `fotoUrl` de `imagemUrl`, preset nulo vira `'personalizado'`; `metaParaApi` produz `{ nome, valorAlvo, mesAlvo, anoAlvo, presetVisual, imagemUrl, ... }` sem `titulo`, `prazo`, `fotoUrl`, `icone`; meta sem prazo produz `mesAlvo: null, anoAlvo: null`; `conselheiroDaApi` mapeia `sobraMes`→`sobraPrevistaMes`, soma das sugestões→`totalSugeridoAporte`, `sugestoes[].nome`→`titulo`; endpoints chamam a URL certa com o corpo da API (MSW captura o corpo).
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run src/api` → PASS.
- [ ] **Step 5:** Commit `fix(metas): adaptador entre o contrato da API e a UI`.

---

### Task 2: Formulário com mês e ano, e testes no formato real

**Files:**
- Modify: `frontend/src/paginas/metas/ModalMetaForm.tsx` (prazo por mês: `<input type="month">`; payload pelo tipo de UI que o adaptador converte; sem `icone` no envio)
- Modify: `frontend/src/teste/servidor.ts` e os testes de Metas (`CardMeta.test.tsx`, `CardConselheiroMetas.test.tsx`, `MetasPage.test.tsx`, `ModalMetaForm.test.tsx`, `ModalAporteMeta.test.tsx`, `WidgetMetaInicio.test.tsx`) para servir o JSON da API via `fixturesMetas.ts` onde passam pela rede; testes de componente puro podem continuar com o tipo de UI (via `metaDaApi(fixture)`)
- Test: os mesmos

- [ ] **Step 1:** Testes que falham: criar meta envia `nome`, `mesAlvo`, `anoAlvo` (MSW captura) e mostra a meta criada com título; editar mantém foto e preset; página lista metas com título vindo de `nome`; conselheiro mostra a sobra de `sobraMes`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementar. **Step 4:** `npx vitest run` e `npm run build` → PASS.
- [ ] **Step 5:** Commit `fix(metas): formulário com mês e ano e testes com o JSON real da API`.

---

### Fechamento

- [ ] Conferência manual contra o backend local, se houver Postgres disponível; senão, registrar que a verificação foi por contrato (fixtures copiadas do teste do backend).
- [ ] `code-reviewer`; PR; merge.

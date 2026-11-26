# API falsa em dev para o gate visual — design curto

**Data:** 2026-11-26 · **Tamanho:** mudança pequena · **Faixa proposta:** comum (ver "Guarda")

## Intenção
O `agy-tarefa visual` reprovou 12/12 prints porque as telas autenticadas (`/`, `/lancamentos`) ficam em "Carregando…" / "Acordando o servidor": em dev o Vite faz proxy de `/api` para `localhost:8080`, onde não há API, e o `AuthProvider` espera `GET /api/auth/me`. Queremos que, só em dev e sob um modo explícito, as telas abram com dados falsos para o Neon julgar o visual de verdade.

## Objetivos
- `npm run dev:mock` sobe o front com uma API falsa que responde `/api/*` com os handlers e fixtures dos testes (`src/teste/`), incluindo `GET /api/auth/me` com um usuário falso.
- As rotas do gate (`/`, `/lancamentos`, e `/financeiro`, onde fica a Início) renderizam com dados, sem aviso de servidor.
- `projetos.json` do `agy-tarefa`: `visual.subir` passa a usar `dev:mock`; `rotas` ganha `/financeiro`.

## Não-objetivos
- Simular escrita (POST/PATCH/DELETE com estado). Mutação responde sem efeito ou 501.
- Cobrir todas as telas; só as do gate. Endpoint sem handler responde 501 e loga no terminal.
- Login real ou backend local.

## Anti-objetivos (falha mesmo que funcione)
- Qualquer código ou arquivo do mock no build de produção (`dist/`).
- `npm run dev` normal mudar de comportamento.
- Duplicar fixtures: o mock reaproveita as dos testes (que seguem o JSON do backend, lição registrada no histórico).

## Abordagens
1. **API falsa fora do app** (escolhida pelo Lucas): nada em `src/` de produção nem no bundle.
2. MSW no navegador (`setupWorker` em `main.tsx`): toca o bundle e o `mockServiceWorker.js` em `public/` iria para produção; exigiria guarda de risco.
3. Backend real local com seed e login no script do visual: mais fiel, lento, e o `agy-tarefa visual` precisaria aprender login.

## Como (decisões do Opus, a corrigir se precisar)
- Implementação preferida: plugin do Vite em `vite.config.ts` com `apply: 'serve'`, ativo só em `--mode mock`. Ele registra um middleware em `/api` que carrega os handlers via `server.ssrLoadModule` (lê TS sem dependência nova) e responde com o resolvedor do MSW. Nesse modo o proxy para `:8080` fica desligado. Se o MSW 3 não expuser um jeito de resolver um `Request` fora do `setupServer`, cair para `@mswjs/http-middleware` ou um `http` simples que reaproveita as fixtures — mesma regra: nada em `src/` de produção.
- Script `dev:mock` = `vite --mode mock`.
- Handlers do mock: os de `src/teste/servidor.ts` + `auth/me` + `lancamentos` e `saldo` (fixtures de `teste/lancamentos.ts`). Se precisar, extrair a lista de handlers para um módulo compartilhado por testes e mock, sem mudar o comportamento dos testes.

## Guarda
- Teste (vitest) que resolve a config do Vite em `build` e confirma que o plugin do mock não está ativo; e teste que, em `serve` sem `--mode mock`, o proxy continua para `:8080`.
- Verificação no fechamento: `npm run build` e grep em `dist/` por um marcador do mock (nome do plugin/handler) dá vazio.
- Como nada entra no bundle, proponho faixa **comum** para tudo (a guarda "mock nunca no build" era risco no caminho 2). O Lucas confirma no plano.

## Para o implementador
- Formato exato do usuário falso de `/api/auth/me`: copiar de `src/teste/auth.ts`.
- Onde extrair handlers compartilhados, nomes de arquivos.

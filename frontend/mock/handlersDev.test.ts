// @vitest-environment node
import { getResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { LancamentoResponse } from '../src/api/tipos'
import { usuarioFicticio } from '../src/teste/auth'
import { RESUMO_API } from '../src/teste/fixturesInicio'
import { handlersDev } from './handlersDev'

const consultar = (caminho: string) => getResponse(handlersDev, new Request(`http://localhost${caminho}`))

describe('handlersDev', () => {
  it('responde /api/auth/me com o usuário fictício', async () => {
    const resposta = await consultar('/api/auth/me')
    expect(resposta?.status).toBe(200)
    expect(await resposta?.json()).toEqual(usuarioFicticio)
  })

  it('responde /api/resumo?ano=2026&mes=11 com RESUMO_API', async () => {
    const resposta = await consultar('/api/resumo?ano=2026&mes=11')
    expect(resposta?.status).toBe(200)
    expect(await resposta?.json()).toEqual(RESUMO_API)
  })

  it.each([
    '/api/cartoes?ano=2026&mes=11',
    '/api/categorias',
    '/api/metas',
    '/api/metas/conselheiro',
    '/api/notas/fixada',
    '/api/categorias-nota',
    '/api/saldo?ano=2026&mes=11',
  ])('responde 200 para %s', async (caminho) => {
    const resposta = await consultar(caminho)
    expect(resposta?.status).toBe(200)
  })

  it('responde /api/lancamentos?ano=2026&mes=11 com ao menos 5 itens cobrindo receita, despesa, pago e previsto', async () => {
    const resposta = await consultar('/api/lancamentos?ano=2026&mes=11')
    expect(resposta?.status).toBe(200)
    const itens = (await resposta?.json()) as LancamentoResponse[]
    expect(itens.length).toBeGreaterThanOrEqual(5)
    expect(itens.some((i) => i.tipo === 'RECEITA')).toBe(true)
    expect(itens.some((i) => i.tipo === 'DESPESA')).toBe(true)
    expect(itens.some((i) => i.status === 'PAGO')).toBe(true)
    expect(itens.some((i) => i.status === 'PREVISTO')).toBe(true)
  })

  it('retorna undefined para /api/inexistente', async () => {
    const resposta = await consultar('/api/inexistente')
    expect(resposta).toBeUndefined()
  })
})

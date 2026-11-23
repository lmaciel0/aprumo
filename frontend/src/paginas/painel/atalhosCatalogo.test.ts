import { describe, expect, it } from 'vitest'
import { CATALOGO_ATALHOS, LISTA_ATALHOS } from './atalhosCatalogo'

// Rotas declaradas em `App.tsx` que os atalhos podem usar.
const ROTAS_DO_APP = ['/lancamentos', '/cartoes', '/notas', '/relatorios', '/categorias', '/financeiro']

describe('atalhosCatalogo', () => {
  it('orcamento aponta para /lancamentos', () => {
    expect(CATALOGO_ATALHOS.orcamento.caminho).toBe('/lancamentos')
  })

  it('visao-geral aponta para /financeiro', () => {
    expect(CATALOGO_ATALHOS['visao-geral'].caminho).toBe('/financeiro')
  })

  it.each(LISTA_ATALHOS.map((atalho) => [atalho.id, atalho.caminho] as const))(
    'toda rota do catálogo existe no app (%s)',
    (_id, caminho) => {
      const semQuery = caminho.split('?')[0] ?? caminho
      expect(ROTAS_DO_APP.some((rota) => semQuery === rota || semQuery.startsWith(`${rota}/`))).toBe(true)
    },
  )
})

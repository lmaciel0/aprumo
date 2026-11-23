import { describe, expect, it } from 'vitest'
import type { CategoriaTotal } from '../../api/tipos'
import { CATEGORIAS_API, RESUMO_API } from '../../teste/fixturesInicio'
import { ICONE_PADRAO } from '../categorias/catalogoIcones'
import { topCategorias } from './topCategorias'

const TOTAIS: CategoriaTotal[] = RESUMO_API.categorias

describe('topCategorias', () => {
  it('pega as 3 primeiras na ordem do resumo', () => {
    const top = topCategorias(TOTAIS.slice(0, 4), CATEGORIAS_API)

    expect(top.map((categoria) => categoria.categoriaId)).toEqual([2, 3, 4])
  })

  it('junta ícone e cor do catálogo', () => {
    const [primeira] = topCategorias(TOTAIS, CATEGORIAS_API)
    const doCatalogo = CATEGORIAS_API.find((categoria) => categoria.id === 2)!

    expect(primeira!.icone).toBe(doCatalogo.icone)
    expect(primeira!.cor).toBe(doCatalogo.cor)
    expect(primeira!.nome).toBe('Doméstica')
    expect(primeira!.total).toBe('1500.00')
  })

  it('categoria fora do catálogo usa o ícone padrão', () => {
    const [pessoais] = topCategorias(TOTAIS.filter((categoria) => categoria.categoriaId === 11), CATEGORIAS_API)

    expect(pessoais!.icone).toBe(ICONE_PADRAO)
    expect(pessoais!.cor).toBe('')
  })

  it('menos de 3 devolve o que houver', () => {
    expect(topCategorias(TOTAIS.slice(0, 2), CATEGORIAS_API)).toHaveLength(2)
  })

  it('lista vazia devolve []', () => {
    expect(topCategorias([], CATEGORIAS_API)).toEqual([])
  })

  it('respeita um limite diferente', () => {
    expect(topCategorias(TOTAIS, CATEGORIAS_API, 5)).toHaveLength(5)
  })
})

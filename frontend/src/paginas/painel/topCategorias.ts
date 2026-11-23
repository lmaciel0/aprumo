import type { CategoriaResponse, CategoriaTotal } from '../../api/tipos'
import { ICONE_PADRAO } from '../categorias/catalogoIcones'

export type CategoriaDestaque = CategoriaTotal & { icone: string; cor: string }

/**
 * As `limite` categorias de maior gasto, na ordem em que o resumo já as entrega, com o ícone e a cor do catálogo.
 * Categoria sem par no catálogo fica com o ícone padrão e `cor` vazia (quem desenha passa por `obterCorValida`).
 */
export function topCategorias(totais: CategoriaTotal[], catalogo: CategoriaResponse[], limite = 3): CategoriaDestaque[] {
  return totais.slice(0, limite).map((total) => {
    const categoria = catalogo.find((item) => item.id === total.categoriaId)
    return { ...total, icone: categoria?.icone ?? ICONE_PADRAO, cor: categoria?.cor ?? '' }
  })
}

import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { lancamento } from '../../teste/lancamentos'
import { renderComApp } from '../../teste/render'
import { GrupoCategoria } from './GrupoCategoria'

const aluguel = lancamento({
  id: 1,
  itemId: 10,
  itemNome: 'Aluguel do apartamento da praia com nome bem comprido',
  categoriaId: 1,
  categoriaNome: 'Moradia',
  tipo: 'DESPESA',
  valor: '1500.00',
  status: 'PREVISTO',
})

describe('GrupoCategoria', () => {
  it('o chip de status tem alvo de 44 px e o nome quebra em até 2 linhas em vez de truncar', () => {
    renderComApp(
      <GrupoCategoria nome="Moradia" lancamentos={[aluguel]} busca="" idMudandoStatus={null} aoMudarStatus={vi.fn()} />,
    )

    const regiao = screen.getByRole('region', { name: 'Moradia' })
    const chip = within(regiao).getByRole('button', { name: /Previsto/ })
    expect(chip).toHaveClass('min-h-11')
    expect(chip).not.toHaveClass('min-h-8')
    const nome = within(regiao).getByText(aluguel.itemNome)
    expect(nome).toHaveClass('line-clamp-2', 'break-words')
    expect(nome).not.toHaveClass('truncate')
  })
})

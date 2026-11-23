import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { ProximaConta } from '../../api/tipos'
import { ProximasContas } from './ProximasContas'

// Valores fictícios.
const contas = (quantas: number): ProximaConta[] =>
  Array.from({ length: quantas }, (_, i) => ({
    lancamentoId: i + 1,
    itemNome: `Conta ${i + 1}`,
    categoriaNome: 'Moradia',
    valor: '10.00',
    vencimento: `2026-11-${String(i + 10).padStart(2, '0')}`,
    atrasada: false,
  }))

function renderizar(quantas: number, limite?: number) {
  render(
    <MemoryRouter>
      <ProximasContas contas={contas(quantas)} limite={limite} />
    </MemoryRouter>,
  )
}

describe('ProximasContas', () => {
  it('com limite 5 e 7 contas, mostra as 5 primeiras e o link Ver todas', () => {
    renderizar(7, 5)

    const lista = screen.getByRole('list')
    expect(within(lista).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Conta 5')).toBeInTheDocument()
    expect(screen.queryByText('Conta 6')).not.toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Ver todas' })
    expect(link).toHaveAttribute('href', '/financeiro')
    expect(link).toHaveClass('min-h-11')
  })

  it('com limite 5 e 3 contas, mostra as 3 e nenhum link', () => {
    renderizar(3, 5)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('link', { name: 'Ver todas' })).not.toBeInTheDocument()
  })

  it('sem limite (visão geral), mostra todas e nenhum link', () => {
    renderizar(7)

    expect(screen.getAllByRole('listitem')).toHaveLength(7)
    expect(screen.queryByRole('link', { name: 'Ver todas' })).not.toBeInTheDocument()
  })
})

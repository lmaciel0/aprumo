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

  it('o chip Pago usa o texto de positivo (contraste 4,5:1 sobre o fundo verde), não a cor de positivo base', () => {
    const pago = lancamento({ ...aluguel, id: 2, status: 'PAGO' })
    renderComApp(
      <GrupoCategoria nome="Moradia" lancamentos={[pago]} busca="" idMudandoStatus={null} aoMudarStatus={vi.fn()} />,
    )

    const chip = within(screen.getByRole('region', { name: 'Moradia' })).getByRole('button', { name: /Pago/ })
    expect(chip).toHaveClass('text-[var(--cor-positivo-texto)]')
    expect(chip).not.toHaveClass('text-[var(--cor-positivo)]')
  })

  it('o valor de receita usa o texto de positivo (13 px, precisa de contraste de texto)', () => {
    const salario = lancamento({
      id: 3,
      itemId: 10,
      itemNome: 'Salário',
      categoriaId: 1,
      categoriaNome: 'Receitas',
      tipo: 'RECEITA',
      valor: '5000.00',
      status: 'PREVISTO',
    })
    renderComApp(
      <GrupoCategoria nome="Receitas" lancamentos={[salario]} busca="" idMudandoStatus={null} aoMudarStatus={vi.fn()} />,
    )

    const link = within(screen.getByRole('region', { name: 'Receitas' })).getByRole('link')
    const valor = within(link).getByText(/5\.000,00/)
    expect(valor).toHaveClass('text-[var(--cor-positivo-texto)]')
    expect(valor).not.toHaveClass('text-[var(--cor-positivo)]')
  })
})

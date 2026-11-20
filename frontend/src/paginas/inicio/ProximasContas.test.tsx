import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ProximaConta } from '../../api/tipos'
import { ProximasContas } from './ProximasContas'

const conta = (id: number, vencimento: string, atrasada = false): ProximaConta => ({
  lancamentoId: id,
  itemNome: `Conta ${id}`,
  categoriaNome: 'Moradia',
  valor: '100.00',
  vencimento,
  atrasada,
})

// 15/11/2026 ao meio-dia em São Paulo.
const hoje = new Date('2026-11-15T15:00:00Z')

const linhas = () => screen.getAllByRole('listitem')
const comFio = () => linhas().filter((linha) => linha.className.includes('shadow-[inset_2px_0_0_var(--cor-principal)]'))

describe('ProximasContas', () => {
  it('marca só a primeira conta de hoje em diante com o fio de prumo e a data em font-medium', () => {
    render(
      <ProximasContas
        hoje={hoje}
        contas={[conta(1, '2026-11-10', true), conta(2, '2026-11-16'), conta(3, '2026-11-20')]}
      />,
    )

    expect(comFio()).toHaveLength(1)
    const marcada = comFio()[0]!
    expect(marcada).toHaveTextContent('Conta 2')
    expect(marcada.className).toContain('pl-3')
    const data = marcada.querySelector('time')!
    expect(data.className).toContain('font-medium')
    expect(data.className).not.toContain('font-semibold')
  })

  it('vencimento igual a hoje recebe o fio', () => {
    render(<ProximasContas hoje={hoje} contas={[conta(1, '2026-11-15'), conta(2, '2026-11-20')]} />)

    expect(comFio()).toHaveLength(1)
    expect(comFio()[0]).toHaveTextContent('Conta 1')
  })

  it('todas vencidas: nenhuma linha recebe o fio e a lista continua inteira', () => {
    render(<ProximasContas hoje={hoje} contas={[conta(1, '2026-11-01', true), conta(2, '2026-11-14', true)]} />)

    expect(linhas()).toHaveLength(2)
    expect(comFio()).toHaveLength(0)
  })

  it('lista vazia mostra a mensagem', () => {
    render(<ProximasContas hoje={hoje} contas={[]} />)

    expect(screen.getByText('Nenhuma conta a vencer.')).toBeInTheDocument()
  })
})

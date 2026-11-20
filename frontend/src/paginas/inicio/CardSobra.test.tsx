import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardSobra } from './CardSobra'

describe('CardSobra', () => {
  it('mostra a sobra em card neutro, número grande em peso 500 e negativo com sinal', () => {
    render(<CardSobra sobra="-2508.45" sobraAno="-8507.49" receitas="12390.97" anterior={null} nomeMesAnterior="outubro" />)

    const secao = screen.getByRole('region', { name: 'Sobra do mês' })
    expect(secao).toHaveClass('card')
    expect(secao.className).not.toMatch(/bg-\[var\(--cor-principal\)\]/)

    const valor = within(secao).getByText(/R\$\s?2\.508,45/)
    expect(valor.textContent).toMatch(/^[−-]/)
    expect(valor).toHaveClass('font-medium', 'text-[var(--cor-texto)]')
    expect(valor).not.toHaveClass('font-bold')
  })
})

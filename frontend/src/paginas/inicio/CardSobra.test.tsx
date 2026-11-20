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

  describe('comparacao com o mes anterior', () => {
    const anterior = (sobra: string) => ({ receitas: '0', despesas: '0', sobra })

    it('melhor mostra seta para cima aria-hidden de 12px antes do texto', () => {
      render(<CardSobra sobra="1000.00" sobraAno="0" receitas="5000" anterior={anterior('618.08')} nomeMesAnterior="outubro" />)

      const chip = screen.getByText(/melhor que outubro/)
      const seta = chip.querySelector('svg')
      expect(seta).not.toBeNull()
      expect(seta).toHaveAttribute('aria-hidden', 'true')
      expect(seta).toHaveAttribute('width', '12')
      expect(seta).toHaveClass('lucide-arrow-up')
      expect(chip.firstElementChild).toBe(seta)
      expect(chip.textContent?.replace(/\s/g, ' ')).toBe('R$ 381,92 melhor que outubro')
    })

    it('pior mostra seta para baixo e mantem o texto', () => {
      render(<CardSobra sobra="618.08" sobraAno="0" receitas="5000" anterior={anterior('1000.00')} nomeMesAnterior="outubro" />)

      const chip = screen.getByText(/pior que outubro/)
      expect(chip.querySelector('svg')).toHaveClass('lucide-arrow-down')
      expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(chip.textContent?.replace(/\s/g, ' ')).toBe('R$ 381,92 pior que outubro')
    })

    it('igual nao tem seta', () => {
      render(<CardSobra sobra="1000.00" sobraAno="0" receitas="5000" anterior={anterior('1000.00')} nomeMesAnterior="outubro" />)

      const chip = screen.getByText('igual a outubro')
      expect(chip.querySelector('svg')).toBeNull()
    })
  })
})

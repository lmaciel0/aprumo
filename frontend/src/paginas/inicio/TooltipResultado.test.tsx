import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PontoSerie } from '../../api/tipos'
import { TooltipResultado } from './TooltipResultado'
import { serieDoResultado } from './valores'

const semNbsp = (texto: string | null) => (texto ?? '').replace(/ /g, ' ')

const novembro: PontoSerie = {
  mes: 11,
  receitas: '1000.00',
  receitasPrevistas: '400.00',
  despesas: '800.00',
  despesasPrevistas: '200.00',
}

describe('TooltipResultado', () => {
  it('mostra_mes_receitas_despesas_e_resultado_com_pago_e_previsto', () => {
    const [ponto] = serieDoResultado([novembro])
    render(<TooltipResultado ponto={ponto ?? null} />)

    expect(screen.getByText('Novembro')).toBeInTheDocument()
    const receitas = screen.getByText('Receitas').closest('[data-linha]')
    const despesas = screen.getByText('Despesas').closest('[data-linha]')
    const resultado = screen.getByText('Resultado').closest('div')
    expect(semNbsp(receitas?.textContent ?? null)).toContain('R$ 1.000,00')
    expect(semNbsp(receitas?.textContent ?? null)).toContain('pago R$ 600,00')
    expect(semNbsp(receitas?.textContent ?? null)).toContain('previsto R$ 400,00')
    expect(semNbsp(despesas?.textContent ?? null)).toContain('R$ 800,00')
    expect(semNbsp(despesas?.textContent ?? null)).toContain('pago R$ 600,00')
    expect(semNbsp(despesas?.textContent ?? null)).toContain('previsto R$ 200,00')
    expect(semNbsp(resultado?.textContent ?? null)).toContain('R$ 200,00')
  })

  it('resultado_negativo_leva_sinal_menos_seta_e_cor_neutra', () => {
    const [ponto] = serieDoResultado([{ ...novembro, receitas: '100.00', receitasPrevistas: '0.00' }])
    render(<TooltipResultado ponto={ponto ?? null} />)

    const valor = screen.getByTestId('tooltip-resultado-valor')
    expect(semNbsp(valor.textContent)).toBe('−R$ 700,00')
    expect(valor.className).not.toMatch(/cor-negativo|cor-positivo/)
    expect(valor.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('resultado_positivo_tambem_fica_na_cor_neutra_e_leva_seta', () => {
    const [ponto] = serieDoResultado([novembro])
    render(<TooltipResultado ponto={ponto ?? null} />)

    const valor = screen.getByTestId('tooltip-resultado-valor')
    expect(valor.className).not.toMatch(/cor-negativo|cor-positivo/)
    expect(valor.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('resultado_zero_nao_leva_seta', () => {
    const [ponto] = serieDoResultado([{ ...novembro, receitas: '800.00', receitasPrevistas: '0.00' }])
    render(<TooltipResultado ponto={ponto ?? null} />)

    expect(screen.getByTestId('tooltip-resultado-valor').querySelector('svg')).toBeNull()
  })

  it('sem_ponto_devolve_null', () => {
    const { container } = render(<TooltipResultado ponto={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})

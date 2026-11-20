import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MesNoEixo } from './BarrasDoResultado'
import type { PontoDoResultado } from './valores'

const ponto = (resultado: number): PontoDoResultado => ({
  mes: 3,
  rotulo: 'mar',
  receitas: 0,
  receitasPagas: 0,
  receitasPrevistas: 0,
  despesas: 0,
  despesasPagas: 0,
  despesasPrevistas: 0,
  resultado,
  sentido: resultado > 0 ? 'sobrou' : resultado < 0 ? 'faltou' : 'zero',
})

function renderizar(resultado: number, compacto: boolean, mesAtual: number | undefined = 3) {
  const { container } = render(
    <svg>
      <MesNoEixo x={10} y={0} payload={{ value: 'mar' }} dados={[ponto(resultado)]} mesAtual={mesAtual} compacto={compacto} />
    </svg>,
  )
  const textos = [...container.querySelectorAll('text')]
  return { textos, rotuloMes: textos[0]!, rotuloResultado: textos[1]! }
}

describe('MesNoEixo', () => {
  it('o mês atual usa peso 500 e cor do texto, os demais 400 e mutado', () => {
    expect(renderizar(80, false).rotuloMes).toHaveAttribute('font-weight', '500')
    expect(renderizar(80, false).rotuloMes).toHaveAttribute('fill', 'var(--cor-texto)')
    expect(renderizar(80, false, 5).rotuloMes).toHaveAttribute('font-weight', '400')
    expect(renderizar(80, false, 5).rotuloMes).toHaveAttribute('fill', 'var(--cor-mutado)')
    expect(renderizar(80, false, 0).rotuloMes).toHaveAttribute('font-weight', '400')
  })

  it('no compacto, o milhar quebra em duas linhas: número e, abaixo, "mil"', () => {
    const { rotuloResultado } = renderizar(-1200, true)
    const linhas = [...rotuloResultado.querySelectorAll('tspan')]

    expect(linhas.map((l) => l.textContent)).toEqual(['−1,2', 'mil'])
    expect(linhas[0]).toHaveAttribute('x', '0')
    expect(linhas[1]).toHaveAttribute('x', '0')
    expect(linhas[1]).toHaveAttribute('dy', '1.1em')
    for (const linha of linhas) {
      expect(linha.textContent!.length).toBeLessThanOrEqual(5)
    }
  })

  it('no compacto, valor abaixo de mil fica em uma linha só', () => {
    const { rotuloResultado } = renderizar(80, true)

    expect(rotuloResultado).toHaveTextContent('+80')
    expect(rotuloResultado.querySelectorAll('tspan')).toHaveLength(0)
  })

  it('no desktop, o rótulo continua em uma linha: "−1,2 mil"', () => {
    const { rotuloResultado } = renderizar(-1200, false)

    expect(rotuloResultado).toHaveTextContent('−1,2 mil')
    expect(rotuloResultado.querySelectorAll('tspan')).toHaveLength(0)
  })
})

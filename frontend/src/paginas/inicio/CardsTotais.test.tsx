import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardsTotais } from './CardsTotais'

const anterior = { receitas: '10000.00', despesas: '10000.00', sobra: '0.00' }

describe('CardsTotais', () => {
  it('variacao_menor_que_1_por_cento_nao_cola_sinal_no_menor_que', () => {
    render(
      <CardsTotais receitas="10010.00" despesas="9990.00" anterior={anterior} nomeMesAnterior="outubro" />,
    )

    expect(screen.getAllByText('<1% vs outubro')).toHaveLength(2)
    expect(screen.queryByText(/[+−]<1%/)).not.toBeInTheDocument()
  })

  it('variacao_de_1_por_cento_ou_mais_mantem_o_sinal', () => {
    render(
      <CardsTotais receitas="10500.00" despesas="9000.00" anterior={anterior} nomeMesAnterior="outubro" />,
    )

    expect(screen.getByText('+5% vs outubro')).toBeInTheDocument()
    expect(screen.getByText('−10% vs outubro')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { CardMeta } from './CardMeta'

const metaExemplo: MetaResponse = {
  id: 1,
  titulo: 'Reserva de Emergência',
  valorAlvo: '10000.00',
  valorGuardado: '4000.00',
  prazo: '2027-12-31',
  presetVisual: 'reserva',
  icone: 'shield',
  corGradienteInicio: '#047857',
  corGradienteFim: '#10b981',
  fotoUrl: null,
  ordem: 0,
  percentualConcluido: '0.4000',
  valorRestante: '6000.00',
  valorMensalSugerido: '428.57',
  mesesRestantes: 14,
  concluida: false,
}

const metaConcluida: MetaResponse = {
  ...metaExemplo,
  id: 2,
  titulo: 'Viagem dos Sonhos',
  valorAlvo: '5000.00',
  valorGuardado: '5000.00',
  percentualConcluido: '1.0000',
  valorRestante: '0.00',
  valorMensalSugerido: null,
  concluida: true,
}

describe('CardMeta', () => {
  it('renderiza título, valores, percentual e barra de progresso', () => {
    render(<CardMeta meta={metaExemplo} />)

    expect(screen.getByRole('heading', { name: 'Reserva de Emergência' })).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*4\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/de R\$\s*10\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()

    const barra = screen.getByRole('progressbar', { name: /progresso da meta reserva de emergência/i })
    expect(barra).toHaveAttribute('aria-valuenow', '40')
  })

  it('exibe ritmo mensal sugerido quando houver prazo', () => {
    render(<CardMeta meta={metaExemplo} />)

    expect(screen.getByText(/R\$\s*428,57\/mês/)).toBeInTheDocument()
  })

  it('exibe badge de concluída quando a meta atingir 100%', () => {
    render(<CardMeta meta={metaConcluida} />)

    expect(screen.getByText(/Concluída/i)).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('valor guardado acima do alvo limita barra, aria e texto a 100%', () => {
    render(
      <CardMeta
        meta={{
          ...metaConcluida,
          valorGuardado: '7500.00',
          percentualConcluido: '1.5000',
        }}
      />,
    )

    const barra = screen.getByRole('progressbar', { name: /progresso da meta/i })
    expect(barra).toHaveAttribute('aria-valuenow', '100')
    expect((barra.firstElementChild as HTMLElement).style.width).toBe('100%')
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.queryByText('150%')).toBeNull()
  })

  it('meta não atingida por pouco (995 de 1000) mostra 99%, nunca 100%', () => {
    render(
      <CardMeta
        meta={{
          ...metaExemplo,
          valorAlvo: '1000.00',
          valorGuardado: '995.00',
          percentualConcluido: '0.9950',
          valorRestante: '5.00',
        }}
      />,
    )

    const barra = screen.getByRole('progressbar', { name: /progresso da meta/i })
    expect(barra).toHaveAttribute('aria-valuenow', '99')
    expect((barra.firstElementChild as HTMLElement).style.width).toBe('99%')
    expect(screen.getByText('99%')).toBeInTheDocument()
    expect(screen.queryByText('100%')).toBeNull()
  })

  it('o percentual não atingido arredonda para baixo (29% fica 29%, 40,9% fica 40%)', () => {
    const { rerender } = render(
      <CardMeta meta={{ ...metaExemplo, percentualConcluido: '0.2900' }} />,
    )
    expect(screen.getByText('29%')).toBeInTheDocument()

    rerender(<CardMeta meta={{ ...metaExemplo, percentualConcluido: '0.4090' }} />)
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('esconde o valor mensal sugerido quando a API manda 0.00 (meta sem prazo)', () => {
    render(
      <CardMeta
        meta={{ ...metaExemplo, prazo: null, valorMensalSugerido: '0.00', mesesRestantes: 0 }}
      />,
    )

    expect(screen.queryByText(/\/mês/)).toBeNull()
    expect(screen.getByText('Sem prazo fixo')).toBeInTheDocument()
  })

  it('aciona callbacks de guardar, resgatar e editar', async () => {
    const user = userEvent.setup()
    const aoGuardar = vi.fn()
    const aoResgatar = vi.fn()
    const aoEditar = vi.fn()

    render(
      <CardMeta
        meta={metaExemplo}
        aoGuardar={aoGuardar}
        aoResgatar={aoResgatar}
        aoEditar={aoEditar}
      />,
    )

    const btnGuardar = screen.getByRole('button', { name: /guardar/i })
    await user.click(btnGuardar)
    expect(aoGuardar).toHaveBeenCalledWith(metaExemplo)

    const btnResgatar = screen.getByRole('button', { name: /resgatar/i })
    await user.click(btnResgatar)
    expect(aoResgatar).toHaveBeenCalledWith(metaExemplo)

    const btnEditar = screen.getByRole('button', { name: /editar reserva de emergência/i })
    await user.click(btnEditar)
    expect(aoEditar).toHaveBeenCalledWith(metaExemplo)
  })
})

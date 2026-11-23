import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { MetaApi } from '../../api/tipos'
import { META_API_EM_ANDAMENTO } from '../../teste/fixturesMetas'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { WidgetMetaInicio } from './WidgetMetaInicio'

// JSON como a API devolve.
const metaExemplo: MetaApi = {
  ...META_API_EM_ANDAMENTO,
  nome: 'Reserva de Emergência',
  valorAlvo: '10000.00',
  valorGuardado: '4500.00',
  presetVisual: 'reserva',
  imagemUrl: null,
  percentualConcluido: '0.4500',
  valorRestante: '5500.00',
  valorMensalSugerido: '392.86',
  mesesRestantes: 14,
}

describe('WidgetMetaInicio', () => {
  it('não renderiza nada quando não houver metas cadastradas', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([])))

    const { container } = renderComApp(<WidgetMetaInicio />, '/')

    // Espera query resolver
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.firstChild).toBeNull()
  })

  it('renderiza card compacto com a meta mais relevante e barra de progresso', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaExemplo])))

    renderComApp(<WidgetMetaInicio />, '/')

    expect(await screen.findByRole('heading', { name: 'Reserva de Emergência' })).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*4\.500,00/i)).toBeInTheDocument()
    expect(screen.getByText(/de R\$\s*10\.000,00/i)).toBeInTheDocument()
    expect(screen.getByText('45%')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /ver metas/i })
    expect(link).toHaveAttribute('href', '/metas')
  })

  it('meta concluída mostra a barra cheia', async () => {
    servidor.use(
      http.get('/api/metas', () =>
        HttpResponse.json([
          {
            ...metaExemplo,
            valorGuardado: '12000.00',
            percentualConcluido: '1.2000',
            valorRestante: '0.00',
            concluida: true,
          },
        ]),
      ),
    )

    renderComApp(<WidgetMetaInicio />, '/')

    await screen.findByRole('heading', { name: 'Reserva de Emergência' })
    const barra = screen.getByRole('progressbar')
    expect(barra).toHaveAttribute('aria-valuenow', '100')
    const preenchimento = barra.firstElementChild as HTMLElement
    expect(preenchimento.style.width).toBe('100%')
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.queryByText('120%')).toBeNull()
  })

  it('meta não atingida por pouco (995 de 1000) mostra 99%, nunca 100%', async () => {
    servidor.use(
      http.get('/api/metas', () =>
        HttpResponse.json([
          {
            ...metaExemplo,
            valorAlvo: '1000.00',
            valorGuardado: '995.00',
            percentualConcluido: '0.9950',
            valorRestante: '5.00',
          },
        ]),
      ),
    )

    renderComApp(<WidgetMetaInicio />, '/')

    await screen.findByRole('heading', { name: 'Reserva de Emergência' })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '99')
    expect(screen.getByText('99%')).toBeInTheDocument()
    expect(screen.queryByText('100%')).toBeNull()
  })
})

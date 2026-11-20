import { screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { WidgetMetaInicio } from './WidgetMetaInicio'

const metaExemplo: MetaResponse = {
  id: 1,
  titulo: 'Reserva de Emergência',
  valorAlvo: '10000.00',
  valorGuardado: '4500.00',
  prazo: '2027-12-31',
  presetVisual: 'reserva',
  icone: 'shield',
  corGradienteInicio: '#047857',
  corGradienteFim: '#10b981',
  fotoUrl: null,
  ordem: 0,
  percentualConcluido: '0.4500',
  valorRestante: '5500.00',
  valorMensalSugerido: '392.86',
  mesesRestantes: 14,
  concluida: false,
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

  it('o ícone fica num tile elevado com o ícone em cor de texto, sem degradê', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaExemplo])))

    const { container } = renderComApp(<WidgetMetaInicio />, '/')

    await screen.findByRole('heading', { name: 'Reserva de Emergência' })
    const tile = container.querySelector('svg')?.parentElement
    expect(tile?.className).toContain('bg-[var(--cor-elevado)]')
    expect(tile?.className).toContain('text-[var(--cor-texto)]')
    expect(tile?.className).not.toContain('--cor-sobre-')
    expect(tile?.getAttribute('style') ?? '').not.toContain('gradient')
  })

  it('a barra usa a cor de dinheiro guardado e o percentual o tom secundário', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaExemplo])))

    renderComApp(<WidgetMetaInicio />, '/')

    await screen.findByRole('heading', { name: 'Reserva de Emergência' })
    const barra = screen.getByRole('progressbar')
    expect(barra.className).toContain('bg-[var(--cor-elevado)]')
    const preenchimento = barra.firstElementChild as HTMLElement
    expect(preenchimento.className).toContain('bg-[var(--cor-grafico-receitas)]')
    expect(preenchimento.style.width).toBe('45%')
    expect(screen.getByText('45%').className).toContain('text-[var(--cor-secundario)]')
  })

  it('meta concluída usa barra positiva, texto de status e nada de emoji', async () => {
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
    expect(preenchimento.className).toContain('bg-[var(--cor-positivo)]')
    expect(preenchimento.style.width).toBe('100%')
    const status = screen.getByText('Concluída')
    expect(status.className).toContain('text-[var(--cor-positivo-texto)]')
    expect(status.textContent).toBe('Concluída')
  })

  it('o código não usa paleta crua nem degradê em classe', () => {
    const arquivo = readFileSync(resolve(process.cwd(), 'src/paginas/metas/WidgetMetaInicio.tsx'), 'utf8')

    expect(arquivo).not.toMatch(/\b(emerald|sky|amber|red|blue)-\d/)
    expect(arquivo).not.toMatch(/(black|white)\//)
    expect(arquivo).not.toMatch(/gradient/)
    expect(arquivo).not.toMatch(/dark:/)
  })

  it('o atalho para /metas tem alvo de 44 px', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaExemplo])))

    renderComApp(<WidgetMetaInicio />, '/')

    const link = await screen.findByRole('link', { name: /ver metas/i })
    expect(link.className).toContain('size-11')
  })
})

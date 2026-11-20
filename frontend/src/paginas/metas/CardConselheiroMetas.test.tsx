import { screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import type { ResumoConselheiroResponse } from '../../api/tipos'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { CardConselheiroMetas } from './CardConselheiroMetas'

const conselheiroComSugestoes: ResumoConselheiroResponse = {
  sobraPrevistaMes: '800.00',
  totalSugeridoAporte: '450.00',
  sugestoes: [
    {
      metaId: 1,
      titulo: 'IPVA 2027',
      presetVisual: 'carro',
      icone: 'car',
      fotoUrl: null,
      valorSugerido: '300.00',
      motivo: 'Meta prioritária com prazo próximo (2 meses)',
    },
    {
      metaId: 2,
      titulo: 'Reserva de Emergência',
      presetVisual: 'reserva',
      icone: 'shield',
      fotoUrl: null,
      valorSugerido: '150.00',
      motivo: 'Construção contínua da reserva',
    },
  ],
}

describe('CardConselheiroMetas', () => {
  it('exibe as sugestões de aporte quando houver sobra prevista e metas ativas', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByRole('heading', { name: /conselheiro de metas/i })).toBeInTheDocument()
    expect(screen.getByText(/IPVA 2027/i)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*300,00/i)).toBeInTheDocument()
    expect(screen.getByText(/Reserva de Emergência/i)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*150,00/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver metas/i })).toHaveAttribute('href', '/metas')
  })

  it('o ícone da sugestão não tem tile colorido nem degradê, só --cor-secundario', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    const { container } = renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    const titulo = await screen.findByRole('heading', { name: 'IPVA 2027' })
    const icone = titulo.closest('div.flex')?.querySelector('span')
    expect(icone?.className).toContain('text-[var(--cor-secundario)]')
    expect(icone?.className).not.toContain('--cor-sobre-')
    expect(icone?.getAttribute('style')).toBeNull()
    expect(container.innerHTML).not.toMatch(/gradient/)
  })

  it('o valor sugerido usa o verde de texto e o card não tem coral', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    const { container } = renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    const valor = await screen.findByText(/\+\s*R\$\s*300,00/)
    expect(valor.className).toContain('text-[var(--cor-positivo-texto)]')
    expect(container.innerHTML).not.toContain('--cor-principal-fundo')
  })

  it('o código não usa paleta crua, preto ou branco com opacidade nem degradê', () => {
    const arquivo = readFileSync(
      resolve(process.cwd(), 'src/paginas/metas/CardConselheiroMetas.tsx'),
      'utf8',
    )

    expect(arquivo).not.toMatch(/(emerald|sky|amber|red|blue)-\d/)
    expect(arquivo).not.toMatch(/(black|white)\//)
    expect(arquivo).not.toMatch(/gradient/i)
    expect(arquivo).not.toMatch(/font-bold/)
  })

  it('exibe mensagem amigável quando a sobra do mês for zero ou negativa', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json({
          sobraPrevistaMes: '0.00',
          totalSugeridoAporte: '0.00',
          sugestoes: [],
        }),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    const aviso = await screen.findByText(/sem sobra prevista para novos aportes/i)
    expect(aviso).toBeInTheDocument()
    expect(aviso.parentElement?.className).toContain('bg-[var(--cor-aviso-fundo)]')
    expect(aviso.parentElement?.className).toContain('text-[var(--cor-aviso-texto)]')
  })

  it('sugere criar uma meta quando houver sobra mas nenhuma meta ativa', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json({
          sobraPrevistaMes: '600.00',
          totalSugeridoAporte: '0.00',
          sugestoes: [],
        }),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText(/você tem sobra prevista este mês/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /criar uma meta/i })
    expect(link).toHaveAttribute('href', '/metas')
    expect(link.className).not.toContain('--cor-principal-fundo')
  })
})

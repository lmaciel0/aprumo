import { screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { MetasPage } from './MetasPage'

const metasMock: MetaResponse[] = [
  {
    id: 1,
    titulo: 'Reserva de Emergência',
    valorAlvo: '10000.00',
    valorGuardado: '3500.00',
    prazo: '2027-12-31',
    presetVisual: 'reserva',
    icone: 'shield',
    corGradienteInicio: '#047857',
    corGradienteFim: '#10b981',
    fotoUrl: null,
    ordem: 0,
    percentualConcluido: '0.3500',
    valorRestante: '6500.00',
    valorMensalSugerido: '464.29',
    mesesRestantes: 14,
    concluida: false,
  },
  {
    id: 2,
    titulo: 'IPVA 2027',
    valorAlvo: '2400.00',
    valorGuardado: '2400.00',
    prazo: '2027-01-31',
    presetVisual: 'carro',
    icone: 'car',
    corGradienteInicio: '#7c3aed',
    corGradienteFim: '#a855f7',
    fotoUrl: null,
    ordem: 1,
    percentualConcluido: '1.0000',
    valorRestante: '0.00',
    valorMensalSugerido: null,
    mesesRestantes: 2,
    concluida: true,
  },
]

describe('MetasPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exibe estado vazio amigável quando não houver metas', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([])))

    renderComApp(<MetasPage />, '/metas')

    expect(await screen.findByRole('heading', { name: /metas/i })).toBeInTheDocument()
    expect(await screen.findByText(/nenhuma meta cadastrada/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar primeira meta/i })).toBeInTheDocument()
  })

  it('estado vazio usa o ícone PiggyBank sem tile verde e o texto não tem "!"', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([])))

    renderComApp(<MetasPage />, '/metas')

    const titulo = await screen.findByText(/nenhuma meta cadastrada/i)
    const bloco = titulo.parentElement as HTMLElement
    const icone = bloco.querySelector('svg.lucide-piggy-bank')
    expect(icone).not.toBeNull()
    expect(icone).toHaveAttribute('aria-hidden', 'true')
    expect(icone?.getAttribute('class')).toContain('text-[var(--cor-mutado)]')
    expect(icone?.parentElement).toBe(bloco)
    expect(bloco.textContent).not.toContain('!')
  })

  it('estado vazio tem um único botão coral: "Criar primeira meta"', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([])))

    renderComApp(<MetasPage />, '/metas')

    const botoes = (await screen.findAllByRole('button')).filter((b) =>
      b.className.includes('--cor-principal-fundo'),
    )
    expect(botoes).toHaveLength(1)
    expect(botoes[0]).toHaveAccessibleName(/criar primeira meta/i)
  })

  it('com metas, o único botão coral é "Nova meta"', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    await screen.findByRole('heading', { name: 'Reserva de Emergência' })
    const botoes = screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('--cor-principal-fundo'))
    expect(botoes).toHaveLength(1)
    expect(botoes[0]).toHaveAccessibleName(/nova meta/i)
  })

  it('o título é 28 px em peso 500 e os totais são cards de número sem tile colorido', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1.className).toContain('text-[28px]')
    expect(h1.className).toContain('font-medium')

    const rotulo = await screen.findByText('Total guardado em metas')
    expect(rotulo.className).toContain('text-[var(--cor-secundario)]')
    const numero = rotulo.nextElementSibling as HTMLElement
    expect(numero.className).toContain('font-medium')
    expect(numero.textContent).toMatch(/R\$\s*5\.900,00/)
    expect(rotulo.closest('.card')).not.toBeNull()
  })

  it('o código não usa paleta crua, preto ou branco com opacidade, degradê, negrito nem alto-relevo', () => {
    const arquivo = readFileSync(resolve(process.cwd(), 'src/paginas/metas/MetasPage.tsx'), 'utf8')

    expect(arquivo).not.toMatch(/(emerald|sky|amber|red|blue)-\d/)
    expect(arquivo).not.toMatch(/(black|white)\//)
    expect(arquivo).not.toMatch(/gradient/i)
    expect(arquivo).not.toMatch(/font-bold/)
    expect(arquivo).not.toMatch(/rounded-(3xl|xl)/)
    expect(arquivo).not.toMatch(/active:scale|transition-all/)
    expect(arquivo).not.toContain('Sparkles')
  })

  it('lista as metas cadastradas e seus valores', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    expect(await screen.findByRole('heading', { name: 'Reserva de Emergência' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'IPVA 2027' })).toBeInTheDocument()
    expect(screen.getByText(/3\.500,00/)).toBeInTheDocument()
  })

  it('abre modal para criação de nova meta ao clicar no botão', async () => {
    const user = userEvent.setup()
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    const btnNova = await screen.findByRole('button', { name: /nova meta/i })
    await user.click(btnNova)

    expect(await screen.findByRole('heading', { name: /nova meta ou caixinha/i })).toBeInTheDocument()
  })
})

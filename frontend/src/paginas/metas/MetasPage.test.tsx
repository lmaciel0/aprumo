import { fireEvent, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('no celular o total ocupa a linha toda e os outros dois ficam lado a lado; de md em diante são 3 colunas', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    const total = (await screen.findByText('Total guardado em metas')).closest('.card') as HTMLElement
    const grade = total.parentElement as HTMLElement
    expect(grade.className).toContain('grid-cols-2')
    expect(grade.className).not.toContain('grid-cols-1')
    expect(grade.className).toContain('md:grid-cols-3')
    expect(total.className).toContain('col-span-2')
    expect(total.className).toContain('md:col-span-1')

    for (const rotulo of ['Metas ativas', 'Objetivos alcançados']) {
      const card = screen.getByText(rotulo).closest('.card') as HTMLElement
      expect(card.className).toContain('!p-3.5')
      expect(card.className).not.toContain('col-span-2')
    }
  })

  it('a página não soma padding próprio ao do main, para o título ficar à mesma distância do cabeçalho das outras telas', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    const raiz = (await screen.findByRole('heading', { level: 1 })).closest('header')?.parentElement as HTMLElement
    expect(raiz.className).not.toMatch(/(^|\s)(\w+:)?p[xyt]?-\d/)
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

  it('re-renderizar a página com o modal aberto não tira o foco do campo que a pessoa está usando', async () => {
    const user = userEvent.setup()
    let chamadas = 0
    servidor.use(
      http.get('/api/metas', () => {
        chamadas += 1
        return chamadas === 1
          ? HttpResponse.json({ mensagem: 'falha' }, { status: 500 })
          : HttpResponse.json([])
      }),
    )

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: /criar primeira meta/i }))
    const titulo = await screen.findByLabelText(/título da meta/i)
    await user.click(titulo)
    expect(titulo).toHaveFocus()

    // "Tentar novamente" refaz a carga (setCarregando) e re-renderiza a página com o modal aberto.
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    await vi.waitFor(() => expect(chamadas).toBe(2))
    await screen.findByText(/nenhuma meta cadastrada/i)

    expect(screen.getByLabelText(/título da meta/i)).toHaveFocus()
  })

  it('editar duas metas em sequência mostra os dados da meta escolhida, não os da anterior', async () => {
    const user = userEvent.setup()
    servidor.use(http.get('/api/metas', () => HttpResponse.json(metasMock)))

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: 'Editar Reserva de Emergência' }))
    expect(await screen.findByLabelText(/título da meta/i)).toHaveValue('Reserva de Emergência')
    expect(screen.getByLabelText(/valor alvo/i)).toHaveValue('10000,00')

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    await user.click(screen.getByRole('button', { name: 'Editar IPVA 2027' }))
    expect(await screen.findByLabelText(/título da meta/i)).toHaveValue('IPVA 2027')
    expect(screen.getByLabelText(/valor alvo/i)).toHaveValue('2400,00')

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    await user.click(screen.getByRole('button', { name: /nova meta/i }))
    expect(await screen.findByLabelText(/título da meta/i)).toHaveValue('')
  })
})

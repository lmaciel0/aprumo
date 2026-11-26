import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import type { ResumoConselheiroApi } from '../../api/tipos'
import {
  CONSELHEIRO_API,
  CONSELHEIRO_API_SEM_SUGESTOES,
  CONSELHEIRO_API_SOBRA_NEGATIVA_COM_METAS,
  META_API_EM_ANDAMENTO,
} from '../../teste/fixturesMetas'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { CardConselheiroMetas } from './CardConselheiroMetas'

// JSON como a API devolve (`sobraMes`, `sugestoes[].nome`, `valorSugerido`, `mesesRestantes`).
const conselheiroComSugestoes: ResumoConselheiroApi = {
  ...CONSELHEIRO_API,
  sobraMes: '800.00',
  sugestoes: [
    { metaId: 1, nome: 'IPVA 2027', valorSugerido: '300.00', mesesRestantes: 2 },
    { metaId: 2, nome: 'Reserva de Emergência', valorSugerido: '150.00', mesesRestantes: 1 },
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

  it('mostra a sobra vinda de sobraMes e o total sugerido somado das sugestões', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText(/Sua sobra prevista é de R\$\s*800,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*450,00/)).toBeInTheDocument()
    expect(screen.getByText('Sobra de R$ 800,00')).toBeInTheDocument()
  })

  it('o motivo da sugestão vem dos meses restantes', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText('Faltam 2 meses')).toBeInTheDocument()
    expect(screen.getByText('Falta 1 mês')).toBeInTheDocument()
  })

  it('sobra negativa com metas ativas esconde sugestões e total e mostra o sugestaoTexto da API', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json(CONSELHEIRO_API_SOBRA_NEGATIVA_COM_METAS),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(
      await screen.findByText(CONSELHEIRO_API_SOBRA_NEGATIVA_COM_METAS.sugestaoTexto),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
    expect(screen.queryByText(/Viagem para Lisboa/)).toBeNull()
    expect(screen.queryByText(/Sugerimos destinar/)).toBeNull()
    expect(screen.queryByText(/461,54/)).toBeNull()
    expect(screen.queryByText(/Sobra de/)).toBeNull()
  })

  it('com sobra positiva mostra as sugestões e não mostra o aviso de excesso', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(conselheiroComSugestoes)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByRole('heading', { name: 'IPVA 2027' })).toBeInTheDocument()
    expect(screen.getByText(/Sugerimos destinar/)).toBeInTheDocument()
    expect(screen.queryByText(/acima da sobra prevista do mês/)).toBeNull()
  })

  it('total sugerido acima da sobra mostra o total da API e a nota de excesso', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json({ ...conselheiroComSugestoes, sobraMes: '300.00' }),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText(/Sua sobra prevista é de R\$\s*300,00/)).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*450,00/)).toBeInTheDocument()
    expect(screen.getByText(/acima da sobra prevista do mês/)).toBeInTheDocument()
  })

  it('o ícone da sugestão vem do preset da meta na lista; sem a meta na lista fica o ícone genérico', async () => {
    servidor.use(
      http.get('/api/metas', () => HttpResponse.json([META_API_EM_ANDAMENTO])),
      http.get('/api/metas/conselheiro', () => HttpResponse.json(CONSELHEIRO_API)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    const viagem = await screen.findByRole('heading', { name: 'Viagem para Lisboa' })
    await vi.waitFor(() =>
      expect(viagem.closest('div.flex')?.querySelector('svg.lucide-plane')).not.toBeNull(),
    )
    const notebook = screen.getByRole('heading', { name: 'Notebook novo' })
    expect(notebook.closest('div.flex')?.querySelector('svg.lucide-target')).not.toBeNull()
  })

  it('exibe mensagem amigável quando a sobra do mês for zero ou negativa', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json({ ...CONSELHEIRO_API_SEM_SUGESTOES, sobraMes: '0.00' }),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText(CONSELHEIRO_API_SEM_SUGESTOES.sugestaoTexto)).toBeInTheDocument()
  })

  it('sugere criar uma meta quando houver sobra mas nenhuma meta ativa', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () =>
        HttpResponse.json({ ...CONSELHEIRO_API_SEM_SUGESTOES, sobraMes: '600.00' }),
      ),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(await screen.findByText(/você tem sobra prevista este mês/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /criar uma meta/i })).toHaveAttribute('href', '/metas')
  })

  it('sobra negativa vinda de sobraMes mostra o aviso e nenhuma sugestão', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(CONSELHEIRO_API_SEM_SUGESTOES)),
    )

    renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    expect(
      await screen.findByText(CONSELHEIRO_API_SEM_SUGESTOES.sugestaoTexto),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })

  it('não usa paleta crua do Tailwind e aplica --cor-positivo-texto nos valores sugeridos', async () => {
    servidor.use(
      http.get('/api/metas/conselheiro', () => HttpResponse.json(CONSELHEIRO_API)),
    )

    const { container } = renderComApp(<CardConselheiroMetas ano={2026} mes={10} />)

    await screen.findByRole('heading', { name: /conselheiro de metas/i })
    expect(container.innerHTML).not.toMatch(
      /\b(?:bg|text|border|from|to)-(?:emerald|green|red|amber|blue|sky|slate|gray)-\d/,
    )
    expect(screen.getByText(/\+\s*R\$\s*461,54/)).toHaveClass('text-[var(--cor-positivo-texto)]')
    expect(screen.getByText(/\+\s*R\$\s*300,00/)).toHaveClass('text-[var(--cor-positivo-texto)]')
  })
})

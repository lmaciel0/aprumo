import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MetaResponse, PontoSerie, ResumoResponse } from '../../api/tipos'
import { AuthProvider } from '../../auth/AuthProvider'
import { RotaProtegida } from '../../auth/RotaProtegida'
import { comSessao, usuarioFicticio } from '../../teste/auth'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { PainelPage } from './PainelPage'

const zeroSerie = (): PontoSerie[] =>
  Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receitas: '0.00',
    receitasPrevistas: '0.00',
    despesas: '0.00',
    despesasPrevistas: '0.00',
  }))

// Valores fictícios.
const resumo: ResumoResponse = {
  receitas: '5000.00',
  despesas: '4200.50',
  sobra: '799.50',
  sobraAno: '-1234.00',
  anterior: { receitas: '4000.00', despesas: '5000.00', sobra: '-1000.00' },
  categorias: [],
  proximas: [
    {
      lancamentoId: 11,
      itemNome: 'Internet',
      categoriaNome: 'Moradia',
      valor: '99.90',
      vencimento: '2026-11-10',
      atrasada: false,
    },
  ],
  serieAno: zeroSerie(),
}

// Valores fictícios.
const metaFicticia: MetaResponse = {
  id: 1,
  titulo: 'Viagem de fim de ano',
  valorAlvo: '3000.00',
  valorGuardado: '750.00',
  prazo: null,
  presetVisual: 'viagem',
  icone: '',
  corGradienteInicio: '',
  corGradienteFim: '',
  fotoUrl: null,
  ordem: 0,
  percentualConcluido: '0.25',
  valorRestante: '2250.00',
  valorMensalSugerido: null,
  mesesRestantes: null,
  concluida: false,
}

function responderResumo() {
  const consultas: string[] = []
  servidor.use(
    http.get('/api/resumo', ({ request }) => {
      consultas.push(new URL(request.url).search)
      return HttpResponse.json(resumo)
    }),
  )
  return consultas
}

/** Só o `Date` é falso: o msw e o `waitFor` seguem com os temporizadores reais. 15:00Z = 12:00 em São Paulo. */
function relogioEm(iso: string) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(iso))
}

function renderizar(rota = '/') {
  renderComApp(
    <AuthProvider>
      <Routes>
        <Route element={<RotaProtegida />}>
          <Route path="/" element={<PainelPage />} />
          <Route path="/financeiro" element={<h1>Visão geral</h1>} />
        </Route>
      </Routes>
    </AuthProvider>,
    rota,
  )
}

afterEach(() => {
  vi.useRealTimers()
})

describe('PainelPage', () => {
  it('mostra o mês como título, sem saudação nem nome, e a data por extenso abaixo', async () => {
    relogioEm('2026-11-20T15:00:00Z')
    comSessao({ ...usuarioFicticio, nome: 'Lucas Maciel' })
    responderResumo()
    renderizar()

    const titulo = await screen.findByRole('heading', { level: 1, name: 'Novembro de 2026' })
    expect(titulo).toHaveClass('font-medium')
    expect(titulo).not.toHaveTextContent(/Bom dia|Boa tarde|Boa noite|Lucas/)
    expect(screen.queryByText(/Bom dia|Boa tarde|Boa noite|Lucas/)).not.toBeInTheDocument()
    const data = screen.getByText('sexta-feira, 20 de novembro')
    expect(data).toHaveClass('text-[var(--cor-secundario)]')
  })

  it('o título é o mesmo com ou sem nome do usuário', async () => {
    relogioEm('2026-11-20T23:00:00Z')
    comSessao({ ...usuarioFicticio, nome: '' })
    responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 1, name: 'Novembro de 2026' })).toBeInTheDocument()
  })

  it('o resumo falhando mostra erro com Tentar de novo e mantém o título', async () => {
    comSessao()
    // Falha até o teste mandar parar: uma consulta que sobrou de teste anterior não pode "gastar" a falha.
    let falhar = true
    servidor.use(
      http.get('/api/resumo', () =>
        falhar ? HttpResponse.json({ erro: 'Falha no servidor.' }, { status: 500 }) : HttpResponse.json(resumo),
      ),
    )
    renderizar()

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveClass('card')
    expect(within(alerta).getByText('Falha no servidor.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /^\p{Lu}\p{L}+ de \d{4}$/u })).toBeInTheDocument()

    falhar = false
    expect(within(alerta).getByRole('button', { name: 'Tentar de novo' })).toHaveClass('bg-[var(--cor-elevado)]', 'text-[var(--cor-texto)]')
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('enquanto carrega mostra "Carregando" e já exibe o título', async () => {
    comSessao()
    servidor.use(http.get('/api/resumo', () => new Promise<never>(() => {})))
    renderizar()

    // O "Carregando…" da sessão também é um status; o do bloco só existe depois que o título aparece.
    expect(await screen.findByRole('heading', { level: 1, name: /^\p{Lu}\p{L}+ de \d{4}$/u })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('com resumo ok mostra os cartões e o link para /financeiro', async () => {
    comSessao()
    responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 2, name: 'Finanças do mês' })).toBeInTheDocument()
    expect(within(await screen.findByRole('region', { name: 'Sobra do mês' })).getByText('R$ 799,50')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Receitas' })).getByText('R$ 5.000,00')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Despesas' })).getByText('R$ 4.200,50')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Próximas contas' })).getByText('Internet')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: /Resultado de cada mês em/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver visão geral' })).toHaveAttribute('href', '/financeiro')
  })

  it('não renderiza o bloco de tarefas de hoje no painel', async () => {
    comSessao()
    responderResumo()
    renderizar()

    expect(await screen.findByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Hoje' })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Nova tarefa para hoje…')).not.toBeInTheDocument()
  })

  it('não mostra seletor de mês nem blocos de tarefas, agenda, projetos ou notas, nem atalhos de acesso rápido', async () => {
    comSessao()
    responderResumo()
    renderizar()

    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(screen.queryByRole('button', { name: /mês/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Acesso rápido' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Personalizar atalhos' })).not.toBeInTheDocument()
    for (const bloco of [/tarefas/i, /agenda/i, /projetos/i, /notas/i]) {
      expect(screen.queryByRole('heading', { name: bloco })).not.toBeInTheDocument()
    }
  })

  it('sem metas, não deixa bloco vazio entre a reflexão e as finanças', async () => {
    responderResumo()
    comSessao()
    renderizar()
    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(document.querySelectorAll('.item-entra:empty')).toHaveLength(0)
  })

  it('com meta, o widget entra escalonado entre a reflexão e as finanças', async () => {
    responderResumo()
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaFicticia])))
    comSessao()
    renderizar()
    const widget = await screen.findByRole('region', { name: metaFicticia.titulo })
    // Espera o resumo terminar: uma consulta pendente cairia no handler do teste seguinte.
    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(widget).toHaveClass('item-entra')
    expect(widget.style.getPropertyValue('--i')).toBe('2')
  })

  it('o bloco de finanças não é um card em volta dos cards', async () => {
    responderResumo()
    comSessao()
    renderizar()
    const bloco = await screen.findByRole('region', { name: 'Finanças do mês' })
    // Espera o resumo terminar: uma consulta pendente cairia no handler do teste seguinte.
    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(bloco).not.toHaveClass('card')
    expect(bloco).not.toHaveClass('item-entra')
  })

  it('abre sem erro com ?ano=2026&mes=10 na URL e consulta o mês atual', async () => {
    relogioEm('2026-11-15T15:00:00Z')
    comSessao()
    const consultas = responderResumo()
    renderizar('/?ano=2026&mes=10')

    expect(await screen.findByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
    await waitFor(() => expect(consultas).toHaveLength(1))
    expect(new URLSearchParams(consultas[0])).toEqual(new URLSearchParams({ ano: '2026', mes: '11' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('PainelPage na virada do mês', () => {
  it('título e finanças mostram o mesmo mês depois da meia-noite de 30/11 para 01/12 (São Paulo)', async () => {
    // 23:59 de 30/11 em São Paulo = 02:59Z de 01/12.
    relogioEm('2026-12-01T02:59:00Z')
    comSessao()
    const consultas = responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 1, name: 'Novembro de 2026' })).toBeInTheDocument()
    await waitFor(() => expect(consultas).toHaveLength(1))
    expect(new URLSearchParams(consultas[0])).toEqual(new URLSearchParams({ ano: '2026', mes: '11' }))

    // 00:01 de 01/12 em São Paulo.
    vi.setSystemTime(new Date('2026-12-01T03:01:00Z'))
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(await screen.findByRole('heading', { level: 1, name: 'Dezembro de 2026' })).toBeInTheDocument()
    await waitFor(() => expect(consultas).toHaveLength(2))
    expect(new URLSearchParams(consultas[1])).toEqual(new URLSearchParams({ ano: '2026', mes: '12' }))
  })
})

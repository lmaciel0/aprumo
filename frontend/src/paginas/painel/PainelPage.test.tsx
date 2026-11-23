import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MetaApi, PontoSerie, ResumoResponse } from '../../api/tipos'
import { META_API_SEM_PRAZO } from '../../teste/fixturesMetas'
import { CARTOES_API, CATEGORIAS_API, RESUMO_API } from '../../teste/fixturesInicio'
import { ATALHOS_PADRAO } from '../../preferencias/preferenciasStorage'
import { CATALOGO_ATALHOS } from './atalhosCatalogo'
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
const metaFicticia: MetaApi = {
  ...META_API_SEM_PRAZO,
  id: 1,
  nome: 'Viagem de fim de ano',
  valorAlvo: '3000.00',
  valorGuardado: '750.00',
  presetVisual: 'viagem',
  percentualConcluido: '0.2500',
  valorRestante: '2250.00',
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
  it('mostra a saudação com o primeiro nome e a data', async () => {
    relogioEm('2026-10-31T15:00:00Z')
    comSessao({ ...usuarioFicticio, nome: 'Lucas Maciel' })
    responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 1, name: 'Boa tarde, Lucas' })).toBeInTheDocument()
    expect(screen.getByText('sábado, 31 de outubro')).toBeInTheDocument()
  })

  it.each(['', '   '])('sem nome (%j) mostra só a saudação, sem vírgula sobrando', async (nome) => {
    relogioEm('2026-10-31T11:00:00Z')
    comSessao({ ...usuarioFicticio, nome })
    responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 1, name: /^Bom dia/ })).toHaveAccessibleName('Bom dia')
  })

  it('nome de uma palavra só não leva espaço nem vírgula a mais', async () => {
    relogioEm('2026-10-31T23:00:00Z')
    comSessao({ ...usuarioFicticio, nome: '  Ana ' })
    responderResumo()
    renderizar()

    expect(await screen.findByRole('heading', { level: 1, name: 'Boa noite, Ana' })).toBeInTheDocument()
  })

  it('o resumo falhando mostra erro com Tentar de novo e mantém a saudação', async () => {
    comSessao()
    // Falha até o teste mandar parar: uma consulta que sobrou de teste anterior não pode "gastar" a falha.
    let falhar = true
    servidor.use(
      http.get('/api/resumo', () =>
        falhar ? HttpResponse.json({ erro: 'Falha no servidor.' }, { status: 500 }) : HttpResponse.json(resumo),
      ),
    )
    renderizar()

    // O bloco "Onde mais gastou" também usa o resumo e mostra o próprio aviso; o das finanças traz a mensagem do servidor.
    const alerta = (await screen.findAllByRole('alert')).find((a) => within(a).queryByText('Falha no servidor.'))!
    expect(alerta).toHaveClass('card')
    expect(within(alerta).getByText('Falha no servidor.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /^(Bom dia|Boa tarde|Boa noite), Ana$/ })).toBeInTheDocument()

    falhar = false
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))

    expect(await screen.findByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('enquanto carrega mostra "Carregando" e já exibe a saudação', async () => {
    comSessao()
    servidor.use(http.get('/api/resumo', () => new Promise<never>(() => {})))
    renderizar()

    // O "Carregando…" da sessão também é um status; o do bloco só existe depois que a saudação aparece.
    expect(await screen.findByRole('heading', { level: 1, name: /, Ana$/ })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Carregando as finanças…' })).toHaveTextContent('Carregando')
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

  it('não mostra seletor de mês nem blocos de tarefas, agenda, projetos ou notas', async () => {
    comSessao()
    responderResumo()
    renderizar()

    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(screen.queryByRole('button', { name: /mês/i })).not.toBeInTheDocument()
    for (const bloco of [/tarefas/i, /agenda/i, /projetos/i, /notas/i]) {
      expect(screen.queryByRole('heading', { name: bloco })).not.toBeInTheDocument()
    }
  })

  it('atalhos aparecem na Início', async () => {
    comSessao()
    responderResumo()
    renderizar()

    const atalhos = await screen.findByRole('region', { name: 'Acesso rápido' })
    for (const id of ATALHOS_PADRAO) {
      expect(within(atalhos).getByRole('link', { name: CATALOGO_ATALHOS[id].rotulo })).toBeInTheDocument()
    }
    expect(within(atalhos).getByRole('button', { name: 'Personalizar atalhos' })).toBeInTheDocument()
    await screen.findByRole('region', { name: 'Sobra do mês' })
  })

  it('blocos na ordem nova', async () => {
    comSessao()
    servidor.use(
      http.get('/api/resumo', () => HttpResponse.json(RESUMO_API)),
      http.get('/api/cartoes', () => HttpResponse.json(CARTOES_API)),
      http.get('/api/categorias', () => HttpResponse.json(CATEGORIAS_API)),
      http.get('/api/metas', () => HttpResponse.json([metaFicticia])),
    )
    renderizar()

    const titulos = [
      await screen.findByRole('region', { name: 'Acesso rápido' }),
      await screen.findByRole('region', { name: 'Sobra do mês' }),
      await screen.findByRole('heading', { level: 2, name: 'Cartão' }),
      await screen.findByRole('heading', { level: 2, name: 'Onde mais gastou' }),
      await screen.findByRole('region', { name: metaFicticia.nome }),
      await screen.findByRole('heading', { level: 2, name: 'Reflexão do dia' }),
    ]
    titulos.slice(1).forEach((titulo, i) => {
      expect(
        titulos[i]!.compareDocumentPosition(titulo) & Node.DOCUMENT_POSITION_FOLLOWING,
        `o bloco ${i} deve vir antes do ${i + 1}`,
      ).toBeTruthy()
    })
  })

  it('erro nos cartões não derruba o resto', async () => {
    comSessao()
    servidor.use(
      http.get('/api/resumo', () => HttpResponse.json(RESUMO_API)),
      http.get('/api/cartoes', () => HttpResponse.json({ erro: 'Falha no servidor.' }, { status: 500 })),
      http.get('/api/categorias', () => HttpResponse.json(CATEGORIAS_API)),
    )
    renderizar()

    expect(await screen.findByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: 'Onde mais gastou' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sobra do mês' })).toBeInTheDocument()
  })

  it('sem metas, não deixa bloco vazio na tela', async () => {
    responderResumo()
    comSessao()
    renderizar()
    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(document.querySelectorAll('.item-entra:empty')).toHaveLength(0)
  })

  it('com meta, o widget entra escalonado depois dos blocos de dinheiro', async () => {
    responderResumo()
    servidor.use(http.get('/api/metas', () => HttpResponse.json([metaFicticia])))
    comSessao()
    renderizar()
    const widget = await screen.findByRole('region', { name: metaFicticia.nome })
    // Espera o resumo terminar: uma consulta pendente cairia no handler do teste seguinte.
    await screen.findByRole('region', { name: 'Sobra do mês' })
    expect(widget).toHaveClass('item-entra')
    expect(widget.style.getPropertyValue('--i')).toBe('3')
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

  it('os atalhos levam o mês atual, não o ?ano=&mes= da URL', async () => {
    relogioEm('2026-11-15T15:00:00Z')
    comSessao()
    responderResumo()
    renderizar('/?ano=2026&mes=10')

    const atalhos = await screen.findByRole('region', { name: 'Acesso rápido' })
    expect(within(atalhos).getByRole('link', { name: 'Cartões' })).toHaveAttribute('href', '/cartoes?ano=2026&mes=11')
    expect(within(atalhos).getByRole('link', { name: '+ Despesa' })).toHaveAttribute(
      'href',
      '/lancamentos/novo?ano=2026&mes=11',
    )
    await screen.findByRole('region', { name: 'Sobra do mês' })
  })

  it('limita Próximas contas a 5 e oferece o link Ver todas para /financeiro', async () => {
    comSessao()
    const proximas = Array.from({ length: 6 }, (_, i) => ({
      lancamentoId: 200 + i,
      itemNome: `Conta ${i + 1}`,
      categoriaNome: 'Moradia',
      valor: '10.00',
      vencimento: `2026-11-${String(20 + i).padStart(2, '0')}`,
      atrasada: false,
    }))
    servidor.use(http.get('/api/resumo', () => HttpResponse.json({ ...resumo, proximas })))
    renderizar()

    const bloco = await screen.findByRole('region', { name: 'Próximas contas' })
    expect(within(bloco).getAllByRole('listitem')).toHaveLength(5)
    expect(within(bloco).queryByText('Conta 6')).not.toBeInTheDocument()
    expect(within(bloco).getByRole('link', { name: 'Ver todas' })).toHaveAttribute('href', '/financeiro')
  })
})

describe('PainelPage na virada do mês', () => {
  it('data e finanças passam para o mês novo ao voltar para o app depois da meia-noite de 30/11 para 01/12 (São Paulo)', async () => {
    // 23:59 de 30/11 em São Paulo = 02:59Z de 01/12.
    relogioEm('2026-12-01T02:59:00Z')
    comSessao()
    const consultas = responderResumo()
    renderizar()

    expect(await screen.findByText('segunda-feira, 30 de novembro')).toBeInTheDocument()
    await waitFor(() => expect(consultas).toHaveLength(1))
    expect(new URLSearchParams(consultas[0])).toEqual(new URLSearchParams({ ano: '2026', mes: '11' }))

    // 00:01 de 01/12 em São Paulo.
    vi.setSystemTime(new Date('2026-12-01T03:01:00Z'))
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(await screen.findByText('terça-feira, 1 de dezembro')).toBeInTheDocument()
    await waitFor(() => expect(consultas).toHaveLength(2))
    expect(new URLSearchParams(consultas[1])).toEqual(new URLSearchParams({ ano: '2026', mes: '12' }))
  })
})

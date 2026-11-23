import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MetaApi } from '../../api/tipos'
import { META_API_CONCLUIDA, META_API_EM_ANDAMENTO, META_API_SEM_PRAZO } from '../../teste/fixturesMetas'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { MetasPage } from './MetasPage'

// JSON como a API devolve (campo `nome`, prazo em `mesAlvo`/`anoAlvo`), a partir das fixtures reais.
const metasMock: MetaApi[] = [
  {
    ...META_API_EM_ANDAMENTO,
    id: 1,
    nome: 'Reserva de Emergência',
    valorAlvo: '10000.00',
    valorGuardado: '3500.00',
    presetVisual: 'reserva',
    imagemUrl: null,
    ordem: 0,
    percentualConcluido: '0.3500',
    valorRestante: '6500.00',
    mesesRestantes: 14,
    valorMensalSugerido: '464.29',
  },
  {
    ...META_API_CONCLUIDA,
    id: 2,
    nome: 'IPVA 2027',
    valorAlvo: '2400.00',
    valorGuardado: '2400.00',
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
    expect(screen.getByRole('button', { name: /criar primeira meta/i })).toHaveClass('min-h-11')
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
    expect(btnNova).toHaveClass('min-h-11')
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

    await user.click(screen.getByRole('button', { name: /^fechar/i }))
    await user.click(screen.getByRole('button', { name: 'Editar IPVA 2027' }))
    expect(await screen.findByLabelText(/título da meta/i)).toHaveValue('IPVA 2027')
    expect(screen.getByLabelText(/valor alvo/i)).toHaveValue('2400,00')

    await user.click(screen.getByRole('button', { name: /^fechar/i }))
    await user.click(screen.getByRole('button', { name: /nova meta/i }))
    expect(await screen.findByLabelText(/título da meta/i)).toHaveValue('')
  })

  it('criar meta envia o corpo da API (nome, mesAlvo, anoAlvo) e mostra a meta criada com o título', async () => {
    const user = userEvent.setup()
    let corpo: Record<string, unknown> | undefined
    const guardadas: MetaApi[] = []
    servidor.use(
      http.get('/api/metas', () => HttpResponse.json(guardadas)),
      http.post('/api/metas', async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        const criada: MetaApi = {
          ...META_API_SEM_PRAZO,
          id: 9,
          nome: String(corpo.nome),
          valorAlvo: String(corpo.valorAlvo),
          mesAlvo: corpo.mesAlvo as number,
          anoAlvo: corpo.anoAlvo as number,
        }
        guardadas.push(criada)
        return HttpResponse.json(criada, { status: 201 })
      }),
    )

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: /criar primeira meta/i }))
    await user.type(await screen.findByLabelText(/título da meta/i), 'Notebook novo')
    await user.type(screen.getByLabelText(/valor alvo/i), '4500,50')
    fireEvent.change(screen.getByLabelText(/prazo estimado/i), { target: { value: '2028-03' } })
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))

    expect(await screen.findByRole('heading', { name: 'Notebook novo' })).toBeInTheDocument()
    expect(corpo).toMatchObject({ nome: 'Notebook novo', valorAlvo: '4500.50', mesAlvo: 3, anoAlvo: 2028 })
    for (const campo of ['titulo', 'prazo', 'fotoUrl', 'icone']) {
      expect(corpo).not.toHaveProperty(campo)
    }
  })

  it('criar meta sem prazo envia mesAlvo e anoAlvo nulos', async () => {
    const user = userEvent.setup()
    let corpo: Record<string, unknown> | undefined
    servidor.use(
      http.post('/api/metas', async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(META_API_SEM_PRAZO, { status: 201 })
      }),
    )

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: /criar primeira meta/i }))
    await user.type(await screen.findByLabelText(/título da meta/i), 'Reserva de emergência')
    await user.type(screen.getByLabelText(/valor alvo/i), '5000')
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))

    await vi.waitFor(() => expect(corpo).toBeDefined())
    expect(corpo).toMatchObject({ nome: 'Reserva de emergência', mesAlvo: null, anoAlvo: null })
  })

  it('editar mantém prazo, foto e preset: preenche o mês e o PUT leva todos os campos da API', async () => {
    const user = userEvent.setup()
    let corpo: Record<string, unknown> | undefined
    servidor.use(
      http.get('/api/metas', () => HttpResponse.json([META_API_EM_ANDAMENTO])),
      http.put('/api/metas/1', async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(META_API_EM_ANDAMENTO)
      }),
    )

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: 'Editar Viagem para Lisboa' }))
    expect(await screen.findByLabelText(/prazo estimado/i)).toHaveValue('2027-12')
    expect(screen.getByLabelText(/foto/i)).toHaveValue('https://exemplo.com/lisboa.jpg')

    await user.click(screen.getByRole('button', { name: /salvar meta/i }))

    await vi.waitFor(() => expect(corpo).toBeDefined())
    expect(corpo).toMatchObject({
      nome: 'Viagem para Lisboa',
      valorAlvo: '10000.00',
      mesAlvo: 12,
      anoAlvo: 2027,
      presetVisual: 'viagem',
      imagemUrl: 'https://exemplo.com/lisboa.jpg',
    })
    for (const campo of ['titulo', 'prazo', 'fotoUrl', 'icone']) {
      expect(corpo).not.toHaveProperty(campo)
    }
  })

  it('editar meta sem prazo abre o campo de mês vazio', async () => {
    const user = userEvent.setup()
    servidor.use(http.get('/api/metas', () => HttpResponse.json([META_API_SEM_PRAZO])))

    renderComApp(<MetasPage />, '/metas')

    await user.click(await screen.findByRole('button', { name: 'Editar Reserva de emergência' }))
    expect(await screen.findByLabelText(/prazo estimado/i)).toHaveValue('')
  })

  it('lista o título vindo de nome e o card mostra o prazo vindo de mesAlvo e anoAlvo', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([META_API_EM_ANDAMENTO, META_API_SEM_PRAZO])))

    renderComApp(<MetasPage />, '/metas')

    expect(await screen.findByRole('heading', { name: 'Viagem para Lisboa' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reserva de emergência' })).toBeInTheDocument()
    expect(screen.getByText(/dez\.? de 2027/i)).toBeInTheDocument()
    expect(screen.getByText('Sem prazo fixo')).toBeInTheDocument()
  })
})

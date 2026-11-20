import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import {
  CONSELHEIRO_API,
  META_API_CONCLUIDA,
  META_API_EM_ANDAMENTO,
  META_API_SEM_PRAZO,
} from '../teste/fixturesMetas'
import { servidor } from '../teste/servidor'
import { endpoints } from './endpoints'

describe('endpoints.metas', () => {
  it('listar converte cada meta da API para a UI', async () => {
    servidor.use(http.get('/api/metas', () => HttpResponse.json([META_API_EM_ANDAMENTO, META_API_SEM_PRAZO])))

    const metas = await endpoints.metas.listar()

    expect(metas.map((m) => m.titulo)).toEqual(['Viagem para Lisboa', 'Reserva de emergência'])
    expect(metas[0]?.prazo).toBe('2027-12-01')
    expect(metas[1]?.prazo).toBeNull()
  })

  it('criar faz POST com o corpo da API e devolve a meta da UI', async () => {
    let corpo: unknown
    servidor.use(
      http.post('/api/metas', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json(META_API_EM_ANDAMENTO, { status: 201 })
      }),
    )

    const meta = await endpoints.metas.criar({
      titulo: 'Viagem para Lisboa',
      valorAlvo: '10000.00',
      valorGuardado: '4000.00',
      prazo: '2027-12-01',
      presetVisual: 'viagem',
      icone: 'plane',
      fotoUrl: 'https://exemplo.com/lisboa.jpg',
    })

    expect(corpo).toEqual({
      nome: 'Viagem para Lisboa',
      valorAlvo: '10000.00',
      valorGuardado: '4000.00',
      mesAlvo: 12,
      anoAlvo: 2027,
      presetVisual: 'viagem',
      imagemUrl: 'https://exemplo.com/lisboa.jpg',
      corGradiente: null,
      ordem: null,
    })
    expect(meta.titulo).toBe('Viagem para Lisboa')
    expect(meta.fotoUrl).toBe('https://exemplo.com/lisboa.jpg')
  })

  it('atualizar faz PUT em /api/metas/{id} com o corpo da API, sem prazo = nulos', async () => {
    let corpo: unknown
    servidor.use(
      http.put('/api/metas/3', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json(META_API_SEM_PRAZO)
      }),
    )

    const meta = await endpoints.metas.atualizar(3, {
      titulo: 'Reserva de emergência',
      valorAlvo: '5000.00',
      prazo: null,
      presetVisual: 'personalizado',
      icone: 'target',
      fotoUrl: null,
    })

    expect(corpo).toMatchObject({ nome: 'Reserva de emergência', mesAlvo: null, anoAlvo: null, imagemUrl: null })
    expect(meta.titulo).toBe('Reserva de emergência')
  })

  it.each([
    ['guardar', '/api/metas/2/guardar'],
    ['resgatar', '/api/metas/2/resgatar'],
  ] as const)('%s faz PATCH com {valor} e devolve a meta da UI', async (acao, caminho) => {
    let corpo: unknown
    servidor.use(
      http.patch(caminho, async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json(META_API_CONCLUIDA)
      }),
    )

    const meta = await endpoints.metas[acao](2, { valor: '150.00' })

    expect(corpo).toEqual({ valor: '150.00' })
    expect(meta.titulo).toBe('IPVA 2027')
  })

  it('conselheiro consulta ano e mês e converte para a UI', async () => {
    let busca = ''
    servidor.use(
      http.get('/api/metas/conselheiro', ({ request }) => {
        busca = new URL(request.url).search
        return HttpResponse.json(CONSELHEIRO_API)
      }),
    )

    const resumo = await endpoints.metas.conselheiro(2026, 11)

    expect(busca).toBe('?ano=2026&mes=11')
    expect(resumo.sobraPrevistaMes).toBe('1250.00')
    expect(resumo.totalSugeridoAporte).toBe('761.54')
    expect(resumo.sugestoes[0]?.titulo).toBe('Viagem para Lisboa')
  })
})

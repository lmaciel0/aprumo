import { describe, expect, it } from 'vitest'
import {
  CONSELHEIRO_API,
  CONSELHEIRO_API_SEM_SUGESTOES,
  META_API_CONCLUIDA,
  META_API_EM_ANDAMENTO,
  META_API_SEM_PRAZO,
} from '../teste/fixturesMetas'
import { conselheiroDaApi, metaDaApi, metaParaApi } from './adaptadorMetas'

describe('metaDaApi', () => {
  it('converte a meta da API no formato da UI', () => {
    expect(metaDaApi(META_API_EM_ANDAMENTO)).toEqual({
      id: 1,
      titulo: 'Viagem para Lisboa',
      valorAlvo: '10000.00',
      valorGuardado: '4000.00',
      prazo: '2027-12-01',
      presetVisual: 'viagem',
      icone: 'plane',
      fotoUrl: 'https://exemplo.com/lisboa.jpg',
      ordem: 0,
      percentualConcluido: '0.4000',
      valorRestante: '6000.00',
      valorMensalSugerido: '461.54',
      mesesRestantes: 13,
      concluida: false,
    })
  })

  it('prazo usa o primeiro dia do mês alvo, com mês de dois dígitos', () => {
    expect(metaDaApi(META_API_CONCLUIDA).prazo).toBe('2027-01-01')
  })

  it('meta concluída mantém concluida e o ícone do preset', () => {
    const meta = metaDaApi(META_API_CONCLUIDA)
    expect(meta.concluida).toBe(true)
    expect(meta.icone).toBe('car')
    expect(meta.fotoUrl).toBeNull()
  })

  it('sem mês e ano alvo, prazo é null', () => {
    expect(metaDaApi(META_API_SEM_PRAZO).prazo).toBeNull()
  })

  it('preset nulo vira personalizado, com o ícone dele', () => {
    const meta = metaDaApi(META_API_SEM_PRAZO)
    expect(meta.presetVisual).toBe('personalizado')
    expect(meta.icone).toBe('target')
  })

  it('preset desconhecido mantém o id e usa o ícone de personalizado', () => {
    const meta = metaDaApi({ ...META_API_EM_ANDAMENTO, presetVisual: 'antigo' })
    expect(meta.presetVisual).toBe('antigo')
    expect(meta.icone).toBe('target')
  })

  it('não carrega campos que a UI não usa', () => {
    const meta = metaDaApi(META_API_EM_ANDAMENTO) as unknown as Record<string, unknown>
    for (const campo of ['nome', 'mesAlvo', 'anoAlvo', 'imagemUrl', 'corGradiente']) {
      expect(meta).not.toHaveProperty(campo)
    }
  })
})

describe('metaParaApi', () => {
  it('converte o formulário da UI no corpo que a API aceita', () => {
    expect(
      metaParaApi({
        titulo: 'Viagem para Lisboa',
        valorAlvo: '10000.00',
        valorGuardado: '4000.00',
        prazo: '2027-12-01',
        presetVisual: 'viagem',
        icone: 'plane',
        fotoUrl: 'https://exemplo.com/lisboa.jpg',
        ordem: 3,
      }),
    ).toEqual({
      nome: 'Viagem para Lisboa',
      valorAlvo: '10000.00',
      valorGuardado: '4000.00',
      mesAlvo: 12,
      anoAlvo: 2027,
      presetVisual: 'viagem',
      imagemUrl: 'https://exemplo.com/lisboa.jpg',
      corGradiente: null,
      ordem: 3,
    })
  })

  it('não envia titulo, prazo, fotoUrl nem icone', () => {
    const corpo = metaParaApi({ titulo: 'X', valorAlvo: '1.00', prazo: '2027-01-01', icone: 'car', fotoUrl: null })
    for (const campo of ['titulo', 'prazo', 'fotoUrl', 'icone']) {
      expect(corpo).not.toHaveProperty(campo)
    }
  })

  it('sem prazo manda mesAlvo e anoAlvo nulos', () => {
    for (const prazo of [null, undefined, '']) {
      const corpo = metaParaApi({ titulo: 'Reserva', valorAlvo: '5000.00', prazo })
      expect(corpo.mesAlvo).toBeNull()
      expect(corpo.anoAlvo).toBeNull()
    }
  })

  it('aceita prazo só com mês e ano (AAAA-MM)', () => {
    const corpo = metaParaApi({ titulo: 'Reserva', valorAlvo: '5000.00', prazo: '2028-03' })
    expect(corpo.mesAlvo).toBe(3)
    expect(corpo.anoAlvo).toBe(2028)
  })

  it('campos opcionais ausentes viram null', () => {
    expect(metaParaApi({ titulo: 'Reserva', valorAlvo: '5000.00' })).toEqual({
      nome: 'Reserva',
      valorAlvo: '5000.00',
      valorGuardado: null,
      mesAlvo: null,
      anoAlvo: null,
      presetVisual: null,
      imagemUrl: null,
      corGradiente: null,
      ordem: null,
    })
  })

  it('ida e volta preserva título, prazo, preset e foto', () => {
    const ui = metaDaApi(META_API_EM_ANDAMENTO)
    const corpo = metaParaApi(ui)
    expect(corpo).toMatchObject({
      nome: META_API_EM_ANDAMENTO.nome,
      mesAlvo: META_API_EM_ANDAMENTO.mesAlvo,
      anoAlvo: META_API_EM_ANDAMENTO.anoAlvo,
      presetVisual: META_API_EM_ANDAMENTO.presetVisual,
      imagemUrl: META_API_EM_ANDAMENTO.imagemUrl,
    })
  })
})

describe('conselheiroDaApi', () => {
  it('mapeia sobra, soma das sugestões e o nome de cada meta', () => {
    const resumo = conselheiroDaApi(CONSELHEIRO_API)
    expect(resumo.sobraPrevistaMes).toBe('1250.00')
    expect(resumo.totalSugeridoAporte).toBe('761.54')
    expect(resumo.sugestoes).toHaveLength(2)
    expect(resumo.sugestoes[0]).toMatchObject({ metaId: 1, titulo: 'Viagem para Lisboa', valorSugerido: '461.54' })
    expect(resumo.sugestoes[1]).toMatchObject({ metaId: 4, titulo: 'Notebook novo', valorSugerido: '300.00' })
  })

  it('motivo vem dos meses restantes; preset, ícone e foto ficam no padrão', () => {
    const [primeira, segunda] = conselheiroDaApi(CONSELHEIRO_API).sugestoes
    expect(primeira).toMatchObject({ motivo: 'Faltam 13 meses', presetVisual: 'personalizado', icone: 'target', fotoUrl: null })
    expect(segunda?.motivo).toBe('Falta 1 mês')
  })

  it('sem sugestões e com sobra negativa: total zero e sobra negativa mantida', () => {
    expect(conselheiroDaApi(CONSELHEIRO_API_SEM_SUGESTOES)).toEqual({
      sobraPrevistaMes: '-350.00',
      totalSugeridoAporte: '0.00',
      sugestoes: [],
    })
  })

  it('soma em centavos, sem erro de ponto flutuante', () => {
    const resumo = conselheiroDaApi({
      ...CONSELHEIRO_API,
      sugestoes: [
        { metaId: 1, nome: 'A', valorSugerido: '0.10', mesesRestantes: 2 },
        { metaId: 2, nome: 'B', valorSugerido: '0.20', mesesRestantes: 2 },
      ],
    })
    expect(resumo.totalSugeridoAporte).toBe('0.30')
  })
})

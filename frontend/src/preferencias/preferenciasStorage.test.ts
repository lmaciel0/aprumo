import { describe, it, expect, beforeEach } from 'vitest'
import {
  lerPreferenciasSalvas,
  gravarPreferencias,
  PREFERENCIAS_PADRAO,
  CHAVE_PREFERENCIAS,
} from './preferenciasStorage'

describe('preferenciasStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retorna os valores padrão quando nada foi gravado', () => {
    expect(lerPreferenciasSalvas()).toEqual(PREFERENCIAS_PADRAO)
  })

  it('grava e recupera as preferências salvas corretamente', () => {
    const custom = {
      modoTema: 'escuro' as const,
      presetCor: 'lima' as const,
      layoutLargura: 'largura-total' as const,
      barraFixa: false,
      dockRecolhida: true,
      atalhosMobile: ['cartoes', 'orcamento', 'nova-receita', 'nova-nota'] as const,
      cartaoInicioId: 5,
    }
    gravarPreferencias(custom as unknown as Parameters<typeof gravarPreferencias>[0])
    expect(lerPreferenciasSalvas()).toEqual(custom)
  })

  it('recupera valores padrão quando o JSON armazenado é inválido', () => {
    localStorage.setItem(CHAVE_PREFERENCIAS, '{ jsonInvalido ...')
    expect(lerPreferenciasSalvas()).toEqual(PREFERENCIAS_PADRAO)
  })

  it('migra tema antigo salvo em aprumo-tema se não houver preferências', () => {
    localStorage.setItem('aprumo-tema', 'escuro')
    const lido = lerPreferenciasSalvas()
    expect(lido.modoTema).toBe('escuro')
    expect(lido.presetCor).toBe('azul')
  })

  it('migra atalhos de tarefas e projetos removidos preservando os válidos e preenchendo com padrões até 4', () => {
    localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({
        ...PREFERENCIAS_PADRAO,
        atalhosMobile: ['novo-lancamento', 'nova-tarefa', 'cartoes', 'projetos'],
      }),
    )
    const lido = lerPreferenciasSalvas()
    expect(lido.atalhosMobile).toEqual(['novo-lancamento', 'cartoes', 'nova-receita', 'nova-nota'])
  })

  it('cartaoInicioId começa nulo', () => {
    expect(lerPreferenciasSalvas().cartaoInicioId).toBeNull()
  })

  it('lê cartaoInicioId salvo', () => {
    localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ ...PREFERENCIAS_PADRAO, cartaoInicioId: 7 }))
    expect(lerPreferenciasSalvas().cartaoInicioId).toBe(7)
  })

  it('descarta cartaoInicioId inválido', () => {
    for (const invalido of ['7', -1, 2.5, 0]) {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ ...PREFERENCIAS_PADRAO, cartaoInicioId: invalido }))
      expect(lerPreferenciasSalvas().cartaoInicioId).toBeNull()
    }
  })

  it('preferência antiga sem o campo continua válida', () => {
    localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({
        modoTema: 'escuro',
        presetCor: 'lima',
        layoutLargura: 'centralizado',
        barraFixa: true,
        dockRecolhida: false,
        atalhosMobile: ['cartoes', 'orcamento', 'nova-receita', 'nova-nota'],
      }),
    )
    const lido = lerPreferenciasSalvas()
    expect(lido.cartaoInicioId).toBeNull()
    expect(lido.atalhosMobile).toEqual(['cartoes', 'orcamento', 'nova-receita', 'nova-nota'])
  })
})

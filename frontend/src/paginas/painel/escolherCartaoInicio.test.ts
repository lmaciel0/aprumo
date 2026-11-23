import { describe, expect, it } from 'vitest'
import type { CartaoResponse } from '../../api/tipos'
import { escolherCartaoInicio } from './escolherCartaoInicio'

const BASE: CartaoResponse = {
  itemId: 0,
  nome: 'Base',
  diaVencimento: 10,
  fatura: '0.00',
  limite: '1000.00',
  uso: '0.1000',
  faixa: 'VERDE',
  titular: null,
}

function comFaturas(...faturas: string[]): CartaoResponse[] {
  return faturas.map((fatura, i) => ({ ...BASE, itemId: 100 + i, nome: `Cartão ${i}`, fatura }))
}

describe('escolherCartaoInicio', () => {
  it('devolve o cartão preferido', () => {
    const cartoes = comFaturas('100.00', '1240.50', '99.90')
    expect(escolherCartaoInicio(cartoes, cartoes[2]!.itemId)).toBe(cartoes[2])
  })

  it('sem preferência, devolve o de maior fatura', () => {
    const cartoes = comFaturas('100.00', '1240.50', '99.90')
    expect(escolherCartaoInicio(cartoes, null)).toBe(cartoes[1])
  })

  it('preferido removido cai no de maior fatura', () => {
    const cartoes = comFaturas('100.00', '1240.50', '99.90')
    expect(escolherCartaoInicio(cartoes, 9999)).toBe(cartoes[1])
  })

  it('empate fica com o primeiro', () => {
    const cartoes = comFaturas('500.00', '500.00', '10.00')
    expect(escolherCartaoInicio(cartoes, null)).toBe(cartoes[0])
  })

  it('lista vazia devolve null', () => {
    expect(escolherCartaoInicio([], null)).toBeNull()
    expect(escolherCartaoInicio([], 1)).toBeNull()
  })
})

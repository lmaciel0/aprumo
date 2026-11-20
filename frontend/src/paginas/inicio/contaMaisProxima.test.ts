import { describe, expect, it } from 'vitest'
import { indiceContaMaisProxima } from './contaMaisProxima'

const conta = (vencimento: string) => ({ vencimento })
// 15/11/2026, meio-dia em São Paulo.
const hoje = new Date('2026-11-15T15:00:00Z')

describe('indiceContaMaisProxima', () => {
  it('lista vazia devolve -1', () => {
    expect(indiceContaMaisProxima([], hoje)).toBe(-1)
  })

  it('todas vencidas devolve -1', () => {
    expect(indiceContaMaisProxima([conta('2026-11-10'), conta('2026-11-14')], hoje)).toBe(-1)
  })

  it('vencimento igual a hoje é a mais próxima', () => {
    expect(indiceContaMaisProxima([conta('2026-11-10'), conta('2026-11-15'), conta('2026-11-20')], hoje)).toBe(1)
  })

  it('mistura devolve a primeira com vencimento de hoje em diante', () => {
    expect(indiceContaMaisProxima([conta('2026-11-01'), conta('2026-11-16'), conta('2026-12-01')], hoje)).toBe(1)
  })

  it('usa a data local de São Paulo, não a UTC', () => {
    // 16/11 01:30 UTC ainda é 15/11 22:30 em São Paulo.
    const noite = new Date('2026-11-16T01:30:00Z')
    expect(indiceContaMaisProxima([conta('2026-11-15')], noite)).toBe(0)
  })
})

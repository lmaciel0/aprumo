import { describe, expect, it } from 'vitest'
import { dataPorExtenso, tituloDoMes } from './saudacao'

// São Paulo é UTC-3 o ano todo (sem horário de verão desde 2019); as datas abaixo estão em UTC.
describe('tituloDoMes', () => {
  it('formata Novembro de 2026 com o mês em maiúscula inicial', () => {
    expect(tituloDoMes(new Date('2026-11-20T15:00:00Z'))).toBe('Novembro de 2026')
  })

  it('usa o mês de São Paulo, não o de UTC', () => {
    expect(tituloDoMes(new Date('2026-12-01T01:30:00Z'))).toBe('Novembro de 2026')
    expect(tituloDoMes(new Date('2026-12-01T02:00:00Z'))).toBe('Novembro de 2026')
    expect(tituloDoMes(new Date('2026-12-01T03:00:00Z'))).toBe('Dezembro de 2026')
    expect(tituloDoMes(new Date('2026-03-15T12:00:00Z'))).toBe('Março de 2026')
  })
})

describe('dataPorExtenso', () => {
  it('formata sábado, 31 de outubro', () => {
    expect(dataPorExtenso(new Date('2026-10-31T15:00:00Z'))).toBe('sábado, 31 de outubro')
  })

  it('usa o dia de São Paulo, não o de UTC', () => {
    expect(dataPorExtenso(new Date('2026-11-01T01:30:00Z'))).toBe('sábado, 31 de outubro')
  })
})

import { describe, expect, it } from 'vitest'
import { materialDoBanco, rotuloDoBanco } from './coresBancos'

// Tom claro, tom escuro e texto de cada banco. Onde a tabela do plano não dava 4,5:1 nos dois tons, o texto
// (ou o tom escuro, no ShopeePay) foi ajustado; o motivo está em coresBancos.ts.
const BANCOS: Array<[string, string, string, string]> = [
  ['Nubank', '#8A05BE', '#5B0380', '#F4EDE0'],
  ['Inter', '#FF7A00', '#D45F00', '#000000'],
  ['Itaú', '#EC7000', '#C25A00', '#000000'],
  ['Bradesco', '#CC092F', '#8E0620', '#F4EDE0'],
  ['Santander', '#EC0000', '#B00000', '#FFFFFF'],
  ['American Express', '#2E77BB', '#1F5A91', '#FFFFFF'],
  ['C6 Bank', '#2B2B2B', '#141414', '#EDEDED'],
  ['Caixa', '#005CA9', '#003F75', '#F4EDE0'],
  ['Mercado Pago', '#00B1EA', '#0090C1', '#000000'],
  ['Banco do Brasil', '#FCFC30', '#E3E32A', '#14213D'],
  ['PicPay', '#21C25E', '#18A04C', '#14213D'],
  ['ShopeePay', '#EE4D2D', '#D84626', '#000000'],
]

const gradiente = (claro: string, escuro: string) => `linear-gradient(135deg, ${claro}, ${escuro})`

function luminancia(hex: string): number {
  const canal = (i: number): number => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5)
}

function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const NEUTRO = {
  fundo: 'linear-gradient(135deg, var(--cor-elevado), var(--cor-card))',
  texto: 'var(--cor-texto)',
  neutro: true,
}

describe('materialDoBanco', () => {
  it.each(BANCOS)('%s devolve o material do próprio banco', (nome, claro, escuro, texto) => {
    expect(materialDoBanco(nome)).toEqual({ fundo: gradiente(claro, escuro), texto, neutro: false })
  })

  it.each([
    ['Itaú Uniclass', 'Itaú'],
    ['ITAU Personnalite', 'Itaú'],
    ['Uniclass', 'Itaú'],
    ['Amex Gold', 'American Express'],
    ['BB Ourocard', 'Banco do Brasil'],
    ['Cartão Banco do Brasil', 'Banco do Brasil'],
    ['Shopee', 'ShopeePay'],
    ['Nubank Ultravioleta', 'Nubank'],
    ['Banco Inter', 'Inter'],
    ['c6 carbon', 'C6 Bank'],
    ['C6Bank', 'C6 Bank'],
    ['C6 Bank', 'C6 Bank'],
    ['c6bank black', 'C6 Bank'],
  ])('"%s" casa com %s, sem depender de acento nem de caixa', (nome, banco) => {
    const esperado = BANCOS.find(([n]) => n === banco)!
    expect(materialDoBanco(nome).fundo).toBe(gradiente(esperado[1], esperado[2]))
    expect(rotuloDoBanco(nome)).toBe(banco)
  })

  it('nome que casa com dois bancos escolhe o primeiro da lista, sempre', () => {
    expect(materialDoBanco('Itaú Nubank')).toEqual(materialDoBanco('Nubank'))
    expect(materialDoBanco('Nubank Itaú')).toEqual(materialDoBanco('Nubank'))
  })

  it.each(['', '   ', 'Cartão Loja', 'Cartão Roxo', 'Cartão Azul', 'Cartão Verde', 'Cartão Vermelho', 'Ultravioleta', 'abc6x'])(
    '"%s" é neutro, com variáveis de tema',
    (nome) => {
      expect(materialDoBanco(nome)).toEqual(NEUTRO)
      expect(rotuloDoBanco(nome)).toBeNull()
    },
  )

  it('palavra curta só casa inteira: "Abba" não é BB, "Internacional" não é Inter', () => {
    expect(materialDoBanco('Abba').neutro).toBe(true)
    expect(materialDoBanco('Internacional').neutro).toBe(true)
  })

  it.each(BANCOS)('%s: o texto tem 4,5:1 contra os dois tons', (nome) => {
    const { fundo, texto } = materialDoBanco(nome)
    const tons = fundo.match(/#[0-9A-Fa-f]{6}/g) ?? []
    expect(tons).toHaveLength(2)
    for (const tom of tons) {
      expect(contraste(texto, tom), `${nome}: ${texto} sobre ${tom}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

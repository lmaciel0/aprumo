export interface MaterialCartao {
  /** `linear-gradient(135deg, <tom claro>, <tom escuro>)` do mesmo matiz. */
  fundo: string
  /** Cor do texto sobre o fundo, com 4,5:1 contra os dois tons. */
  texto: string
  /** Banco desconhecido: material de tema, sem cor de marca. */
  neutro: boolean
}

interface Banco {
  rotulo: string
  /** Casa com o nome já normalizado (minúsculas, sem acento). Palavra curta leva `\b` para não casar dentro de outra. */
  casa: RegExp
  claro: string
  escuro: string
  texto: string
}

/**
 * Ordem de checagem: o primeiro que casar vence, então um nome que cita dois bancos ("Itaú Nubank") sempre dá o mesmo
 * resultado. Os tons vêm da cor de marca de cada banco. Onde o texto do plano não chegava a 4,5:1 contra os dois tons
 * (Inter, Itaú, Mercado Pago, Santander, American Express e ShopeePay), o texto foi trocado por preto ou branco; no
 * ShopeePay, que não fechava com nenhum texto, o tom escuro também subiu um degrau (#C93E21 para #D84626).
 */
const BANCOS: Banco[] = [
  { rotulo: 'Nubank', casa: /nubank|\bnu\b/, claro: '#8A05BE', escuro: '#5B0380', texto: '#F4EDE0' },
  { rotulo: 'Inter', casa: /\binter\b/, claro: '#FF7A00', escuro: '#D45F00', texto: '#000000' },
  { rotulo: 'Itaú', casa: /itau|uniclass|personnalite/, claro: '#EC7000', escuro: '#C25A00', texto: '#000000' },
  { rotulo: 'Bradesco', casa: /bradesco/, claro: '#CC092F', escuro: '#8E0620', texto: '#F4EDE0' },
  { rotulo: 'Santander', casa: /santander/, claro: '#EC0000', escuro: '#B00000', texto: '#FFFFFF' },
  { rotulo: 'American Express', casa: /\bamex\b|american express/, claro: '#2E77BB', escuro: '#1F5A91', texto: '#FFFFFF' },
  { rotulo: 'C6 Bank', casa: /\bc6\b/, claro: '#2B2B2B', escuro: '#141414', texto: '#EDEDED' },
  { rotulo: 'Caixa', casa: /\bcaixa\b/, claro: '#005CA9', escuro: '#003F75', texto: '#F4EDE0' },
  { rotulo: 'Mercado Pago', casa: /mercado ?pago/, claro: '#00B1EA', escuro: '#0090C1', texto: '#000000' },
  { rotulo: 'Banco do Brasil', casa: /banco do brasil|\bbb\b/, claro: '#FCFC30', escuro: '#E3E32A', texto: '#14213D' },
  { rotulo: 'PicPay', casa: /pic ?pay/, claro: '#21C25E', escuro: '#18A04C', texto: '#14213D' },
  { rotulo: 'ShopeePay', casa: /shopee/, claro: '#EE4D2D', escuro: '#D84626', texto: '#000000' },
]

const NEUTRO: MaterialCartao = {
  fundo: 'linear-gradient(135deg, var(--cor-elevado), var(--cor-card))',
  texto: 'var(--cor-texto)',
  neutro: true,
}

const normalizar = (nome: string): string =>
  nome
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const acharBanco = (nome: string): Banco | undefined => {
  const normalizado = normalizar(nome)
  return BANCOS.find((banco) => banco.casa.test(normalizado))
}

/** Material (fundo e texto) do cartão pelo nome; banco desconhecido ou nome vazio dá o material neutro do tema. */
export function materialDoBanco(nome: string): MaterialCartao {
  const banco = acharBanco(nome)
  if (!banco) return NEUTRO
  return { fundo: `linear-gradient(135deg, ${banco.claro}, ${banco.escuro})`, texto: banco.texto, neutro: false }
}

/** Nome do banco em sentence case quando o cartão é de um banco conhecido; `null` caso contrário. */
export function rotuloDoBanco(nome: string): string | null {
  return acharBanco(nome)?.rotulo ?? null
}

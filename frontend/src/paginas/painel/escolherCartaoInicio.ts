import type { CartaoResponse } from '../../api/tipos'

/** Cartão preferido, se ainda existir; senão o de maior fatura (empate fica com o primeiro da lista). */
export function escolherCartaoInicio(cartoes: CartaoResponse[], idPreferido: number | null): CartaoResponse | null {
  if (cartoes.length === 0) return null
  const preferido = idPreferido === null ? undefined : cartoes.find((c) => c.itemId === idPreferido)
  if (preferido) return preferido
  return cartoes.reduce((maior, c) => (Number(c.fatura) > Number(maior.fatura) ? c : maior))
}

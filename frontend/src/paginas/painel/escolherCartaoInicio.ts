import type { CartaoResponse } from '../../api/tipos'

/** Cartão preferido, se ainda existir; senão o de maior fatura (empate fica com o primeiro da lista). */
export function escolherCartaoInicio(cartoes: CartaoResponse[], idPreferido: number | null): CartaoResponse | null {
  const [primeiro, ...demais] = cartoes
  if (!primeiro) return null
  const preferido = idPreferido === null ? undefined : cartoes.find((c) => c.itemId === idPreferido)
  if (preferido) return preferido
  return demais.reduce((maior, c) => (Number(c.fatura) > Number(maior.fatura) ? c : maior), primeiro)
}

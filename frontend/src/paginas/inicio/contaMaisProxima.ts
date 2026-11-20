const formatadorSaoPaulo = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Data local de São Paulo no formato `AAAA-MM-DD` (en-CA já devolve nessa ordem). */
function dataLocal(instante: Date): string {
  return formatadorSaoPaulo.format(instante)
}

/**
 * Índice da primeira conta com vencimento (`AAAA-MM-DD`) de hoje em diante, contando a lista na ordem recebida;
 * `-1` se todas já venceram ou a lista está vazia. "Hoje" é a data local de São Paulo.
 */
export function indiceContaMaisProxima<T extends { vencimento: string }>(contas: T[], hoje: Date): number {
  const dia = dataLocal(hoje)
  return contas.findIndex((conta) => conta.vencimento >= dia)
}

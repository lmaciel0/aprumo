const FUSO = 'America/Sao_Paulo'

const formatadorMes = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, month: 'long', year: 'numeric' })

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Mês e ano no fuso de São Paulo, com o mês em maiúscula inicial: `Novembro de 2026`. */
export function tituloDoMes(data: Date): string {
  const texto = formatadorMes.format(data)
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1)
}

/** Data como `sábado, 31 de outubro`, no dia de São Paulo. */
export function dataPorExtenso(data: Date): string {
  return formatadorData.format(data)
}

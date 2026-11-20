import type { TotaisMes } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { formatarComSinal, paraCentavos, percentualDaReceita } from './valores'

interface Props {
  sobra: string
  sobraAno: string
  /** Receitas do mês, base do percentual da sobra. */
  receitas: string
  anterior: TotaisMes | null
  /** Nome do mês anterior em minúsculas (`setembro`). */
  nomeMesAnterior: string
}

/** Texto da comparação com o mês anterior; `null` quando não há mês anterior para comparar. */
function comparacao(sobra: string, anterior: TotaisMes | null, nomeMesAnterior: string): string | null {
  if (anterior === null) {
    return null
  }
  const delta = paraCentavos(sobra) - paraCentavos(anterior.sobra)
  if (delta === 0) {
    return `igual a ${nomeMesAnterior}`
  }
  return `${formatarMoeda(Math.abs(delta) / 100)} ${delta > 0 ? 'melhor' : 'pior'} que ${nomeMesAnterior}`
}

/** Destaque da tela: quanto sobrou no mês, em card neutro com o número grande; o negativo vai com o prefixo −. */
export function CardSobra({ sobra, sobraAno, receitas, anterior, nomeMesAnterior }: Props) {
  const texto = comparacao(sobra, anterior, nomeMesAnterior)
  const percentual = percentualDaReceita(sobra, receitas)

  return (
    <section aria-labelledby="titulo-sobra" className="card flex flex-col md:col-span-11">
      <h2 id="titulo-sobra" className="m-0 text-xs font-normal text-[var(--cor-secundario)]">
        Sobra do mês
      </h2>
      <p className="valor m-0 mt-1.5 text-[28px] font-medium text-[var(--cor-texto)] md:text-[32px]">{formatarComSinal(sobra)}</p>
      {percentual !== null && (
        <p className="valor m-0 mt-0.5 text-xs text-[var(--cor-mutado)]">{percentual} da receita</p>
      )}
      {texto !== null && (
        <p className="m-0 mt-1.5 w-fit rounded-md bg-[var(--cor-elevado)] px-2 py-0.5 text-xs text-[var(--cor-secundario)]">{texto}</p>
      )}
      <p className="valor m-0 mt-auto pt-5 text-xs text-[var(--cor-mutado)]">No ano: {formatarComSinal(sobraAno)}</p>
    </section>
  )
}

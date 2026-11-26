import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { endpoints } from '../../api/endpoints'
import { formatarMoeda } from '../../formato/moeda'
import { mesAtual, nomeMes } from '../../formato/mes'

interface Props {
  ano: number
  mes: number
}

/** Medidas compartilhadas entre a faixa e o esqueleto, para a página não pular quando o saldo chega. */
const medidas = 'rounded-[var(--raio-card)] px-5 py-4'

interface MioloProps {
  rotulo: string
  saldo: string
  'aria-hidden'?: boolean
}

/** Conteúdo da faixa: rótulo e saldo em conta, compartilhado com o esqueleto para manter a mesma altura. */
function Miolo({ rotulo, saldo, 'aria-hidden': oculto }: MioloProps) {
  return (
    <div aria-hidden={oculto}>
      <p className="m-0 text-xs font-semibold">{rotulo}</p>
      <p className="valor m-0 text-[30px] leading-[1.1] font-extrabold tracking-tight">{formatarMoeda(saldo)}</p>
    </div>
  )
}

/**
 * Faixa do saldo no topo do Orçamento: saldo em conta (só lançamentos pagos).
 * Fica escondida antes do mês de início do cálculo e se a consulta falhar (a página segue usável).
 */
export function FaixaSaldo({ ano, mes }: Props) {
  const consulta = useQuery({
    queryKey: ['saldo', ano, mes],
    queryFn: () => endpoints.saldo(ano, mes),
    placeholderData: keepPreviousData,
  })

  if (consulta.isPending || consulta.isPlaceholderData) {
    // Também durante a troca de mês (dado do mês anterior): o saldo de um mês nunca aparece sob o rótulo de outro.
    // Mesmo miolo da faixa com o texto transparente: a altura é a mesma e a página não pula quando o saldo chega.
    return (
      <div
        role="status"
        aria-label="Carregando o saldo…"
        aria-busy="true"
        className={`${medidas} esqueleto-shimmer mb-3 text-transparent`}
      >
        <Miolo rotulo="Saldo em conta hoje" saldo="0" aria-hidden />
      </div>
    )
  }
  if (consulta.isError || !consulta.data.ativo) return null

  const atual = mesAtual()
  const doMesCorrente = atual.ano === ano && atual.mes === mes
  const rotulo = doMesCorrente ? 'Saldo em conta hoje' : `Saldo em conta ao fim de ${nomeMes(mes)}`

  return (
    <section
      aria-label="Saldo em conta"
      className={`${medidas} mb-3 text-[var(--cor-sobre-principal)] shadow-[var(--sombra-flutuante)]`}
      style={{ background: 'linear-gradient(120deg, var(--cor-principal), var(--cor-principal-fim))' }}
    >
      <Miolo rotulo={rotulo} saldo={consulta.data.saldo} />
    </section>
  )
}

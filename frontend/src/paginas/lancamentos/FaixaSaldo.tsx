import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { endpoints } from '../../api/endpoints'
import { formatarMoeda } from '../../formato/moeda'
import { mesAtual, nomeMes } from '../../formato/mes'

interface Props {
  ano: number
  mes: number
}

/** Medidas compartilhadas entre a faixa e o esqueleto, para a página não pular quando o saldo chega. */
const medidas = 'flex flex-col gap-3 rounded-[var(--raio-card)] sm:flex-row sm:items-center sm:justify-between'

interface MioloProps {
  rotulo: string
  saldo: string
  recebido: string
  'aria-hidden'?: boolean
}

/** Os dois blocos da faixa: saldo à esquerda, recebido no mês à direita (sob o saldo no celular). */
function Miolo({ rotulo, saldo, recebido, 'aria-hidden': oculto }: MioloProps) {
  return (
    <>
      <div aria-hidden={oculto}>
        <p className="m-0 text-xs font-medium text-[var(--cor-secundario)]">{rotulo}</p>
        <p className="valor m-0 text-[28px] leading-[1.1] font-medium text-[var(--cor-texto)] md:text-[32px]">
          {formatarMoeda(saldo)}
        </p>
      </div>
      <div
        aria-hidden={oculto}
        className="border-t border-[var(--cor-linha)] pt-3 sm:border-t-0 sm:pt-0 sm:text-right"
      >
        <p className="m-0 text-xs font-medium text-[var(--cor-secundario)]">Recebido no mês</p>
        <p className="valor m-0 text-lg font-medium text-[var(--cor-texto)]">{formatarMoeda(recebido)}</p>
      </div>
    </>
  )
}

/**
 * Faixa do saldo no topo do Orçamento: saldo em conta (só lançamentos pagos) à esquerda e o recebido no mês à direita;
 * empilha no celular. Fica escondida antes do mês de início do cálculo e se a consulta falhar (a página segue usável).
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
        className={`${medidas} esqueleto-shimmer mb-3 border border-transparent px-5 py-4 text-transparent`}
      >
        <Miolo rotulo="Saldo em conta hoje" saldo="0" recebido="0" aria-hidden />
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
      className={`card ${medidas} mb-3 px-5 py-4`}
    >
      <Miolo rotulo={rotulo} saldo={consulta.data.saldo} recebido={consulta.data.recebidoNoMes} />
    </section>
  )
}

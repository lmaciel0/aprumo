import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatarMoeda } from '../../formato/moeda'
import { nomeMes } from '../../formato/mes'
import { formatarComSinal, type PontoDoResultado } from './valores'

// Sobra e déficit na cor do texto: o sinal − do valor e a seta dizem o sentido; verde e vermelho só em status.
const COR_DO_SENTIDO: Record<PontoDoResultado['sentido'], string> = {
  sobrou: 'text-[var(--cor-texto)]',
  faltou: 'text-[var(--cor-texto)]',
  zero: 'text-[var(--cor-mutado)]',
}

interface LinhaProps {
  nome: string
  total: number
  pago: number
  previsto: number
}

function LinhaDeTotal({ nome, total, pago, previsto }: LinhaProps) {
  return (
    <div data-linha={nome}>
      <div className="flex justify-between gap-4">
        <span>{nome}</span>
        <span className="font-semibold tabular-nums">{formatarMoeda(total)}</span>
      </div>
      <div className="text-[11px] text-[var(--cor-mutado)]">
        pago {formatarMoeda(pago)} · previsto {formatarMoeda(previsto)}
      </div>
    </div>
  )
}

/** Dica do gráfico de resultado: receitas, despesas e resultado do mês, com o valor completo em reais. */
export function TooltipResultado({ ponto }: { ponto: PontoDoResultado | null }) {
  if (!ponto) {
    return null
  }
  return (
    <div className="flex min-w-[190px] flex-col gap-1.5 rounded-xl border border-[var(--cor-linha)] bg-[var(--cor-card)] px-3 py-2 text-xs text-[var(--cor-texto)] shadow-[var(--sombra-flutuante)]">
      <p className="m-0 text-[13px] font-medium">{nomeMes(ponto.mes)}</p>
      <LinhaDeTotal
        nome="Receitas"
        total={ponto.receitas}
        pago={ponto.receitasPagas}
        previsto={ponto.receitasPrevistas}
      />
      <LinhaDeTotal
        nome="Despesas"
        total={ponto.despesas}
        pago={-ponto.despesasPagas}
        previsto={-ponto.despesasPrevistas}
      />
      <div className="flex justify-between gap-4 border-t border-[var(--cor-linha)] pt-1.5">
        <span>Resultado</span>
        <span
          data-testid="tooltip-resultado-valor"
          className={`inline-flex items-center gap-1 font-medium tabular-nums ${COR_DO_SENTIDO[ponto.sentido]}`}
        >
          {ponto.sentido === 'sobrou' && <ArrowUp size={12} aria-hidden="true" />}
          {ponto.sentido === 'faltou' && <ArrowDown size={12} aria-hidden="true" />}
          {formatarComSinal(ponto.resultado.toFixed(2))}
        </span>
      </div>
    </div>
  )
}

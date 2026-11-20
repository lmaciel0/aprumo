import { Check } from 'lucide-react'
import { Link } from 'react-router'
import type { LancamentoResponse, StatusLancamento } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { diaEMes } from '../inicio/valores'
import { totaisDeReceitas } from './receitas'

interface Props {
  lancamentos: LancamentoResponse[]
  /** Query string do mês (`?ano=2026&mes=10`), mantida no link que abre o lançamento. */
  busca: string
  /** `id` do lançamento com troca de status em andamento (o selo fica desligado). */
  idMudandoStatus: number | null
  aoMudarStatus: (id: number, status: StatusLancamento) => void
}

const classeFoco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cor-principal)]'

/**
 * Card das receitas do mês: o total recebido em destaque, barra de recebido contra previsto e uma linha por
 * receita (toque na linha abre; o selo alterna entre "Recebido" e "A receber"). Valores em cor de texto: só o
 * selo de status "Recebido" leva o verde.
 */
export function ReceitasCard({ lancamentos, busca, idMudandoStatus, aoMudarStatus }: Props) {
  const { recebidoCentavos, totalCentavos, percentual } = totaisDeReceitas(lancamentos)

  return (
    <section aria-label="Receitas" className="card md:col-span-2">
      {lancamentos.length === 0 ? (
        <>
          <h2 className="m-0 text-[15px] font-medium">Receitas</h2>
          <p className="m-0 mt-2 text-sm text-[var(--cor-mutado)]">Nenhuma receita neste mês</p>
        </>
      ) : (
        <>
          <div>
            <h2 className="m-0 text-xs font-medium text-[var(--cor-mutado)]">Recebido no mês</h2>
            <p
              data-total
              className="valor m-0 text-[28px] leading-[1.1] font-medium tracking-tight text-[var(--cor-texto)] md:text-[32px]"
            >
              {formatarMoeda(recebidoCentavos / 100)}
            </p>
            <div
              role="progressbar"
              aria-label="Receitas recebidas do previsto no mês"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentual}
              className="mt-3 mb-1 h-2 overflow-hidden rounded-full bg-[var(--cor-elevado)]"
            >
              <div
                className="h-full origin-left rounded-full bg-[var(--cor-grafico-receitas)] motion-safe:transition-transform motion-safe:duration-300"
                style={{ transform: `scaleX(${percentual / 100})` }}
              />
            </div>
            <p className="m-0 text-xs text-[var(--cor-mutado)]">
              {`${percentual}% do previsto · a receber ${formatarMoeda((totalCentavos - recebidoCentavos) / 100)}`}
            </p>
          </div>
          <ul className="m-0 mt-2 list-none p-0">
            {lancamentos.map((l) => {
              const recebido = l.status === 'PAGO'
              const rotulo = recebido ? 'Recebido' : 'A receber'
              return (
                <li
                  key={l.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[var(--cor-linha)] first:border-t-0"
                >
                  <Link
                    to={{ pathname: `/lancamentos/${l.id}`, search: busca }}
                    className={`grid min-h-12 grid-cols-[3rem_1fr_auto] items-center gap-2 py-2 text-[13px] text-inherit no-underline ${classeFoco}`}
                  >
                    <span className="valor font-medium">{l.vencimento === null ? '—' : diaEMes(l.vencimento)}</span>
                    <span className="min-w-0 truncate font-medium">{l.itemNome}</span>
                    <span className="valor font-medium text-[var(--cor-texto)]">{formatarMoeda(l.valor)}</span>
                  </Link>
                  <button
                    type="button"
                    disabled={idMudandoStatus === l.id}
                    aria-label={`${l.itemNome}: ${rotulo}. Tocar para marcar como ${recebido ? 'a receber' : 'recebido'}`}
                    onClick={() => aoMudarStatus(l.id, recebido ? 'PREVISTO' : 'PAGO')}
                    className={`inline-flex min-h-8 min-w-[5.5rem] cursor-pointer items-center justify-center gap-1 rounded-md px-3 text-[12px] font-medium transition-colors disabled:cursor-default disabled:opacity-60 ${classeFoco} ${
                      recebido
                        ? 'bg-[var(--cor-ok-fundo)] text-[var(--cor-positivo-texto)]'
                        : 'bg-[var(--cor-fundo)] text-[var(--cor-principal)]'
                    }`}
                  >
                    {recebido && <Check size={12} aria-hidden="true" />}
                    {rotulo}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

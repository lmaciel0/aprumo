import { Calendar, Pencil, Plus, Wifi } from 'lucide-react'
import { useId } from 'react'
import type { CartaoResponse } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { formatarPercentual, larguraDaBarra } from '../inicio/valores'
import { materialDoBanco, rotuloDoBanco } from './coresBancos'
import { CLASSE_DO_CHIP, COR_DA_BARRA } from './faixas'
import './CardCartao.css'

const classeFoco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cor-principal)]'

interface Props {
  cartao: CartaoResponse
  aoEditar?: (cartao: CartaoResponse) => void
  aoLancar?: (cartao: CartaoResponse) => void
}

/** Um cartão: mini cartão na cor do banco no topo, nome, vencimento, fatura do mês e barra de uso com limite. */
export function CardCartao({ cartao, aoEditar, aoLancar }: Props) {
  const idTitulo = useId()
  const { faixa, uso, limite } = cartao
  const comLimite = faixa !== 'SEM_LIMITE' && uso !== null && limite !== null
  const material = materialDoBanco(cartao.nome)
  const rotulo = rotuloDoBanco(cartao.nome)
  const ultimosDigitos = String(cartao.itemId).padStart(4, '0').slice(-4)

  return (
    <section aria-labelledby={idTitulo} data-faixa={faixa} className="card flex flex-col sm:!p-4.5">
      {/* Mini cartão: a cor vem do material do banco (estilo inline); o CSS só dá a forma. */}
      <div
        data-testid="material-cartao"
        data-neutro={material.neutro}
        className="cartao-mini mb-3.5 select-none"
        style={{ background: material.fundo, color: material.texto }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Chip EMV, só como detalhe físico: contorno na cor do texto, sem brilho. */}
            <div className="grid h-5 w-7 grid-cols-2 gap-px rounded-[4px] border border-current p-0.5">
              <div className="rounded-[1px] border border-current" />
              <div className="rounded-[1px] border border-current" />
            </div>
            <Wifi className="size-4 rotate-90" />
          </div>

          {rotulo && <span className="text-xs font-medium">{rotulo}</span>}
        </div>

        <span className="cartao-mini__numero">•••• •••• •••• {ultimosDigitos}</span>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
                <h3 id={idTitulo} className="m-0 min-w-0 max-w-full truncate text-base font-medium text-[var(--cor-texto)]">
                  {cartao.nome}
                </h3>
                {cartao.titular && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-[var(--cor-elevado)] px-2 py-0.5 text-[11px] font-medium text-[var(--cor-secundario)]">
                    {cartao.titular}
                  </span>
                )}
                {aoEditar && (
                  <button
                    type="button"
                    onClick={() => aoEditar(cartao)}
                    title={`Editar ${cartao.nome}`}
                    aria-label={`Editar ${cartao.nome}`}
                    className={`-my-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--cor-mutado)] transition-colors hover:bg-[var(--cor-elevado)] hover:text-[var(--cor-texto)] ${classeFoco}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                )}
              </div>
              {cartao.diaVencimento !== null && (
                <p className="m-0 mt-1 flex items-center gap-1 text-[11px] text-[var(--cor-mutado)]">
                  <Calendar className="size-3 shrink-0" />
                  <span>vence dia {String(cartao.diaVencimento).padStart(2, '0')}</span>
                </p>
              )}
            </div>

            {comLimite && (
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${CLASSE_DO_CHIP[faixa]}`}>
                {formatarPercentual(uso)}
              </span>
            )}
          </div>

          {/* Barra de progresso de uso do limite */}
          {comLimite ? (
            <div
              role="meter"
              aria-label={`Uso do limite de ${cartao.nome}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(larguraDaBarra(uso))}
              aria-valuetext={`${formatarPercentual(uso)} do limite`}
              className="my-3 h-2 overflow-hidden rounded-full bg-[var(--cor-linha)]"
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${larguraDaBarra(uso)}%`, backgroundColor: COR_DA_BARRA[faixa] }}
              />
            </div>
          ) : (
            <div className="my-3" />
          )}
        </div>

        {/* Rodapé com fatura, limite e botão de ação */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[var(--cor-linha)] pt-3">
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-x-1.5">
              <span className="text-[11px] whitespace-nowrap text-[var(--cor-mutado)]">Fatura do mês</span>
              {cartao.faturaPaga && Number.parseFloat(cartao.fatura) > 0 && (
                <span className="inline-flex items-center rounded-md bg-[var(--cor-ok-fundo)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--cor-positivo-texto)]">
                  Paga
                </span>
              )}
            </div>
            <span className="valor text-sm font-medium text-[var(--cor-texto)]">
              {formatarMoeda(cartao.fatura)}
            </span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {comLimite ? (
              <div className="text-right">
                <span className="text-[11px] text-[var(--cor-mutado)]">
                  {cartao.limiteDisponivel != null ? 'Disponível' : 'Limite'}
                </span>
                <p className="valor m-0 text-xs font-medium text-[var(--cor-texto)]">
                  {cartao.limiteDisponivel != null
                    ? formatarMoeda(cartao.limiteDisponivel)
                    : `de ${formatarMoeda(limite)}`}
                </p>
                {cartao.limiteDisponivel != null && (
                  <span className="text-[10px] text-[var(--cor-mutado)]">
                    de {formatarMoeda(limite)}
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => aoEditar?.(cartao)}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-[10px] px-2 text-xs font-medium text-[var(--cor-principal)] hover:underline ${classeFoco}`}
              >
                Cadastrar limite
              </button>
            )}

            <button
              type="button"
              onClick={() => aoLancar?.(cartao)}
              title={`Lançar despesa em ${cartao.nome}`}
              aria-label={`Lançar despesa em ${cartao.nome}`}
              className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] text-[var(--cor-texto)] transition-colors hover:bg-[var(--cor-linha)] ${classeFoco}`}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

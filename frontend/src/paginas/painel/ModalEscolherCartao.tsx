import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { CartaoResponse } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { FundoDoDialogo } from '../../layout/FundoDoDialogo'
import { foco } from '../../layout/classesFoco'
import { useDialogoModal } from '../../layout/useDialogoModal'
import { usePreferencias } from '../../preferencias/usePreferencias'
import { escolherCartaoInicio } from './escolherCartaoInicio'

interface Props {
  aberto: boolean
  aoFechar: () => void
  cartoes: CartaoResponse[]
}

/**
 * Escolha do cartão que a Início mostra. Cada opção grava na hora (`setCartaoInicioId`) e o modal continua aberto:
 * as setas do teclado mudam o rádio marcado, então fechar na primeira troca impediria andar pela lista. "Pronto" fecha.
 */
export function ModalEscolherCartao({ aberto, aoFechar, cartoes }: Props) {
  const { preferencias, setCartaoInicioId } = usePreferencias()
  const { painel, prenderFoco } = useDialogoModal(aberto, aoFechar)
  const atual = escolherCartaoInicio(cartoes, preferencias.cartaoInicioId)

  // O hook leva o foco ao primeiro item; aqui ele vai para a opção marcada, que é onde o Tab cairia num rádio.
  useEffect(() => {
    if (aberto) {
      painel.current?.querySelector<HTMLElement>('input[type="radio"]:checked')?.focus()
    }
  }, [aberto, painel])

  if (!aberto) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <FundoDoDialogo testId="fundo-escolher-cartao" aoClicar={aoFechar} />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-escolher-cartao"
        onKeyDown={prenderFoco}
        className="superficie relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl border border-[var(--cor-linha)] bg-[var(--cor-card)] shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--cor-linha)] px-5 py-3">
          <div className="min-w-0">
            <h2 id="titulo-escolher-cartao" className="m-0 text-base font-bold text-[var(--cor-texto)]">
              Cartão da Início
            </h2>
            <p className="m-0 mt-0.5 text-xs text-[var(--cor-mutado)]">Qual cartão aparece na tela inicial</p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--cor-mutado)] hover:bg-[var(--cor-fundo)] hover:text-[var(--cor-texto)] ${foco}`}
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="titulo-escolher-cartao"
          className="flex-1 space-y-2 overflow-y-auto p-4"
        >
          {cartoes.map((cartao) => {
            const marcado = cartao.itemId === atual?.itemId
            return (
              <label
                key={cartao.itemId}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--cor-principal)] ${
                  marcado
                    ? 'border-[var(--cor-principal)] bg-[var(--cor-principal)]/10'
                    : 'border-[var(--cor-linha)] hover:border-[var(--cor-principal)]/60'
                }`}
              >
                <input
                  type="radio"
                  name="cartao-inicio"
                  value={cartao.itemId}
                  checked={marcado}
                  onChange={() => setCartaoInicioId(cartao.itemId)}
                  className="size-5 shrink-0 cursor-pointer accent-[var(--cor-principal)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--cor-texto)]">{cartao.nome}</span>
                  <span className="valor block text-xs text-[var(--cor-mutado)]">
                    Fatura {formatarMoeda(cartao.fatura)}
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        <div className="flex justify-end border-t border-[var(--cor-linha)] p-4">
          <button
            type="button"
            onClick={aoFechar}
            className={`min-h-11 cursor-pointer rounded-full bg-[var(--cor-principal)] px-5 text-sm font-semibold text-[var(--cor-sobre-principal)] ${foco}`}
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  )
}

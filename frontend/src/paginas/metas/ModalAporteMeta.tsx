import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'
import type { MetaResponse } from '../../api/tipos'
import { formatarMoeda, lerValor } from '../../formato/moeda'
import { FundoDoDialogo } from '../../layout/FundoDoDialogo'
import { foco } from '../../layout/classesFoco'
import { useDialogoModal } from '../../layout/useDialogoModal'

const classeCampo = `min-h-11 w-full rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-card)] px-3 text-base text-[var(--cor-texto)] placeholder:text-[var(--cor-mutado)] ${foco}`
const classeChip = `inline-flex min-h-11 cursor-pointer items-center rounded-md border border-[var(--cor-linha)] bg-[var(--cor-card)] px-3 text-sm font-medium text-[var(--cor-texto)] transition-colors duration-150 hover:bg-[var(--cor-elevado)] motion-reduce:transition-none ${foco}`

interface Props {
  readonly aberto: boolean
  readonly meta: MetaResponse | null
  readonly tipo: 'GUARDAR' | 'RESGATAR'
  readonly aoConfirmar: (valor: string) => Promise<void> | void
  readonly aoFechar: () => void
}

export function ModalAporteMeta({
  aberto,
  meta,
  tipo,
  aoConfirmar,
  aoFechar,
}: Readonly<Props>) {
  const { painel, prenderFoco } = useDialogoModal<HTMLDialogElement>(aberto, aoFechar)
  const [valorTexto, setValorTexto] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!aberto || !meta) {
    return null
  }

  const saldoAtualNum = Number.parseFloat(meta.valorGuardado || '0')
  const ehGuardar = tipo === 'GUARDAR'

  const aplicarPilula = (valorAdd: number) => {
    setErro(null)
    setValorTexto(valorAdd.toFixed(2).replace('.', ','))
  }

  const aplicarTudo = () => {
    setErro(null)
    setValorTexto(saldoAtualNum.toFixed(2).replace('.', ','))
  }

  const tratarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)

    const valorNormalizado = lerValor(valorTexto)
    if (!valorNormalizado) {
      setErro('Informe um valor válido maior que zero.')
      return
    }

    const valorNum = Number.parseFloat(valorNormalizado)
    if (!ehGuardar && valorNum > saldoAtualNum) {
      setErro('Valor excede o saldo guardado.')
      return
    }

    try {
      setEnviando(true)
      await aoConfirmar(valorNormalizado)
      setValorTexto('')
      aoFechar()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro('Ocorreu um erro ao processar. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }


  let textoBotao = ehGuardar ? 'Confirmar aporte' : 'Confirmar resgate'
  if (enviando) {
    textoBotao = 'Processando...'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <FundoDoDialogo testId="fundo-modal-aporte" aoClicar={aoFechar} />
      <dialog
        open
        ref={painel}
        aria-modal="true"
        aria-labelledby="titulo-modal-aporte"
        onKeyDown={prenderFoco}
        className="superficie relative z-10 m-0 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[20px] border border-[var(--cor-linha)] bg-[var(--cor-card)] p-0 text-[var(--cor-texto)] shadow-[var(--sombra-elevada)] backdrop:bg-transparent sm:rounded-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--cor-linha)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--cor-elevado)] text-[var(--cor-texto)]">
              {ehGuardar ? (
                <ArrowUpRight className="size-5" />
              ) : (
                <ArrowDownLeft className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2
                id="titulo-modal-aporte"
                className="m-0 text-base font-medium text-[var(--cor-texto)]"
              >
                {ehGuardar ? 'Guardar dinheiro' : 'Resgatar dinheiro'}
              </h2>
              <p className="m-0 mt-0.5 break-words text-xs text-[var(--cor-mutado)]">
                {meta.titulo}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar diálogo"
            className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--cor-mutado)] transition-colors duration-150 hover:bg-[var(--cor-elevado)] hover:text-[var(--cor-texto)] motion-reduce:transition-none ${foco}`}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Informações de saldo da meta */}
        <div className="shrink-0 bg-[var(--cor-elevado)] px-5 py-3 text-sm">
          <p className="m-0 text-[var(--cor-secundario)]">
            {ehGuardar ? 'Saldo atual guardado:' : 'Saldo disponível:'}{' '}
            <strong className="valor font-medium text-[var(--cor-texto)]">
              {formatarMoeda(meta.valorGuardado)}
            </strong>
          </p>
          {ehGuardar && (
            <p className="m-0 mt-1 flex items-center justify-between text-xs text-[var(--cor-mutado)]">
              <span>Alvo da caixinha:</span>
              <span className="valor">{formatarMoeda(meta.valorAlvo)}</span>
            </p>
          )}
        </div>

        {/* O corpo rola; erro e rodapé ficam fixos para o botão seguir alcançável com o teclado aberto. */}
        <form onSubmit={tratarEnvio} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campo-valor-aporte" className="block text-sm font-medium text-[var(--cor-texto)]">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-[var(--cor-mutado)]">
                  R$
                </span>
                <input
                  id="campo-valor-aporte"
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0,00"
                  value={valorTexto}
                  onChange={(e) => {
                    setValorTexto(e.target.value)
                    if (erro) setErro(null)
                  }}
                  className={`${classeCampo} valor pl-10`}
                />
              </div>
            </div>

            {/* Sugestões rápidas de valor */}
            <div className="flex flex-wrap items-center gap-2">
              {ehGuardar ? (
                [50, 100, 200, 500].map((v) => (
                  <button key={v} type="button" onClick={() => aplicarPilula(v)} className={classeChip}>
                    + R$ {v}
                  </button>
                ))
              ) : (
                <>
                  {[50, 100, 200].map((v) => (
                    <button key={v} type="button" onClick={() => aplicarPilula(v)} className={classeChip}>
                      R$ {v}
                    </button>
                  ))}
                  <button type="button" onClick={aplicarTudo} className={classeChip}>
                    Tudo
                  </button>
                </>
              )}
            </div>
          </div>

          {erro && (
            <div className="shrink-0 px-5 pt-3">
              <p
                role="alert"
                className="m-0 rounded-[10px] border border-[var(--cor-negativo)] bg-[var(--cor-erro-fundo)] px-3 py-2 text-sm text-[var(--cor-negativo-texto)]"
              >
                {erro}
              </p>
            </div>
          )}

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--cor-linha)] px-5 py-3">
            <button
              type="button"
              onClick={aoFechar}
              disabled={enviando}
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] px-4 text-sm font-medium text-[var(--cor-texto)] disabled:opacity-60 ${foco}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !valorTexto.trim()}
              className={`min-h-11 cursor-pointer rounded-[10px] bg-[var(--cor-principal-fundo)] px-5 text-sm font-medium text-[var(--cor-sobre-principal-fundo)] transition-[filter] duration-150 hover:brightness-95 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${foco}`}
            >
              {textoBotao}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

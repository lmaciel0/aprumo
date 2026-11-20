import { useState } from 'react'
import { Target, Trash2, X } from 'lucide-react'
import type { MetaRequest, MetaResponse } from '../../api/tipos'
import { lerValor } from '../../formato/moeda'
import { FundoDoDialogo } from '../../layout/FundoDoDialogo'
import { foco } from '../../layout/classesFoco'
import { useDialogoModal } from '../../layout/useDialogoModal'
import { getIconePreset } from './iconesMeta'
import { LISTA_PRESETS, obterPresetVisual } from './presetsVisuais'

const classeRotulo = 'block text-sm font-medium text-[var(--cor-texto)]'
const classeCampo = `min-h-11 w-full rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-card)] px-3 text-base text-[var(--cor-texto)] placeholder:text-[var(--cor-mutado)] ${foco}`
const classePrefixo =
  'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-[var(--cor-mutado)]'
const classeBotaoSecundario = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] px-4 text-sm font-medium text-[var(--cor-texto)] transition-colors duration-150 motion-reduce:transition-none disabled:opacity-60 ${foco}`

interface Props {
  readonly aberto: boolean
  readonly meta: MetaResponse | null
  readonly aoSalvar: (dados: MetaRequest) => Promise<void> | void
  readonly aoExcluir?: (id: number) => Promise<void> | void
  readonly aoFechar: () => void
}

export function ModalMetaForm({
  aberto,
  meta,
  aoSalvar,
  aoExcluir,
  aoFechar,
}: Readonly<Props>) {
  const { painel, prenderFoco } = useDialogoModal<HTMLDialogElement>(aberto, aoFechar)
  const ehEdicao = Boolean(meta)

  const [titulo, setTitulo] = useState(meta?.titulo || '')
  const [valorAlvoTexto, setValorAlvoTexto] = useState(
    meta?.valorAlvo ? meta.valorAlvo.replace('.', ',') : '',
  )
  const [valorGuardadoTexto, setValorGuardadoTexto] = useState(
    meta?.valorGuardado ? meta.valorGuardado.replace('.', ',') : '',
  )
  const [prazo, setPrazo] = useState(meta?.prazo || '')
  const [presetVisual, setPresetVisual] = useState(
    meta?.presetVisual || 'personalizado',
  )
  const [fotoUrl, setFotoUrl] = useState(meta?.fotoUrl || '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  if (!aberto) {
    return null
  }

  const presetAtual = obterPresetVisual(presetVisual)

  const tratarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)

    if (!titulo.trim()) {
      setErro('Informe o título da meta.')
      return
    }

    const alvoNormalizado = lerValor(valorAlvoTexto)
    if (!alvoNormalizado) {
      setErro('Informe um valor alvo válido maior que zero.')
      return
    }

    let guardadoNormalizado: string | undefined
    if (!ehEdicao && valorGuardadoTexto.trim()) {
      const g = lerValor(valorGuardadoTexto)
      if (g) {
        guardadoNormalizado = g
      }
    }

    const payload: MetaRequest = {
      titulo: titulo.trim(),
      valorAlvo: alvoNormalizado,
      valorGuardado: guardadoNormalizado,
      prazo: prazo || null,
      presetVisual: presetAtual.id,
      icone: presetAtual.icone,
      fotoUrl: fotoUrl.trim() || null,
    }

    try {
      setSalvando(true)
      await aoSalvar(payload)
      aoFechar()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro('Erro ao salvar a meta. Verifique os dados.')
      }
    } finally {
      setSalvando(false)
    }
  }

  const tratarExcluir = async () => {
    if (!meta || !aoExcluir) return
    try {
      setSalvando(true)
      await aoExcluir(meta.id)
      aoFechar()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErro(err.message)
      } else {
        setErro('Erro ao excluir meta.')
      }
    } finally {
      setSalvando(false)
    }
  }

  const renderBotaoExclusao = () => {
    if (!ehEdicao || !aoExcluir) {
      return <span />
    }
    if (confirmandoExclusao) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={tratarExcluir}
            disabled={salvando}
            className={`min-h-11 cursor-pointer rounded-[10px] bg-[var(--cor-negativo)] px-3 text-sm font-medium text-[var(--cor-sobre-negativo)] transition-[filter] duration-150 hover:brightness-95 motion-reduce:transition-none disabled:opacity-60 ${foco}`}
          >
            Confirmar exclusão
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoExclusao(false)}
            className={`min-h-11 cursor-pointer rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] px-3 text-sm font-medium text-[var(--cor-texto)] ${foco}`}
          >
            Cancelar
          </button>
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={() => setConfirmandoExclusao(true)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] px-2 text-sm font-medium text-[var(--cor-negativo-texto)] transition-colors duration-150 hover:bg-[var(--cor-erro-fundo)] motion-reduce:transition-none ${foco}`}
      >
        <Trash2 className="size-4" />
        <span>Excluir meta</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <FundoDoDialogo testId="fundo-modal-meta-form" aoClicar={aoFechar} />
      <dialog
        open
        ref={painel}
        aria-modal="true"
        aria-labelledby="titulo-modal-meta-form"
        onKeyDown={prenderFoco}
        className="superficie relative z-10 m-0 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[20px] border border-[var(--cor-linha)] bg-[var(--cor-card)] p-0 text-[var(--cor-texto)] shadow-[var(--sombra-elevada)] backdrop:bg-transparent sm:rounded-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--cor-linha)] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--cor-elevado)] text-[var(--cor-texto)]">
              <Target className="size-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="titulo-modal-meta-form"
                className="m-0 text-base font-medium text-[var(--cor-texto)]"
              >
                {ehEdicao ? 'Editar meta' : 'Nova meta ou caixinha'}
              </h2>
              <p className="m-0 mt-0.5 text-xs text-[var(--cor-mutado)]">
                {ehEdicao
                  ? 'Ajuste valores, prazos ou o visual da sua meta'
                  : 'Defina seu objetivo com valor alvo e prazo estimado'}
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

        {/* O corpo rola; erro e rodapé ficam fixos para o botão seguir alcançável com o teclado aberto. */}
        <form onSubmit={tratarEnvio} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            {/* Seletor de Presets Visuais */}
            <div>
              <span className={classeRotulo}>Estilo da meta</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LISTA_PRESETS.map((p) => {
                  const selecionado = presetVisual === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={selecionado}
                      onClick={() => setPresetVisual(p.id)}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border p-2 text-left text-sm font-medium transition-colors duration-150 motion-reduce:transition-none ${foco} ${
                        selecionado
                          ? 'border-[var(--cor-texto)] bg-[var(--cor-texto)] text-[var(--cor-fundo)]'
                          : 'border-[var(--cor-linha)] bg-[var(--cor-card)] text-[var(--cor-texto)] hover:bg-[var(--cor-elevado)]'
                      }`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--cor-texto)] ${
                          selecionado ? 'bg-[var(--cor-fundo)]' : 'bg-[var(--cor-elevado)]'
                        }`}
                      >
                        {getIconePreset(p.icone)}
                      </span>
                      <span className="min-w-0 break-words leading-tight">{p.nome}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Título da Meta */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campo-titulo-meta" className={classeRotulo}>
                Título da meta
              </label>
              <input
                id="campo-titulo-meta"
                type="text"
                required
                placeholder="Ex: IPVA 2027, viagem para a praia"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className={classeCampo}
              />
            </div>

            {/* Valor Alvo e Valor Inicial (se criação) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="campo-alvo-meta" className={classeRotulo}>
                  Valor alvo (R$)
                </label>
                <div className="relative">
                  <span className={classePrefixo}>R$</span>
                  <input
                    id="campo-alvo-meta"
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="0,00"
                    value={valorAlvoTexto}
                    onChange={(e) => setValorAlvoTexto(e.target.value)}
                    className={`${classeCampo} valor pl-10`}
                  />
                </div>
              </div>

              {!ehEdicao && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="campo-guardado-meta" className={classeRotulo}>
                    Já guardado (opcional)
                  </label>
                  <div className="relative">
                    <span className={classePrefixo}>R$</span>
                    <input
                      id="campo-guardado-meta"
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={valorGuardadoTexto}
                      onChange={(e) => setValorGuardadoTexto(e.target.value)}
                      className={`${classeCampo} valor pl-10`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prazo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campo-prazo-meta" className={classeRotulo}>
                Prazo estimado (opcional)
              </label>
              <input
                id="campo-prazo-meta"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className={classeCampo}
              />
              <span className="text-xs text-[var(--cor-mutado)]">
                Com o prazo definido, calculamos o ritmo mensal necessário para
                você chegar lá.
              </span>
            </div>

            {/* Foto Personalizada (URL) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campo-foto-meta" className={classeRotulo}>
                Foto ou imagem de fundo (URL opcional)
              </label>
              <input
                id="campo-foto-meta"
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                className={classeCampo}
              />
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

          {/* Rodapé de ações */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--cor-linha)] px-5 py-3">
            {renderBotaoExclusao()}

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={aoFechar}
                disabled={salvando}
                className={classeBotaoSecundario}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className={`min-h-11 cursor-pointer rounded-[10px] bg-[var(--cor-principal-fundo)] px-5 text-sm font-medium text-[var(--cor-sobre-principal-fundo)] transition-[filter] duration-150 hover:brightness-95 motion-reduce:transition-none disabled:opacity-60 ${foco}`}
              >
                {salvando ? 'Salvando...' : 'Salvar meta'}
              </button>
            </div>
          </div>
        </form>
      </dialog>
    </div>
  )
}

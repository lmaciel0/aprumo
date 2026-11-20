import { Calendar, Check, Minus, Pencil, Plus } from 'lucide-react'
import { useId } from 'react'
import type { MetaResponse } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { getIconePreset } from './iconesMeta'
import { obterPresetVisual } from './presetsVisuais'

interface Props {
  readonly meta: MetaResponse
  readonly aoGuardar?: (meta: MetaResponse) => void
  readonly aoResgatar?: (meta: MetaResponse) => void
  readonly aoEditar?: (meta: MetaResponse) => void
}

export function CardMeta({ meta, aoGuardar, aoResgatar, aoEditar }: Readonly<Props>) {
  const idTitulo = useId()
  const preset = obterPresetVisual(meta.presetVisual)
  const percentualNum = Number.parseFloat(meta.percentualConcluido || '0') * 100
  const percentualInteiro = Math.min(100, Math.max(0, Math.round(percentualNum)))
  const fotoExibicao = meta.fotoUrl || preset.fotoPadrao
  const corBarra = meta.concluida ? 'bg-[var(--cor-positivo)]' : 'bg-[var(--cor-grafico-receitas)]'

  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col overflow-hidden rounded-[var(--raio-card)] border border-[var(--cor-linha)] bg-[var(--cor-card)]"
    >
      {/* Hero: foto com véu neutro; sem foto, a superfície elevada com o mesmo véu */}
      <div className="relative h-28 w-full overflow-hidden bg-[var(--cor-elevado)] select-none">
        {fotoExibicao && (
          <img
            src={fotoExibicao}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="veu-foto absolute inset-0" aria-hidden="true" />

        {/* Cabeçalho do hero: selo da categoria e botão de editar */}
        <div className="relative z-10 flex items-start justify-between gap-2 p-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--cor-card)]/90 px-2 py-0.5 text-[11px] font-medium text-[var(--cor-texto)]">
              {getIconePreset(meta.icone || preset.icone)}
              <span>{preset.nome}</span>
            </span>
            {meta.concluida && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--cor-ok-fundo)] px-2 py-0.5 text-[11px] font-medium text-[var(--cor-positivo-texto)]">
                <Check className="size-3" aria-hidden="true" />
                Concluída
              </span>
            )}
          </div>

          {aoEditar && (
            <button
              type="button"
              onClick={() => aoEditar(meta)}
              aria-label={`Editar ${meta.titulo}`}
              title={`Editar ${meta.titulo}`}
              className={`veu-botao-foto -mt-1.5 -mr-1.5 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--cor-sobre-imagem)] transition-colors ${foco}`}
            >
              <Pencil className="size-4" />
            </button>
          )}
        </div>

        {/* Título da meta */}
        <div className="absolute right-3 bottom-3 left-3 z-10">
          <h3
            id={idTitulo}
            className="m-0 truncate text-base font-medium text-[var(--cor-sobre-imagem)]"
          >
            {meta.titulo}
          </h3>
        </div>
      </div>

      {/* Corpo com valores e barra de progresso */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-medium text-[var(--cor-mutado)]">
                Guardado
              </span>
              <p className="valor m-0 text-xl font-medium text-[var(--cor-texto)]">
                {formatarMoeda(meta.valorGuardado)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-[var(--cor-mutado)]">
                Alvo
              </span>
              <p className="valor m-0 text-xs font-medium text-[var(--cor-mutado)]">
                de {formatarMoeda(meta.valorAlvo)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-[11px] font-medium text-[var(--cor-mutado)]">
                {meta.concluida
                  ? 'Objetivo alcançado'
                  : `Faltam ${formatarMoeda(meta.valorRestante)}`}
              </span>
              <span className="font-medium text-[var(--cor-secundario)]">
                {percentualInteiro}%
              </span>
            </div>

            <div
              role="progressbar"
              aria-label={`Progresso da meta ${meta.titulo}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentualInteiro}
              aria-valuetext={`${percentualInteiro}% da meta atingida`}
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--cor-elevado)]"
            >
              <div
                className={`h-full rounded-full ${corBarra}`}
                style={{ width: `${percentualInteiro}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-1 text-[11px] text-[var(--cor-mutado)]">
            {meta.valorMensalSugerido && !meta.concluida ? (
              <span className="inline-flex items-center gap-1 font-medium text-[var(--cor-secundario)]">
                <Calendar className="size-3 shrink-0" />
                {formatarMoeda(meta.valorMensalSugerido)}/mês
              </span>
            ) : (
              <span />
            )}

            {meta.prazo ? (
              <span>
                Prazo:{' '}
                {new Date(meta.prazo + 'T00:00:00').toLocaleDateString('pt-BR', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            ) : (
              <span>Sem prazo fixo</span>
            )}
          </div>
        </div>

        {/* Ações rápidas de aporte e resgate */}
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--cor-linha)] pt-3">
          <button
            type="button"
            onClick={() => aoGuardar?.(meta)}
            className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] px-3 py-2 text-xs font-medium text-[var(--cor-texto)] transition-colors hover:border-[var(--cor-secundario)] ${foco}`}
          >
            <Plus className="size-3.5" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            onClick={() => aoResgatar?.(meta)}
            disabled={Number.parseFloat(meta.valorGuardado || '0') <= 0}
            className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-medium text-[var(--cor-secundario)] transition-colors hover:bg-[var(--cor-elevado)] disabled:cursor-not-allowed disabled:opacity-50 ${foco}`}
          >
            <Minus className="size-3.5" />
            <span>Resgatar</span>
          </button>
        </div>
      </div>
    </section>
  )
}

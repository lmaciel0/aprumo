import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { endpoints } from '../../api/endpoints'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { getIconePreset } from './iconesMeta'
import { metaAtingida, percentualExibido } from './percentualMeta'
import { obterPresetVisual } from './presetsVisuais'

interface WidgetMetaInicioProps {
  className?: string
  style?: CSSProperties
}

export function WidgetMetaInicio({ className, style }: WidgetMetaInicioProps = {}) {
  const { data: metas } = useQuery({
    queryKey: ['metas'],
    queryFn: () => endpoints.metas.listar(),
  })

  if (!metas || metas.length === 0) {
    return null
  }

  // Prioriza metas não concluídas
  const metaAtiva = metas.find((m) => !m.concluida) ?? metas[0]
  if (!metaAtiva) {
    return null
  }

  const preset = obterPresetVisual(metaAtiva.presetVisual)
  const percentualInteiro = percentualExibido(metaAtiva.percentualConcluido, metaAtingida(metaAtiva))
  const corBarra = metaAtiva.concluida
    ? 'bg-[var(--cor-positivo)]'
    : 'bg-[var(--cor-grafico-receitas)]'

  return (
    <section
      aria-labelledby="titulo-widget-meta"
      style={style}
      className={`flex items-center justify-between gap-3.5 rounded-[var(--raio-card)] border border-[var(--cor-linha)] bg-[var(--cor-card)] p-3.5${className ? ` ${className}` : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--cor-elevado)] text-[var(--cor-texto)]">
          {getIconePreset(metaAtiva.icone || preset.icone)}
        </div>

        {/* Informações da meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              id="titulo-widget-meta"
              className="m-0 truncate text-xs font-medium text-[var(--cor-texto)]"
            >
              {metaAtiva.titulo}
            </h3>
            <span className="shrink-0 text-xs font-medium text-[var(--cor-secundario)]">
              {percentualInteiro}%
            </span>
          </div>

          {/* Barra de progresso compacta */}
          <div
            role="progressbar"
            aria-label={`Progresso de ${metaAtiva.titulo}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentualInteiro}
            aria-valuetext={`${percentualInteiro}% atingido`}
            className="my-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--cor-elevado)]"
          >
            <div
              className={`h-full rounded-full ${corBarra}`}
              style={{ width: `${percentualInteiro}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--cor-mutado)]">
            <span>
              {formatarMoeda(metaAtiva.valorGuardado)} de{' '}
              {formatarMoeda(metaAtiva.valorAlvo)}
            </span>
            {metaAtiva.concluida && (
              <span className="font-medium text-[var(--cor-positivo-texto)]">Concluída</span>
            )}
          </div>
        </div>
      </div>

      {/* Atalho para /metas */}
      <Link
        to="/metas"
        aria-label="Ver metas"
        className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] text-[var(--cor-texto)] transition-colors hover:border-[var(--cor-secundario)] ${foco}`}
      >
        <ArrowRight className="size-3.5" />
      </Link>
    </section>
  )
}

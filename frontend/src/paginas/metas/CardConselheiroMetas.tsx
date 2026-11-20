import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Target } from 'lucide-react'
import { Link } from 'react-router'
import { endpoints } from '../../api/endpoints'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { getIconePreset } from './iconesMeta'
import { obterPresetVisual } from './presetsVisuais'

interface Props {
  readonly ano: number
  readonly mes: number
  readonly className?: string
}

export function CardConselheiroMetas({ ano, mes, className = '' }: Readonly<Props>) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['metas-conselheiro', ano, mes],
    queryFn: () => endpoints.metas.conselheiro(ano, mes),
  })

  // A sugestão da API não traz o preset: o ícone vem da meta correspondente na lista (mesma chave do widget do painel).
  const { data: metas } = useQuery({
    queryKey: ['metas'],
    queryFn: () => endpoints.metas.listar(),
  })

  if (isPending || isError || !data) {
    return null
  }

  const { sobraPrevistaMes, totalSugeridoAporte, sugestaoTexto, sugestoes } = data
  const sobraNum = Number.parseFloat(sobraPrevistaMes || '0')
  const temSobra = sobraNum > 0
  // O backend monta as sugestões sem olhar a sobra do mês: sem sobra, elas não aparecem.
  const temSugestoes = temSobra && sugestoes.length > 0
  const totalAcimaDaSobra =
    Math.round(Number.parseFloat(totalSugeridoAporte || '0') * 100) > Math.round(sobraNum * 100)

  const renderConteudo = () => {
    if (temSugestoes) {
      return (
        <div className="flex flex-col gap-3">
          <p className="m-0 text-xs text-[var(--cor-mutado)]">
            Sua sobra prevista é de {formatarMoeda(sobraPrevistaMes)}.
            Sugerimos destinar{' '}
            <strong className="font-medium text-[var(--cor-texto)]">
              {formatarMoeda(totalSugeridoAporte)}
            </strong>{' '}
            para suas caixinhas:
          </p>
          {totalAcimaDaSobra && (
            <p className="m-0 text-xs text-[var(--cor-secundario)]">
              Total sugerido acima da sobra prevista do mês.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {sugestoes.map((sugestao) => {
              const meta = metas?.find((m) => m.id === sugestao.metaId)
              const preset = obterPresetVisual(meta?.presetVisual ?? sugestao.presetVisual)
              return (
                <div
                  key={sugestao.metaId}
                  className="flex items-center justify-between rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center text-[var(--cor-secundario)]">
                      {getIconePreset(meta?.icone || sugestao.icone || preset.icone)}
                    </span>
                  <div className="min-w-0">
                      <h3 className="m-0 truncate text-xs font-medium text-[var(--cor-texto)]">
                        {sugestao.titulo}
                      </h3>
                      <p className="m-0 truncate text-[11px] text-[var(--cor-mutado)]">
                        {sugestao.motivo}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 pl-2 valor text-xs font-medium text-[var(--cor-positivo-texto)]">
                    + {formatarMoeda(sugestao.valorSugerido)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (temSobra) {
      return (
        <div className="flex flex-col items-start gap-2 py-1">
          <p className="m-0 text-xs text-[var(--cor-texto)]">
            Você tem sobra prevista este mês ({formatarMoeda(sobraPrevistaMes)}).
            Que tal criar uma caixinha para acelerar seus sonhos ou sua reserva?
          </p>
          <Link
            to="/metas"
            className={`mt-1 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[var(--cor-linha)] bg-[var(--cor-elevado)] px-3.5 text-xs font-medium text-[var(--cor-texto)] no-underline transition-colors hover:border-[var(--cor-secundario)] ${foco}`}
          >
            <Target className="size-3.5" />
            <span>Criar uma meta</span>
          </Link>
        </div>
      )
    }

    return (
      <div className="rounded-[10px] bg-[var(--cor-aviso-fundo)] p-3 text-xs text-[var(--cor-aviso-texto)]">
        <p className="m-0">
          {sugestaoTexto ||
            'Sem sobra prevista para novos aportes este mês. Priorize manter o orçamento e as despesas em dia antes de realizar novos depósitos.'}
        </p>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="titulo-conselheiro-metas"
      className={`card flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Cabeçalho do Card */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--cor-linha)] pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles aria-hidden="true" className="size-4 shrink-0 text-[var(--cor-secundario)]" />
            <div>
              <h2
                id="titulo-conselheiro-metas"
                className="m-0 text-sm font-medium text-[var(--cor-texto)]"
              >
                Conselheiro de Metas
              </h2>
              <span className="text-[11px] text-[var(--cor-mutado)]">
                {temSugestoes
                  ? `Sobra de ${formatarMoeda(sobraPrevistaMes)}`
                  : 'Planejamento com propósito'}
              </span>
            </div>
          </div>

          <Link
            to="/metas"
            className={`inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-[10px] px-1 text-xs font-medium text-[var(--cor-principal)] hover:underline ${foco}`}
          >
            <span>Ver metas</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Conteúdo Contextual */}
        <div className="mt-3.5">
          {renderConteudo()}
        </div>
      </div>
    </section>
  )
}

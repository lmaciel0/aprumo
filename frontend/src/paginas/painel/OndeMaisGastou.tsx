import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { endpoints } from '../../api/endpoints'
import { Esqueleto } from '../../componentes/Esqueleto'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { renderizarIcone } from '../categorias/catalogoIcones'
import { obterCorValida } from '../categorias/paletaCores'
import { formatarPercentual, larguraDaBarra } from '../inicio/valores'
import { topCategorias } from './topCategorias'

const classeAcao = `inline-flex min-h-11 items-center px-1 text-sm font-semibold text-[var(--cor-principal)] underline-offset-4 hover:underline ${foco}`

/**
 * Bloco "Onde mais gastou" da tela inicial: as 3 categorias de maior despesa do mês, com ícone, valor e uma barra do
 * peso de cada uma. Divide as chaves `['resumo', ano, mes]` e `['categorias']` com as outras telas. O catálogo só
 * traz ícone e cor: se falhar, o bloco segue com o ícone padrão em vez de mostrar erro.
 */
export function OndeMaisGastou({ ano, mes }: { ano: number; mes: number }) {
  const resumo = useQuery({
    queryKey: ['resumo', ano, mes],
    queryFn: () => endpoints.resumo(ano, mes),
    placeholderData: keepPreviousData,
  })
  const catalogo = useQuery({
    queryKey: ['categorias'],
    queryFn: () => endpoints.categorias.listar(),
  })

  if (resumo.isPending || (catalogo.isPending && resumo.isSuccess)) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Carregando as categorias…"
        className="card flex min-h-[148px] flex-col gap-3"
      >
        <Esqueleto className="h-4 w-32" />
        <Esqueleto className="h-5 w-full" />
        <Esqueleto className="h-5 w-full" />
        <Esqueleto className="h-5 w-full" />
      </div>
    )
  }

  if (resumo.isError) {
    return (
      <div role="alert" className="card flex flex-wrap items-center gap-3 text-sm">
        <p className="m-0">Não foi possível carregar as categorias.</p>
        <button
          type="button"
          onClick={() => void resumo.refetch()}
          className={`min-h-11 cursor-pointer rounded-full bg-[var(--cor-principal)] px-4 text-sm font-semibold text-[var(--cor-sobre-principal)] ${foco}`}
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  const destaques = topCategorias(resumo.data.categorias, catalogo.data ?? [])

  return (
    <section aria-labelledby="titulo-onde-mais-gastou" className="card">
      <div className="flex flex-wrap items-center justify-between gap-x-3">
        <h2 id="titulo-onde-mais-gastou" className="m-0 text-[15px] font-bold">
          Onde mais gastou
        </h2>
        <Link to="/lancamentos" className={classeAcao}>
          Ver orçamento
        </Link>
      </div>

      {destaques.length === 0 ? (
        <p className="m-0 mt-1 text-sm text-[var(--cor-mutado)]">Nenhuma despesa lançada neste mês.</p>
      ) : (
        <ul className="m-0 mt-1 flex list-none flex-col gap-3 p-0">
          {destaques.map((categoria) => {
            const cor = obterCorValida(categoria.cor)
            return (
              <li key={categoria.categoriaId}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="shrink-0" style={{ color: cor }}>
                    {renderizarIcone(categoria.icone, 'size-5')}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{categoria.nome}</span>
                  <span className="valor shrink-0 font-semibold">{formatarMoeda(categoria.total)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div
                    role="progressbar"
                    aria-label={categoria.nome}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(larguraDaBarra(categoria.percentual))}
                    aria-valuetext={`${formatarPercentual(categoria.percentual)} das despesas`}
                    className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--cor-linha)]"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${larguraDaBarra(categoria.percentual)}%`, backgroundColor: cor }}
                    />
                  </div>
                  {/* O aria-valuetext da barra já lê o percentual: o texto visível fica fora da leitura de tela. */}
                  <span aria-hidden="true" className="valor w-9 shrink-0 text-right text-xs font-semibold">
                    {formatarPercentual(categoria.percentual)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

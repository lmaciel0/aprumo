import { useState } from 'react'
import { foco } from '../../layout/classesFoco'
import {
  isFavorito,
  obterCitacaoDoDia,
  obterProximaCitacao,
  removerFavorito,
  salvarFavorito,
  type Citacao,
} from './citacoes'

const classeBotaoIcone =
  'flex size-11 cursor-pointer items-center justify-center rounded-[10px] text-[var(--cor-secundario)] transition-colors hover:bg-[var(--cor-elevado)]'

export function CardReflexao() {
  const [agora] = useState(() => new Date())
  const [citacao, setCitacao] = useState<Citacao>(() => obterCitacaoDoDia(agora))
  const [favorito, setFavorito] = useState<boolean>(() => isFavorito(citacao.id))
  const [copiado, setCopiado] = useState(false)

  function alternarFavorito() {
    if (favorito) {
      removerFavorito(citacao.id)
      setFavorito(false)
    } else {
      salvarFavorito(citacao.id)
      setFavorito(true)
    }
  }

  function proxima() {
    const prox = obterProximaCitacao(citacao.id)
    setCitacao(prox)
    setFavorito(isFavorito(prox.id))
    setCopiado(false)
  }

  async function copiar() {
    try {
      const texto = `“${citacao.frase}” — ${citacao.autor}, ${citacao.obra}${citacao.detalhe ? ` (${citacao.detalhe})` : ''}`
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Falha ao copiar ignorada
    }
  }

  return (
    <section aria-labelledby="titulo-reflexao-dia" className="card sm:!p-6">
      {/* Topo: rótulo, subtítulo e ações */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--cor-linha)] pb-3">
        <div className="flex items-center gap-2.5">
          <h2 id="titulo-reflexao-dia" className="m-0 text-xs font-medium text-[var(--cor-mutado)]">
            Reflexão do dia
          </h2>
          <span className="hidden text-xs text-[var(--cor-mutado)] sm:inline">Sabedoria diária</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Botão Copiar */}
          <button
            type="button"
            onClick={copiar}
            aria-label="Copiar reflexão"
            title={copiado ? 'Copiado' : 'Copiar citação'}
            className={`${classeBotaoIcone} ${foco}`}
          >
            {copiado ? (
              <svg aria-hidden="true" className="size-4 text-[var(--cor-positivo-texto)]" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          {/* Botão Favoritar */}
          <button
            type="button"
            onClick={alternarFavorito}
            aria-label={favorito ? 'Remover dos favoritos' : 'Favoritar reflexão'}
            aria-pressed={favorito}
            title={favorito ? 'Remover dos favoritos' : 'Favoritar reflexão'}
            className={`${classeBotaoIcone} ${foco}`}
          >
            <svg
              aria-hidden="true"
              className={`size-4 ${favorito ? 'text-[var(--cor-texto)]' : ''}`}
              viewBox="0 0 20 20"
              fill={favorito ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={favorito ? '0' : '1.5'}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>

          {/* Botão Outra Reflexão */}
          <button
            type="button"
            onClick={proxima}
            aria-label="Outra reflexão"
            title="Ver outra reflexão"
            className={`${classeBotaoIcone} ${foco}`}
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Frase */}
      <blockquote className="m-0 min-w-0 text-base leading-relaxed font-normal break-words text-[var(--cor-texto)] sm:text-[17px]">
        <p data-testid="frase-reflexao" className="m-0">
          “{citacao.frase}”
        </p>
      </blockquote>

      {/* Autor e obra */}
      <footer className="mt-3.5 min-w-0 text-xs break-words text-[var(--cor-mutado)]">
        <cite data-testid="autor-reflexao" className="font-medium text-[var(--cor-secundario)] not-italic">
          {citacao.autor}
        </cite>
        {', '}
        <span className="italic">{citacao.obra}</span>
        {citacao.detalhe && (
          <span>
            {' · '}
            {citacao.detalhe}
          </span>
        )}
      </footer>
    </section>
  )
}

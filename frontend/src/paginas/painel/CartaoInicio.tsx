import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { endpoints } from '../../api/endpoints'
import { Esqueleto } from '../../componentes/Esqueleto'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { usePreferencias } from '../../preferencias/usePreferencias'
import { COR_DA_BARRA } from '../cartoes/faixas'
import { formatarPercentual, larguraDaBarra } from '../inicio/valores'
import { escolherCartaoInicio } from './escolherCartaoInicio'
import { ModalEscolherCartao } from './ModalEscolherCartao'

const classeAcao = `inline-flex min-h-11 items-center px-1 text-sm font-semibold text-[var(--cor-principal)] underline-offset-4 hover:underline ${foco}`

/**
 * Bloco "Cartão" da tela inicial: um cartão só (o escolhido na preferência ou, sem ele, o de maior fatura), com
 * vencimento, fatura, uso do limite e quanto ainda está disponível. Divide a chave `['cartoes', ano, mes]` com a tela
 * de Cartões. Sem cartões, não aparece; erro e carregamento ficam só dentro do bloco.
 */
export function CartaoInicio({ ano, mes }: { ano: number; mes: number }) {
  const { preferencias } = usePreferencias()
  const [escolhendo, setEscolhendo] = useState(false)
  const botaoTrocar = useRef<HTMLButtonElement>(null)
  const consulta = useQuery({
    queryKey: ['cartoes', ano, mes],
    queryFn: () => endpoints.cartoes.listar(ano, mes),
  })

  if (consulta.isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Carregando o cartão…"
        className="card flex min-h-[148px] flex-col gap-3"
      >
        <Esqueleto className="h-4 w-20" />
        <Esqueleto className="h-5 w-40" />
        <Esqueleto className="h-2 w-full" />
        <Esqueleto className="h-4 w-48" />
      </div>
    )
  }

  if (consulta.isError) {
    return (
      <div role="alert" className="card flex flex-wrap items-center gap-3 text-sm">
        <p className="m-0">Não foi possível carregar o cartão.</p>
        <button
          type="button"
          onClick={() => void consulta.refetch()}
          className={`min-h-11 cursor-pointer rounded-full bg-[var(--cor-principal)] px-4 text-sm font-semibold text-[var(--cor-sobre-principal)] ${foco}`}
        >
          Tentar de novo
        </button>
      </div>
    )
  }

  const cartoes = consulta.data.cartoes
  const cartao = escolherCartaoInicio(cartoes, preferencias.cartaoInicioId)
  if (!cartao) {
    return null
  }

  const { faixa, uso } = cartao
  const comLimite = faixa !== 'SEM_LIMITE' && uso !== null
  const fecharModal = () => {
    setEscolhendo(false)
    botaoTrocar.current?.focus()
  }

  // O modal fica fora do `.card`: o `backdrop-filter` do card faria o `fixed` do modal medir a partir do card.
  return (
    <>
      <section aria-labelledby="titulo-cartao-inicio" className="card">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <h2 id="titulo-cartao-inicio" className="m-0 text-[15px] font-bold">
            Cartão
          </h2>
          <div className="flex items-center gap-2">
            {cartoes.length >= 2 && (
              <button
                ref={botaoTrocar}
                type="button"
                onClick={() => setEscolhendo(true)}
                className={`cursor-pointer ${classeAcao}`}
              >
                Trocar
              </button>
            )}
            <Link to="/cartoes" className={classeAcao}>
              Ver cartões
            </Link>
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <p className="m-0 min-w-0 truncate text-base font-semibold">{cartao.nome}</p>
          {cartao.diaVencimento !== null && (
            <p className="m-0 shrink-0 text-xs text-[var(--cor-mutado)]">vence dia {cartao.diaVencimento}</p>
          )}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-xs text-[var(--cor-mutado)]">Fatura</span>
          <span className="valor text-xl font-bold">{formatarMoeda(cartao.fatura)}</span>
        </div>

        {comLimite ? (
          <>
            <div className="my-2 flex items-center gap-2">
              <div
                role="progressbar"
                aria-label={`Uso do limite de ${cartao.nome}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(larguraDaBarra(uso))}
                aria-valuetext={`${formatarPercentual(uso)} do limite usado`}
                className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--cor-linha)]"
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${larguraDaBarra(uso)}%`, backgroundColor: COR_DA_BARRA[faixa] }}
                />
              </div>
              {/* O aria-valuetext da barra já lê o percentual: o texto visível fica fora da leitura de tela. */}
              <span aria-hidden="true" className="valor shrink-0 text-xs font-semibold">
                {formatarPercentual(uso)} do limite
              </span>
            </div>
            {cartao.limiteDisponivel != null && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-[var(--cor-mutado)]">Disponível</span>
                <span className="valor text-sm font-semibold">{formatarMoeda(cartao.limiteDisponivel)}</span>
              </div>
            )}
          </>
        ) : (
          <p className="m-0 mt-2 text-xs text-[var(--cor-mutado)]">Sem limite definido</p>
        )}
      </section>
      <ModalEscolherCartao aberto={escolhendo} aoFechar={fecharModal} cartoes={cartoes} />
    </>
  )
}

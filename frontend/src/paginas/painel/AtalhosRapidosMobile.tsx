import { useState } from 'react'
import { Link } from 'react-router'
import { SlidersHorizontal } from 'lucide-react'
import { foco } from '../../layout/classesFoco'
import { usePreferencias } from '../../preferencias/usePreferencias'
import { ATALHOS_PADRAO } from '../../preferencias/preferenciasStorage'
import { CATALOGO_ATALHOS, type AtalhoInfo } from './atalhosCatalogo'
import { ModalPersonalizarAtalhos } from './ModalPersonalizarAtalhos'

function getDestino(atalho: AtalhoInfo, busca: string): { pathname: string; search?: string } {
  const params = new URLSearchParams(atalho.search ? atalho.search.replace(/^\?/, '') : '')
  if (atalho.comMes && busca) {
    const buscaParams = new URLSearchParams(busca.replace(/^\?/, ''))
    buscaParams.forEach((val, key) => params.set(key, val))
  }
  const queryString = params.toString()
  return {
    pathname: atalho.caminho,
    search: queryString ? `?${queryString}` : '',
  }
}

/** Atalhos da Início. `ano` e `mes` são os que a tela mostra (o mês atual), não o `?ano=&mes=` da URL. */
export function AtalhosRapidosMobile({ ano, mes }: { ano: number; mes: number }) {
  const busca = `?ano=${ano}&mes=${mes}`
  const { preferencias } = usePreferencias()
  const [personalizarAberto, setPersonalizarAberto] = useState(false)

  const ids = preferencias.atalhosMobile ?? ATALHOS_PADRAO
  const atalhos: AtalhoInfo[] = ids
    .map((id) => CATALOGO_ATALHOS[id])
    .filter((a): a is AtalhoInfo => Boolean(a))
    .slice(0, 4)

  return (
    <section aria-label="Acesso rápido" className="flex items-stretch gap-1">
      {atalhos.map((atalho) => {
        const destino = getDestino(atalho, busca)
        return (
          <Link
            key={atalho.id}
            to={destino}
            state={atalho.state}
            aria-label={atalho.rotulo}
            className={`group flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border border-[var(--cor-linha)] bg-[var(--cor-card)] px-0 py-1 text-center text-[var(--cor-principal)] no-underline shadow-xs transition-colors hover:border-[var(--cor-principal)] hover:bg-[var(--cor-principal)]/10 active:bg-[var(--cor-principal)]/10 ${foco}`}
          >
            {atalho.icone('size-4 shrink-0')}
            <span className="w-full text-[11px] leading-tight font-semibold tracking-tight break-words text-[var(--cor-texto)]">
              {atalho.rotulo}
            </span>
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => setPersonalizarAberto(true)}
        className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-[var(--cor-principal)] transition-colors hover:bg-[var(--cor-principal)]/10 ${foco}`}
        aria-label="Personalizar atalhos"
      >
        <SlidersHorizontal className="size-4" />
      </button>

      <ModalPersonalizarAtalhos
        aberto={personalizarAberto}
        aoFechar={() => setPersonalizarAberto(false)}
      />
    </section>
  )
}

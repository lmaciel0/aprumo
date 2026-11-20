import { useState } from 'react'
import { CardReflexao } from './CardReflexao'
import { FinancasDoMes } from './FinancasDoMes'
import { WidgetMetaInicio } from '../metas/WidgetMetaInicio'
import { dataPorExtenso, tituloDoMes } from './saudacao'

/** Tela inicial (`/`): o mês e o ano como título, a data por extenso, a reflexão do dia e as finanças do mês atual. */
export function PainelPage() {
  // Fixa a data da primeira renderização: o título não muda sozinho no meio do uso.
  const [agora] = useState(() => new Date())

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="m-0 text-[28px] leading-tight font-medium tracking-tight md:text-[34px]">
          {tituloDoMes(agora)}
        </h1>
        <p className="m-0 mt-1.5 text-[13px] text-[var(--cor-secundario)]">{dataPorExtenso(agora)}</p>
      </header>
      <div className="item-entra" style={{ '--i': 1 } as React.CSSProperties}>
        <CardReflexao />
      </div>
      <WidgetMetaInicio className="item-entra" style={{ '--i': 2 } as React.CSSProperties} />
      <div className="item-entra" style={{ '--i': 3 } as React.CSSProperties}>
        <FinancasDoMes />
      </div>
    </div>
  )
}

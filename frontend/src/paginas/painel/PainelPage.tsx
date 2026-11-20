import { CardReflexao } from './CardReflexao'
import { FinancasDoMes } from './FinancasDoMes'
import { WidgetMetaInicio } from '../metas/WidgetMetaInicio'
import { dataPorExtenso, tituloDoMes } from './saudacao'
import { useAgora } from './useAgora'

/** Tela inicial (`/`): o mês e o ano como título, a data por extenso, a reflexão do dia e as finanças do mês atual. */
export function PainelPage() {
  // Uma só fonte de tempo para o título e para as finanças: na virada do mês os dois mudam juntos.
  const agora = useAgora()

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
        <FinancasDoMes agora={agora} />
      </div>
    </div>
  )
}

import { useAuth } from '../../auth/useAuth'
import { mesAtual } from '../../formato/mes'
import { AtalhosRapidosMobile } from './AtalhosRapidosMobile'
import { CardReflexao } from './CardReflexao'
import { CartaoInicio } from './CartaoInicio'
import { FinancasDoMes } from './FinancasDoMes'
import { WidgetMetaInicio } from '../metas/WidgetMetaInicio'
import { OndeMaisGastou } from './OndeMaisGastou'
import { dataPorExtenso, primeiroNome, saudacao } from './saudacao'
import { useAgora } from './useAgora'

/**
 * Tela inicial (`/`): saudação com o primeiro nome e a data por extenso, atalhos (só abaixo de `md`), finanças do mês
 * atual, cartão, categorias que mais pesaram, meta e, por último, a reflexão do dia.
 */
export function PainelPage() {
  const { usuario } = useAuth()
  // Uma só fonte de tempo para a data e para as finanças: na virada do mês as duas mudam juntas.
  const agora = useAgora()
  const nome = primeiroNome(usuario?.nome)
  const { ano, mes } = mesAtual(agora)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-tight md:text-[34px]">
          {saudacao(agora)}
          {nome !== null && (
            <>
              , <span className="text-[var(--cor-principal)]">{nome}</span>
            </>
          )}
        </h1>
        <p className="m-0 mt-1.5 text-[13px] text-[var(--cor-mutado)]">{dataPorExtenso(agora)}</p>
      </header>
      <div className="item-entra md:hidden" style={{ '--i': 1 } as React.CSSProperties}>
        <AtalhosRapidosMobile ano={ano} mes={mes} />
      </div>
      <div className="item-entra" style={{ '--i': 2 } as React.CSSProperties}>
        <FinancasDoMes agora={agora} />
      </div>
      <CartaoInicio ano={ano} mes={mes} />
      <OndeMaisGastou ano={ano} mes={mes} />
      <WidgetMetaInicio className="item-entra" style={{ '--i': 3 } as React.CSSProperties} />
      <div className="item-entra" style={{ '--i': 4 } as React.CSSProperties}>
        <CardReflexao />
      </div>
    </div>
  )
}

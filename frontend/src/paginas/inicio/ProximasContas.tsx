import type { ProximaConta } from '../../api/tipos'
import { formatarMoeda } from '../../formato/moeda'
import { indiceContaMaisProxima } from './contaMaisProxima'
import { diaEMes } from './valores'

interface Props {
  /** Atrasadas e as que vencem nos próximos 30 dias, por vencimento (independe do mês escolhido). */
  contas: ProximaConta[]
  /** Classes de posição na grade; substituem o `md:col-span-15` de antes. */
  className?: string
  /** Instante de "agora" para achar a conta mais próxima; injetável para teste. */
  hoje?: Date
}

/** Lista das contas a pagar: data `dd/mm`, item, categoria e valor; as atrasadas levam a etiqueta vermelha. */
export function ProximasContas({ contas, className = 'md:col-span-15', hoje = new Date() }: Props) {
  const maisProxima = indiceContaMaisProxima(contas, hoje)
  return (
    <section aria-labelledby="titulo-proximas" className={`card ${className}`.trim()}>
      <h2 id="titulo-proximas" className="m-0 text-[15px] font-medium">
        Próximas contas
      </h2>
      {contas.length === 0 ? (
        <p className="m-0 mt-3 text-sm text-[var(--cor-mutado)]">Nenhuma conta a vencer.</p>
      ) : (
        <ul className="m-0 mt-2 list-none p-0">
          {contas.map((conta, indice) => {
            const marcada = indice === maisProxima
            // Todas as linhas têm o mesmo recuo (colunas alinhadas); só a conta mais próxima de hoje leva o fio de prumo.
            const classes = `relative grid grid-cols-[3rem_1fr_auto] items-center gap-2 border-t border-[var(--cor-linha)] py-2 pl-3 text-[12.5px] first:border-t-0${marcada ? ' shadow-[inset_2px_0_0_var(--cor-principal)]' : ''}`
            return (
              <li key={conta.lancamentoId} className={classes}>
                {marcada && <span className="sr-only">mais próxima: </span>}
                <time dateTime={conta.vencimento} className={`valor ${marcada ? 'font-medium' : 'font-normal'}`}>
                  {diaEMes(conta.vencimento)}
                </time>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{conta.itemNome}</span>
                  <span className="block truncate text-[11px] text-[var(--cor-mutado)]">{conta.categoriaNome}</span>
                </span>
                <span className="flex flex-col items-end gap-0.5">
                  <span className="valor font-medium">{formatarMoeda(conta.valor)}</span>
                  {conta.atrasada && (
                    <span className="rounded-md bg-[var(--cor-erro-fundo)] px-2 py-0.5 text-[11px] font-semibold text-[var(--cor-negativo-texto)]">
                      atrasada
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

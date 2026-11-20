import { useId } from 'react'
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { mesAtual as mesDeHoje } from '../../formato/mes'
import { COR_DESPESAS, COR_RECEITAS, FUNDO_DESPESAS_PREVISTAS, FUNDO_RECEITAS_PREVISTAS } from './cores'
import { TooltipResultado } from './TooltipResultado'
import { partesResultadoCurto, type PontoDoResultado } from './valores'

// Sobra e déficit ficam na cor do texto: o sinal (+ ou −) do rótulo diz o sentido; verde e vermelho só em status.
const COR_DO_SENTIDO: Record<PontoDoResultado['sentido'], string> = {
  sobrou: 'var(--cor-texto)',
  faltou: 'var(--cor-texto)',
  zero: 'var(--cor-mutado)',
}

/** O rótulo "0" (resultado que arredonda para zero) fica na cor mutada, mesmo que o sentido seja sobrou/faltou. */
function corDoRotulo(ponto: PontoDoResultado): string {
  return Math.round(Math.abs(ponto.resultado)) === 0 ? COR_DO_SENTIDO.zero : COR_DO_SENTIDO[ponto.sentido]
}

interface PadraoProps {
  id: string
  cor: string
  fundo: string
}

/** Listras diagonais: a parte ainda prevista (não paga) da barra. */
function PadraoListrado({ id, cor, fundo }: PadraoProps) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill={fundo} />
      <rect width="3" height="6" fill={cor} />
    </pattern>
  )
}

interface MesNoEixoProps {
  x?: number | string
  y?: number | string
  payload?: { value?: unknown }
  dados: PontoDoResultado[]
  /** Mês atual (o do fio de prumo); `undefined` quando o ano exibido não é o atual. */
  mesAtual?: number
  compacto: boolean
}

/**
 * Rótulo do eixo: o mês e, abaixo, o resultado dele com sinal. No celular as colunas têm cerca de 25 px, então o
 * milhar quebra em duas linhas (`−1,2` e, embaixo, `mil`) para não encostar no rótulo do mês vizinho.
 */
export function MesNoEixo({ x = 0, y = 0, payload, dados, mesAtual, compacto }: MesNoEixoProps) {
  const ponto = dados.find((candidato) => candidato.rotulo === payload?.value)
  if (!ponto) {
    return null
  }
  const destacado = ponto.mes === mesAtual
  const { numero, sufixo } = partesResultadoCurto(ponto.resultado)
  const quebra = compacto && sufixo !== ''
  return (
    <g transform={`translate(${x},${Number(y)})`}>
      <text
        y={14}
        textAnchor="middle"
        fontSize={10}
        fontWeight={destacado ? 500 : 400}
        fill={destacado ? 'var(--cor-texto)' : 'var(--cor-mutado)'}
        data-mes-atual={destacado ? 'true' : undefined}
      >
        {ponto.rotulo}
      </text>
      <text y={28} textAnchor="middle" fontSize={compacto ? 9 : 10} fontWeight={600} fill={corDoRotulo(ponto)}>
        {quebra ? (
          <>
            <tspan x={0}>{numero}</tspan>
            <tspan x={0} dy="1.1em">
              {sufixo}
            </tspan>
          </>
        ) : (
          sufixo === '' ? numero : `${numero} ${sufixo}`
        )}
      </text>
    </g>
  )
}

interface FioProps {
  x1?: number
  x2?: number
  y1?: number
  y2?: number
}

/** O fio de prumo: linha vertical de 2 px no acento, só decoração (o leitor de tela já tem a tabela). */
function FioDePrumo({ x1, x2, y1, y2 }: FioProps) {
  return (
    <g data-fio-prumo aria-hidden="true">
      <line x1={x1} x2={x2} y1={y1} y2={y2} stroke="var(--cor-principal)" strokeWidth={2} />
    </g>
  )
}

interface Props {
  ano: number
  dados: PontoDoResultado[]
  compacto: boolean
  /** Instante de "agora"; injetável para teste. */
  hoje?: Date
}

/**
 * Barras espelhadas por mês numa única pilha: receitas sobem da linha zero e despesas (negativas) descem, cada lado
 * empilhando a parte paga (cor cheia) e a prevista (padrão listrado).
 */
export default function BarrasDoResultado({ ano, dados, compacto, hoje = new Date() }: Props) {
  const idBase = useId()
  const idReceitasPrevistas = `${idBase}-receitas-previstas`
  const idDespesasPrevistas = `${idBase}-despesas-previstas`
  const agora = mesDeHoje(hoje)
  const doMesAtual = agora.ano === ano ? dados.find((ponto) => ponto.mes === agora.mes) : undefined

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dados} stackOffset="sign" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <PadraoListrado id={idReceitasPrevistas} cor={COR_RECEITAS} fundo={FUNDO_RECEITAS_PREVISTAS} />
          <PadraoListrado id={idDespesasPrevistas} cor={COR_DESPESAS} fundo={FUNDO_DESPESAS_PREVISTAS} />
        </defs>
        <XAxis
          dataKey="rotulo"
          height={compacto ? 48 : 36}
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={(props) => (
            <MesNoEixo
              x={props.x}
              y={props.y}
              payload={props.payload}
              dados={dados}
              mesAtual={doMesAtual?.mes}
              compacto={compacto}
            />
          )}
        />
        <Tooltip
          cursor={{ fill: 'var(--cor-fundo)' }}
          content={({ active, payload }) => (
            <TooltipResultado ponto={active ? ((payload?.[0]?.payload as PontoDoResultado | undefined) ?? null) : null} />
          )}
        />
        <Bar dataKey="receitasPagas" stackId="fluxo" fill={COR_RECEITAS} isAnimationActive={false} />
        <Bar
          dataKey="receitasPrevistas"
          stackId="fluxo"
          fill={`url(#${idReceitasPrevistas})`}
          isAnimationActive={false}
        />
        <Bar dataKey="despesasPagas" stackId="fluxo" fill={COR_DESPESAS} isAnimationActive={false} />
        <Bar
          dataKey="despesasPrevistas"
          stackId="fluxo"
          fill={`url(#${idDespesasPrevistas})`}
          isAnimationActive={false}
        />
        <ReferenceLine y={0} stroke="var(--cor-linha)" />
        {doMesAtual && <ReferenceLine x={doMesAtual.rotulo} ifOverflow="visible" shape={FioDePrumo} />}
      </BarChart>
    </ResponsiveContainer>
  )
}

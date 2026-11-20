import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PontoSerie } from '../../api/tipos'
import { GraficoResultado } from './GraficoResultado'
import { formatarComSinal, resultadoAcumulado } from './valores'

const semNbsp = (texto: string | null | undefined) => (texto ?? '').replace(/ /g, ' ')

const zeroSerie = (): PontoSerie[] =>
  Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receitas: '0.00',
    receitasPrevistas: '0.00',
    despesas: '0.00',
    despesasPrevistas: '0.00',
  }))

// Valores fictícios: novembro tem 1000 de receitas (400 previstas) e 800 de despesas (200 previstas).
const serieDeTeste = (): PontoSerie[] => {
  const serie = zeroSerie()
  serie[10] = { mes: 11, receitas: '1000.00', receitasPrevistas: '400.00', despesas: '800.00', despesasPrevistas: '200.00' }
  return serie
}

async function renderizar(serie = serieDeTeste()) {
  render(<GraficoResultado ano={2026} mes={10} serie={serie} hoje={new Date('2026-10-15T15:00:00Z')} />)
  const grafico = await screen.findByRole('group', { name: 'Gráfico do resultado de cada mês em 2026' })
  await waitFor(() => expect(grafico.querySelectorAll('.recharts-bar')).toHaveLength(4))
  return grafico
}

// 15/10/2026 ao meio-dia em São Paulo: outubro é o mês atual.
const HOJE = new Date('2026-10-15T15:00:00Z')

describe('GraficoResultado: fio de prumo', () => {
  async function comHoje(hoje: Date, mes = 10, serie = serieDeTeste()) {
    render(<GraficoResultado ano={2026} mes={mes} serie={serie} hoje={hoje} />)
    const grafico = await screen.findByRole('group', { name: 'Gráfico do resultado de cada mês em 2026' })
    await waitFor(() => expect(grafico.querySelectorAll('.recharts-bar')).toHaveLength(4))
    return grafico
  }

  it('o mês atual tem um fio de 2 px em --cor-principal, escondido do leitor de tela', async () => {
    const grafico = await comHoje(HOJE)

    const fios = grafico.querySelectorAll('[data-fio-prumo]')
    expect(fios).toHaveLength(1)
    const linha = fios[0]!.tagName === 'line' ? fios[0]! : fios[0]!.querySelector('line')!
    expect(linha).toHaveAttribute('stroke', 'var(--cor-principal)')
    expect(linha).toHaveAttribute('stroke-width', '2')
    expect(fios[0]!.closest('[aria-hidden="true"]') ?? fios[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('o fio fica na coluna do mês atual, não na do mês selecionado', async () => {
    const grafico = await comHoje(HOJE, 3)

    const x = (el: Element) => Number(el.getAttribute('x1') ?? el.getAttribute('x'))
    const fio = grafico.querySelector('[data-fio-prumo]')!
    const linha = fio.tagName === 'line' ? fio : fio.querySelector('line')!
    const rotuloOut = within(grafico).getByText('Out').closest('g')!
    const centroOut = Number(/translate\(([-\d.]+)/.exec(rotuloOut.getAttribute('transform') ?? '')?.[1])
    expect(x(linha)).toBeCloseTo(centroOut, 0)
  })

  it('mês atual sem valores ainda mostra o fio', async () => {
    const grafico = await comHoje(HOJE, 10, zeroSerie())

    expect(grafico.querySelectorAll('[data-fio-prumo]')).toHaveLength(1)
  })

  it('ano exibido diferente do atual não tem fio', async () => {
    const grafico = await comHoje(new Date('2027-10-15T15:00:00Z'))

    expect(grafico.querySelectorAll('[data-fio-prumo]')).toHaveLength(0)
  })

  it('o rótulo do mês atual fica em peso 500 e cor do texto, os demais em 400 e mutado, seja qual for o selecionado', async () => {
    const grafico = await comHoje(HOJE, 11)

    const out = within(grafico).getByText('Out')
    const nov = within(grafico).getByText('Nov')
    expect(out).toHaveAttribute('font-weight', '500')
    expect(out).toHaveAttribute('fill', 'var(--cor-texto)')
    expect(nov).toHaveAttribute('font-weight', '400')
    expect(nov).toHaveAttribute('fill', 'var(--cor-mutado)')
  })

  it('ano exibido diferente do atual não destaca nenhum rótulo de mês', async () => {
    const grafico = await comHoje(new Date('2027-10-15T15:00:00Z'), 10)

    for (const rotulo of ['Out', 'Nov', 'Jan']) {
      const texto = within(grafico).getByText(rotulo)
      expect(texto).toHaveAttribute('font-weight', '400')
      expect(texto).toHaveAttribute('fill', 'var(--cor-mutado)')
    }
  })

  it('não há mais contorno em caixa no mês', async () => {
    const grafico = await comHoje(HOJE)

    expect(grafico.querySelector('.recharts-reference-area')).toBeNull()
    expect(grafico.innerHTML).not.toContain('--cor-principal-fundo')
    expect(grafico.innerHTML).not.toMatch(/outline/)
  })
})

describe('GraficoResultado', () => {
  it('tem_regiao_nomeada_grupo_e_legenda', async () => {
    await renderizar()

    expect(screen.getByRole('region', { name: 'Resultado de cada mês em 2026' })).toBeInTheDocument()
    const legenda = screen.getByRole('list', { name: 'Legenda do gráfico' })
    expect(within(legenda).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Receitas',
      'Despesas',
      'Previsto',
    ])
  })

  it('barras_espelhadas_com_parte_prevista_listrada', async () => {
    const grafico = await renderizar()

    const [receitasPagas, receitasPrevistas, despesasPagas, despesasPrevistas] = [
      ...grafico.querySelectorAll('.recharts-bar'),
    ].map((barra) => barra.querySelector('path.recharts-rectangle'))
    const numero = (barra: Element | null | undefined, atributo: string) => Number(barra?.getAttribute(atributo))

    expect(receitasPagas).toHaveAttribute('fill', 'var(--cor-grafico-receitas)')
    expect(despesasPagas).toHaveAttribute('fill', 'var(--cor-grafico-despesas)')
    const padroes = [...grafico.querySelectorAll('pattern')].map((padrao) => `url(#${padrao.id})`)
    expect(padroes).toHaveLength(2)
    expect(padroes).toContain(receitasPrevistas?.getAttribute('fill'))
    expect(padroes).toContain(despesasPrevistas?.getAttribute('fill'))
    // Receitas 600 + 400 = 1000; despesas 600 + 200 = 800 (as previstas fazem parte do total).
    // Nas barras que descem o Recharts devolve `height` negativo: o que importa é o tamanho.
    const altura = (barra: Element | null | undefined) => Math.abs(numero(barra, 'height'))
    expect(altura(receitasPagas) / altura(receitasPrevistas)).toBeCloseTo(1.5)
    expect(altura(despesasPagas) / altura(despesasPrevistas)).toBeCloseTo(3)
    const totalReceitas = altura(receitasPagas) + altura(receitasPrevistas)
    const totalDespesas = altura(despesasPagas) + altura(despesasPrevistas)
    expect(totalReceitas / totalDespesas).toBeCloseTo(1.25)
    // Espelhadas: a barra de despesas começa onde a de receitas termina (a linha zero) e desce.
    const baseDasReceitas = numero(receitasPagas, 'y') + altura(receitasPagas)
    expect(numero(despesasPagas, 'y')).toBeGreaterThanOrEqual(baseDasReceitas)
  })

  it('mostra_o_resultado_com_sinal_abaixo_do_mes', async () => {
    const grafico = await renderizar()

    expect(within(grafico).getByText('+200')).toBeInTheDocument()
    expect(within(grafico).getAllByText('0')).toHaveLength(11)
    expect(within(grafico).getByText('Out')).toHaveAttribute('data-mes-atual', 'true')
    expect(within(grafico).getByText('Nov')).not.toHaveAttribute('data-mes-atual', 'true')
    expect(within(grafico).getByText('Jan')).not.toHaveAttribute('data-mes-atual', 'true')
  })

  it('mes_com_deficit_leva_sinal_menos_sem_cor_de_alerta_e_sobra_idem', async () => {
    const serie = zeroSerie()
    serie[0] = { mes: 1, receitas: '500.00', receitasPrevistas: '0.00', despesas: '3000.00', despesasPrevistas: '0.00' }
    serie[1] = { mes: 2, receitas: '900.00', receitasPrevistas: '0.00', despesas: '100.00', despesasPrevistas: '0.00' }
    const grafico = await renderizar(serie)

    // No celular (o jsdom é "não desktop") o milhar quebra em duas linhas: `−2,5` e `mil`.
    const deficit = within(grafico).getByText('−2,5').closest('text')!
    expect(deficit).toHaveTextContent('−2,5mil')
    const sobra = within(grafico).getByText('+800')
    for (const rotulo of [deficit, sobra]) {
      expect(rotulo.getAttribute('fill')).not.toMatch(/cor-negativo|cor-positivo/)
    }
    const acumulado = screen.getByText(/^Acumulado até outubro/).querySelector('strong')
    expect(acumulado?.className).not.toMatch(/cor-negativo|cor-positivo/)
  })

  it('mostra_o_acumulado_do_ano_ate_o_mes_selecionado', async () => {
    const serie = zeroSerie()
    serie[0] = { mes: 1, receitas: '500.00', receitasPrevistas: '0.00', despesas: '800.00', despesasPrevistas: '0.00' }
    await renderizar(serie)

    const esperado = formatarComSinal(resultadoAcumulado(serie, 10))
    expect(semNbsp(esperado)).toBe('−R$ 300,00')
    expect(semNbsp(screen.getByText(/^Acumulado até outubro/).textContent)).toContain(semNbsp(esperado))
  })

  it('resultado_menor_que_um_real_sai_0_na_cor_mutada', async () => {
    const serie = zeroSerie()
    serie[0] = { mes: 1, receitas: '500.30', receitasPrevistas: '0.00', despesas: '500.00', despesasPrevistas: '0.00' }
    serie[1] = { mes: 2, receitas: '500.00', receitasPrevistas: '0.00', despesas: '500.30', despesasPrevistas: '0.00' }
    const grafico = await renderizar(serie)

    const rotulos = within(grafico).getAllByText('0')
    expect(rotulos).toHaveLength(12)
    for (const rotulo of rotulos) {
      expect(rotulo).toHaveAttribute('fill', 'var(--cor-mutado)')
    }
  })

  it('tabela_escondida_com_os_doze_meses', async () => {
    await renderizar()

    const tabela = screen.getByRole('table', { name: 'Resultado de cada mês em 2026' })
    const linhas = within(tabela).getAllByRole('row')
    expect(linhas).toHaveLength(13)
    const celulas = (linha: HTMLElement) => [...linha.querySelectorAll('th, td')].map((c) => semNbsp(c.textContent))
    expect(celulas(linhas[0]!)).toEqual(['Mês', 'Receitas', 'Despesas', 'Resultado'])
    expect(celulas(linhas[11]!)).toEqual(['Nov', 'R$ 1.000,00', 'R$ 800,00', 'R$ 200,00'])
  })

  it('tabela_escondida_marca_o_mes_atual_no_texto', async () => {
    await renderizar()

    const tabela = screen.getByRole('table', { name: 'Resultado de cada mês em 2026' })
    expect(within(tabela).getByRole('rowheader', { name: 'Out (mês atual)' })).toBeInTheDocument()
    expect(within(tabela).getByRole('rowheader', { name: 'Nov' })).toBeInTheDocument()
    expect(within(tabela).getAllByText(/mês atual/)).toHaveLength(1)
  })

  it('serie_vazia_nao_quebra', async () => {
    render(<GraficoResultado ano={2026} mes={10} serie={[]} />)

    expect(await screen.findByRole('region', { name: 'Resultado de cada mês em 2026' })).toBeInTheDocument()
    const grafico = await screen.findByRole('group', { name: 'Gráfico do resultado de cada mês em 2026' })
    await waitFor(() => expect(grafico.querySelector('.recharts-wrapper')).toBeInTheDocument())
    expect(semNbsp(screen.getByText(/^Acumulado até outubro/).textContent)).toContain('R$ 0,00')
    const tabela = screen.getByRole('table', { name: 'Resultado de cada mês em 2026' })
    expect(within(tabela).getAllByRole('row')).toHaveLength(1)
  })
})

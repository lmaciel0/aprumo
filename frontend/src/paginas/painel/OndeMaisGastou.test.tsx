import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { CATEGORIAS_API, RESUMO_API } from '../../teste/fixturesInicio'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { FinancasDoMes } from './FinancasDoMes'
import { OndeMaisGastou } from './OndeMaisGastou'

function responderResumo(corpo: JsonBodyType = RESUMO_API, status = 200) {
  servidor.use(http.get('/api/resumo', () => HttpResponse.json(corpo, { status })))
}

function responderCategorias(corpo: JsonBodyType = CATEGORIAS_API, status = 200) {
  servidor.use(http.get('/api/categorias', () => HttpResponse.json(corpo, { status })))
}

describe('OndeMaisGastou', () => {
  beforeEach(() => {
    responderResumo()
    responderCategorias()
  })

  it('mostra as 3 maiores categorias', async () => {
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(await screen.findByText('Doméstica')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('Entretenimento')).toBeInTheDocument()
    expect(screen.queryByText('Saúde')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Onde mais gastou' })).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
  })

  it('cada barra tem o valor em texto', async () => {
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    const barras = await screen.findAllByRole('progressbar')
    expect(barras).toHaveLength(3)
    expect(barras[0]).toHaveAttribute('aria-valuetext', '47% das despesas')
    expect(barras[0]).toHaveAttribute('aria-valuenow', '47')
    expect(barras[0]).toHaveAccessibleName('Doméstica')
  })

  it('mostra o percentual de cada categoria em texto visível, escondido do leitor de tela', async () => {
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    await screen.findAllByRole('progressbar')
    for (const percentual of ['47%', '25%']) {
      expect(screen.getByText(percentual)).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('categoria fora do catálogo aparece sem erro', async () => {
    responderResumo({ ...RESUMO_API, categorias: [RESUMO_API.categorias[4]] })
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(await screen.findByText('Pessoais')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '5% das despesas')
  })

  it('sem despesas mostra o estado vazio', async () => {
    responderResumo({ ...RESUMO_API, categorias: [] })
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(await screen.findByText('Nenhuma despesa lançada neste mês.')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Onde mais gastou' })).toBeInTheDocument()
  })

  it('link leva ao orçamento', async () => {
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)
    await screen.findByText('Doméstica')

    expect(screen.getByRole('link', { name: 'Ver orçamento' })).toHaveAttribute('href', '/lancamentos')
  })

  it('mostra o esqueleto enquanto carrega', () => {
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(screen.getByRole('status', { name: 'Carregando as categorias…' })).toBeInTheDocument()
  })

  it('erro no resumo mostra tentar de novo', async () => {
    responderResumo({ mensagem: 'falhou' }, 500)
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(await screen.findByText('Não foi possível carregar as categorias.')).toBeInTheDocument()

    responderResumo()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Doméstica')).toBeInTheDocument()
  })

  it('catálogo com erro não derruba o bloco', async () => {
    responderCategorias({ mensagem: 'falhou' }, 500)
    renderComApp(<OndeMaisGastou ano={2026} mes={11} />)

    expect(await screen.findByText('Doméstica')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('usa a mesma chave do resumo', async () => {
    let chamadas = 0
    servidor.use(
      http.get('/api/resumo', () => {
        chamadas += 1
        return HttpResponse.json(RESUMO_API)
      }),
    )

    renderComApp(
      <>
        <FinancasDoMes agora={new Date(2026, 10, 15)} />
        <OndeMaisGastou ano={2026} mes={11} />
      </>,
    )

    expect(await screen.findByText('Entretenimento')).toBeInTheDocument()
    expect(await screen.findByText('Sobra do mês')).toBeInTheDocument()
    expect(chamadas).toBe(1)
  })
})

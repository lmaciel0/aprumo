import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { PreferenciasProvider } from '../../preferencias/PreferenciasContext'
import { CHAVE_PREFERENCIAS } from '../../preferencias/preferenciasStorage'
import { CARTOES_API } from '../../teste/fixturesInicio'
import { renderComApp } from '../../teste/render'
import { servidor } from '../../teste/servidor'
import { CartaoInicio } from './CartaoInicio'

const [NUBANK, ITAU, INTER, MERCADO_PAGO] = CARTOES_API.cartoes

function responderCartoes(corpo: JsonBodyType = CARTOES_API, status = 200) {
  servidor.use(http.get('/api/cartoes', () => HttpResponse.json(corpo, { status })))
}

function preferir(cartaoInicioId: number) {
  localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ cartaoInicioId }))
}

function renderizar() {
  return renderComApp(
    <PreferenciasProvider>
      <CartaoInicio ano={2026} mes={11} />
    </PreferenciasProvider>,
  )
}

describe('CartaoInicio', () => {
  beforeEach(() => {
    localStorage.clear()
    responderCartoes()
  })

  it('mostra o cartão de maior fatura sem preferência', async () => {
    renderizar()

    expect(await screen.findByText(ITAU!.nome)).toBeInTheDocument()
    expect(screen.getByText('vence dia 5')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.240,50')).toBeInTheDocument()
    expect(screen.getByText('R$ 3.759,50')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartões' })).toHaveAttribute('href', '/cartoes')
  })

  it('mostra o cartão escolhido na preferência', async () => {
    preferir(NUBANK!.itemId)
    renderizar()

    expect(await screen.findByText(NUBANK!.nome)).toBeInTheDocument()
    expect(screen.queryByText(ITAU!.nome)).not.toBeInTheDocument()
  })

  it('trocar grava a preferência', async () => {
    const user = userEvent.setup()
    renderizar()
    await screen.findByText(ITAU!.nome)

    await user.click(screen.getByRole('button', { name: 'Trocar' }))
    const dialogo = screen.getByRole('dialog', { name: 'Cartão da Início' })
    expect(within(dialogo).getByRole('radio', { name: new RegExp(ITAU!.nome) })).toBeChecked()

    await user.click(within(dialogo).getByRole('radio', { name: new RegExp(MERCADO_PAGO!.nome) }))
    await user.click(within(dialogo).getByRole('button', { name: 'Pronto' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const bloco = screen.getByRole('region', { name: 'Cartão' })
    expect(within(bloco).getByText(MERCADO_PAGO!.nome)).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? '{}').cartaoInicioId).toBe(MERCADO_PAGO!.itemId)
  })

  it('Esc fecha o modal e devolve o foco ao botão Trocar', async () => {
    const user = userEvent.setup()
    renderizar()
    await screen.findByText(ITAU!.nome)

    await user.click(screen.getByRole('button', { name: 'Trocar' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trocar' })).toHaveFocus()
  })

  it('com um só cartão não oferece Trocar', async () => {
    responderCartoes({ ...CARTOES_API, cartoes: [NUBANK] })
    renderizar()

    expect(await screen.findByText(NUBANK!.nome)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Trocar' })).not.toBeInTheDocument()
  })

  it('cartão sem limite não mostra barra', async () => {
    preferir(INTER!.itemId)
    renderizar()

    expect(await screen.findByText(INTER!.nome)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByText('Sem limite definido')).toBeInTheDocument()
  })

  it('sem vencimento omite a linha', async () => {
    preferir(MERCADO_PAGO!.itemId)
    renderizar()

    expect(await screen.findByText(MERCADO_PAGO!.nome)).toBeInTheDocument()
    expect(screen.queryByText(/vence dia/)).not.toBeInTheDocument()
  })

  it('sem cartões não renderiza nada', async () => {
    responderCartoes({ ...CARTOES_API, cartoes: [] })
    renderizar()

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
    expect(screen.queryByText('Cartão')).not.toBeInTheDocument()
  })

  it('erro mostra tentar de novo', async () => {
    responderCartoes({ mensagem: 'falhou' }, 500)
    renderizar()

    expect(await screen.findByText('Não foi possível carregar o cartão.')).toBeInTheDocument()

    responderCartoes()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText(ITAU!.nome)).toBeInTheDocument()
  })

  it('barra tem o valor em texto', async () => {
    preferir(NUBANK!.itemId)
    renderizar()

    const barra = await screen.findByRole('progressbar')
    expect(barra).toHaveAttribute('aria-valuetext', '73% do limite usado')
    expect(barra).toHaveAttribute('aria-valuenow', '73')
  })
})

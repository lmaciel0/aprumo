import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { metaDaApi } from '../../api/adaptadorMetas'
import { META_API_EM_ANDAMENTO, META_API_SEM_PRAZO } from '../../teste/fixturesMetas'
import { ModalMetaForm } from './ModalMetaForm'

// Props de UI vindas do JSON real da API (nome, mesAlvo, anoAlvo, imagemUrl).
const metaExemplo = metaDaApi({ ...META_API_EM_ANDAMENTO, nome: 'Reserva de Emergência', presetVisual: 'reserva' })
const metaSemPrazo = metaDaApi(META_API_SEM_PRAZO)

describe('ModalMetaForm', () => {
  it('renderiza campos vazios para criação e valida campos obrigatórios', async () => {
    const user = userEvent.setup()
    const aoSalvar = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalMetaForm
        aberto={true}
        meta={null}
        aoSalvar={aoSalvar}
        aoFechar={aoFechar}
      />,
    )

    expect(screen.getByRole('heading', { name: /nova meta ou caixinha/i })).toBeInTheDocument()

    const inputTitulo = screen.getByLabelText(/título/i)
    const inputAlvo = screen.getByLabelText(/valor alvo/i)

    await user.type(inputTitulo, 'Carro Novo')
    await user.type(inputAlvo, '45000,00')

    const btnSalvar = screen.getByRole('button', { name: /salvar meta/i })
    await user.click(btnSalvar)

    expect(aoSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Carro Novo',
        valorAlvo: '45000.00',
      }),
    )
  })

  it('permite escolher um preset visual e envia só o preset, sem ícone nem cores de degradê', async () => {
    const user = userEvent.setup()
    const aoSalvar = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalMetaForm
        aberto={true}
        meta={null}
        aoSalvar={aoSalvar}
        aoFechar={aoFechar}
      />,
    )

    const botaoPresetViagem = screen.getByRole('button', { name: /viagem & férias/i })
    await user.click(botaoPresetViagem)

    const inputTitulo = screen.getByLabelText(/título/i)
    const inputAlvo = screen.getByLabelText(/valor alvo/i)
    await user.type(inputTitulo, 'Paris 2027')
    await user.type(inputAlvo, '12000,00')

    const btnSalvar = screen.getByRole('button', { name: /salvar meta/i })
    await user.click(btnSalvar)

    expect(aoSalvar).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'Paris 2027',
        valorAlvo: '12000.00',
        presetVisual: 'viagem',
      }),
    )
    const enviado = aoSalvar.mock.calls[0]?.[0] as Record<string, unknown>
    expect(enviado).not.toHaveProperty('icone')
    expect(Object.keys(enviado).filter((k) => k.startsWith('corGradiente'))).toEqual([])
  })

  it('o prazo é um campo de mês e ano, com o rótulo "Prazo Estimado (opcional)"', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const prazo = screen.getByLabelText('Prazo Estimado (opcional)')
    expect(prazo).toHaveAttribute('type', 'month')
    expect(prazo).toHaveValue('')
  })

  it('escolher o mês envia o prazo como AAAA-MM e sem mês envia nulo', async () => {
    const user = userEvent.setup()
    const aoSalvar = vi.fn()
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={aoSalvar} aoFechar={vi.fn()} />)

    await user.type(screen.getByLabelText(/título/i), 'Notebook')
    await user.type(screen.getByLabelText(/valor alvo/i), '4500')
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))
    expect(aoSalvar).toHaveBeenLastCalledWith(expect.objectContaining({ prazo: null }))

    fireEvent.change(screen.getByLabelText(/prazo/i), { target: { value: '2028-03' } })
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))
    expect(aoSalvar).toHaveBeenLastCalledWith(expect.objectContaining({ prazo: '2028-03' }))
  })

  describe('prazo digitado em navegador sem type="month" (campo de texto)', () => {
    // jsdom sanitiza type="month"; trocar para text imita Firefox/Safari desktop, onde o campo é texto livre.
    const prepararCampoTexto = async (digitado: string, aoSalvar = vi.fn()) => {
      const user = userEvent.setup()
      render(<ModalMetaForm aberto={true} meta={null} aoSalvar={aoSalvar} aoFechar={vi.fn()} />)
      await user.type(screen.getByLabelText(/título/i), 'Notebook')
      await user.type(screen.getByLabelText(/valor alvo/i), '4500')
      const prazo = screen.getByLabelText(/prazo/i)
      prazo.setAttribute('type', 'text')
      fireEvent.change(prazo, { target: { value: digitado } })
      await user.click(screen.getByRole('button', { name: /salvar meta/i }))
      return aoSalvar
    }

    it('o campo tem placeholder AAAA-MM', () => {
      render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)
      expect(screen.getByLabelText(/prazo/i)).toHaveAttribute('placeholder', 'AAAA-MM')
    })

    it('MM/AAAA é normalizado para AAAA-MM no envio', async () => {
      const aoSalvar = await prepararCampoTexto('06/2027')
      expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({ prazo: '2027-06' }))
    })

    it('AAAA-MM digitado continua valendo', async () => {
      const aoSalvar = await prepararCampoTexto('2027-06')
      expect(aoSalvar).toHaveBeenCalledWith(expect.objectContaining({ prazo: '2027-06' }))
    })

    it.each(['13/2027', '00/2027', '2027-13', 'junho de 2027'])(
      'prazo inválido "%s" mostra erro com role=alert e não envia',
      async (digitado) => {
        const aoSalvar = await prepararCampoTexto(digitado)
        expect(aoSalvar).not.toHaveBeenCalled()
        const alerta = screen.getByRole('alert')
        expect(alerta).toHaveTextContent(/prazo/i)
      },
    )
  })

  it('na edição o campo de mês vem preenchido com o prazo da meta e vazio quando não há prazo', () => {
    const { unmount } = render(
      <ModalMetaForm aberto={true} meta={metaExemplo} aoSalvar={vi.fn()} aoFechar={vi.fn()} />,
    )
    expect(screen.getByLabelText(/prazo/i)).toHaveValue('2027-12')
    unmount()

    render(<ModalMetaForm aberto={true} meta={metaSemPrazo} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)
    expect(screen.getByLabelText(/prazo/i)).toHaveValue('')
  })

  it('preenche dados na edição e permite exclusão da meta', async () => {
    const user = userEvent.setup()
    const aoSalvar = vi.fn()
    const aoExcluir = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalMetaForm
        aberto={true}
        meta={metaExemplo}
        aoSalvar={aoSalvar}
        aoExcluir={aoExcluir}
        aoFechar={aoFechar}
      />,
    )

    expect(screen.getByRole('heading', { name: /editar meta/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Reserva de Emergência')).toBeInTheDocument()

    const btnExcluir = screen.getByRole('button', { name: /excluir meta/i })
    await user.click(btnExcluir)

    const btnConfirmar = screen.getByRole('button', { name: /confirmar exclusão/i })
    await user.click(btnConfirmar)

    expect(aoExcluir).toHaveBeenCalledWith(metaExemplo.id)
  })

  describe('com o teclado do celular aberto', () => {
    afterEach(() => {
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
    })

    it('a folha segue a área visível: encolhe e sobe com o visualViewport, mantendo o rodapé acima do teclado', () => {
      const vv = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 })
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: vv })
      render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

      const raiz = screen.getByRole('dialog').parentElement as HTMLElement
      expect(raiz.style.height).toBe('800px')

      act(() => {
        vv.height = 420
        vv.offsetTop = 16
        vv.dispatchEvent(new Event('resize'))
      })

      expect(raiz.style.height).toBe('420px')
      expect(raiz.style.transform).toBe('translateY(16px)')
      expect(screen.getByRole('dialog').className).toContain('max-h-[min(92vh,100%)]')
    })

    it('sem visualViewport o contêiner não recebe altura nem deslocamento', () => {
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
      render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

      const raiz = screen.getByRole('dialog').parentElement as HTMLElement
      expect(raiz.style.height).toBe('')
      expect(raiz.style.transform).toBe('')
    })
  })
})

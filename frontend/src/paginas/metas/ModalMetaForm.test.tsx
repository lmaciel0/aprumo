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
  it('o botão fechar do cabeçalho tem alvo de 44 px e se chama "Fechar"', async () => {
    const user = userEvent.setup()
    const aoFechar = vi.fn()
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={aoFechar} />)

    const fechar = screen.getByRole('button', { name: 'Fechar' })
    expect(fechar).toHaveClass('size-11', 'rounded-[10px]', 'hover:bg-[var(--cor-elevado)]')
    await user.click(fechar)
    expect(aoFechar).toHaveBeenCalledTimes(1)
  })

  it('as opções de estilo não selecionadas têm contorno de 3:1 e a selecionada não muda', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const opcoes = screen.getAllByRole('button', { pressed: false })
    expect(opcoes.length).toBeGreaterThan(0)
    for (const opcao of opcoes) {
      expect(opcao).toHaveClass('border-[var(--cor-auth-campo-borda)]')
      expect(opcao.className).not.toContain('border-[var(--cor-linha)]')
    }
    const selecionada = screen.getAllByRole('button', { pressed: true })[0]
    expect(selecionada).toHaveClass('border-[var(--cor-texto)]')
  })

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

  it('o preset selecionado inverte as cores e marca aria-pressed; o ícone não tem degradê nem cor fixa', async () => {
    const user = userEvent.setup()
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const viagem = screen.getByRole('button', { name: /viagem & férias/i })
    const personalizado = screen.getByRole('button', { name: /personalizado/i })
    expect(personalizado).toHaveAttribute('aria-pressed', 'true')
    expect(viagem).toHaveAttribute('aria-pressed', 'false')

    await user.click(viagem)

    expect(viagem).toHaveAttribute('aria-pressed', 'true')
    expect(viagem.className).toContain('bg-[var(--cor-texto)]')
    expect(viagem.className).toContain('text-[var(--cor-fundo)]')
    expect(personalizado).toHaveAttribute('aria-pressed', 'false')
    expect(viagem.className).toContain('min-h-11')
    const icone = viagem.querySelector('span')
    expect(icone?.getAttribute('style') ?? '').not.toMatch(/gradient|#/)
    expect(icone?.className).not.toMatch(/gradient|sobre-imagem/)
  })

  it('o prazo é um campo de mês e ano, com o rótulo "Prazo estimado (opcional)"', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const prazo = screen.getByLabelText('Prazo estimado (opcional)')
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
        expect(alerta.className).toContain('text-[var(--cor-negativo-texto)]')
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

  it('a folha usa rounded-t-[20px] no celular e rounded-2xl a partir de sm', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const dialogo = screen.getByRole('dialog')
    expect(dialogo.className).toContain('rounded-t-[20px]')
    expect(dialogo.className).toContain('sm:rounded-2xl')
    expect(dialogo.className).not.toMatch(/rounded(-t)?-3xl/)
    expect(dialogo.className).not.toContain('shadow-2xl')
  })

  it('o corpo rola e o rodapé com Salvar fica fora da área de rolagem (alcançável com o teclado aberto)', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    const salvar = screen.getByRole('button', { name: /salvar meta/i })
    expect(salvar.closest('.overflow-y-auto')).toBeNull()
    const campo = screen.getByLabelText(/título/i)
    expect(campo.closest('.overflow-y-auto')).not.toBeNull()
    expect(salvar.closest('form')).not.toBeNull()
  })

  it('campos com 16 px, 44 px de altura e raio 10; botão Salvar em coral e Cancelar secundário', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    for (const campo of [screen.getByLabelText(/título/i), screen.getByLabelText(/valor alvo/i), screen.getByLabelText(/prazo/i), screen.getByLabelText(/foto/i)]) {
      expect(campo.className).toContain('text-base')
      expect(campo.className).toContain('min-h-11')
      expect(campo.className).toContain('rounded-[10px]')
    }
    const salvar = screen.getByRole('button', { name: /salvar meta/i })
    expect(salvar.className).toContain('bg-[var(--cor-principal-fundo)]')
    expect(salvar.className).toContain('text-[var(--cor-sobre-principal-fundo)]')
    expect(salvar.className).not.toMatch(/font-(bold|semibold)/)
    const cancelar = screen.getByRole('button', { name: /^cancelar$/i })
    expect(cancelar.className).not.toContain('--cor-principal-fundo')
    expect(cancelar.className).toContain('min-h-11')
  })

  it('erro de validação usa os tokens de erro', async () => {
    const user = userEvent.setup()
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    await user.type(screen.getByLabelText(/título/i), 'Sem alvo')
    await user.type(screen.getByLabelText(/valor alvo/i), '0')
    await user.click(screen.getByRole('button', { name: /salvar meta/i }))

    const alerta = screen.getByRole('alert')
    expect(alerta.className).toContain('bg-[var(--cor-erro-fundo)]')
    expect(alerta.className).toContain('border-[var(--cor-negativo)]')
    expect(alerta.className).toContain('text-[var(--cor-negativo-texto)]')
    expect(alerta.className).not.toMatch(/red-|font-(bold|semibold)/)
  })

  it('a exclusão usa os tokens de ação destrutiva, sem vermelho do Tailwind nem negrito', async () => {
    const user = userEvent.setup()
    render(<ModalMetaForm aberto={true} meta={metaExemplo} aoSalvar={vi.fn()} aoExcluir={vi.fn()} aoFechar={vi.fn()} />)

    const excluir = screen.getByRole('button', { name: /excluir meta/i })
    expect(excluir.className).toContain('text-[var(--cor-negativo-texto)]')
    expect(excluir.className).toContain('min-h-11')
    expect(excluir.className).not.toMatch(/red-|font-(bold|semibold)/)

    await user.click(excluir)
    const confirmar = screen.getByRole('button', { name: /confirmar exclusão/i })
    expect(confirmar.className).toContain('bg-[var(--cor-negativo)]')
    expect(confirmar.className).toContain('text-[var(--cor-sobre-negativo)]')
    expect(confirmar.className).toContain('min-h-11')
    expect(confirmar.className).not.toMatch(/red-|font-(bold|semibold)/)
  })

  it('o título do modal e os rótulos não usam negrito', () => {
    render(<ModalMetaForm aberto={true} meta={null} aoSalvar={vi.fn()} aoFechar={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /nova meta ou caixinha/i }).className).toContain('font-medium')
    expect(screen.getByText(/título da meta/i).className).toContain('font-medium')
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

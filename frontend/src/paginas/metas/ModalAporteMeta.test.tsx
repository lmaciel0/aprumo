import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { ModalAporteMeta } from './ModalAporteMeta'

const metaExemplo: MetaResponse = {
  id: 1,
  titulo: 'Reserva de Emergência',
  valorAlvo: '10000.00',
  valorGuardado: '4000.00',
  prazo: '2027-12-31',
  presetVisual: 'reserva',
  icone: 'shield',
  fotoUrl: null,
  ordem: 0,
  percentualConcluido: '0.4000',
  valorRestante: '6000.00',
  valorMensalSugerido: '428.57',
  mesesRestantes: 14,
  concluida: false,
}

describe('ModalAporteMeta', () => {
  it('o botão fechar do cabeçalho tem alvo de 44 px e se chama "Fechar"', async () => {
    const user = userEvent.setup()
    const aoFechar = vi.fn()
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={aoFechar} />)

    const fechar = screen.getByRole('button', { name: 'Fechar' })
    expect(fechar).toHaveClass('size-11', 'rounded-[10px]', 'hover:bg-[var(--cor-elevado)]')
    await user.click(fechar)
    expect(aoFechar).toHaveBeenCalledTimes(1)
  })

  it('as sugestões de valor têm contorno de 3:1', () => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const sugestao = screen.getByRole('button', { name: /^\+ R\$ 50$/ })
    expect(sugestao).toHaveClass('border-[var(--cor-auth-campo-borda)]')
    expect(sugestao.className).not.toContain('border-[var(--cor-linha)]')
  })

  it('renderiza corretamente no modo GUARDAR e permite envio', async () => {
    const user = userEvent.setup()
    const aoConfirmar = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalAporteMeta
        aberto={true}
        meta={metaExemplo}
        tipo="GUARDAR"
        aoConfirmar={aoConfirmar}
        aoFechar={aoFechar}
      />,
    )

    expect(screen.getByRole('heading', { name: /guardar dinheiro/i })).toBeInTheDocument()
    expect(screen.getByText(/Reserva de Emergência/i)).toBeInTheDocument()

    const input = screen.getByLabelText(/valor/i)
    await user.type(input, '150,00')

    const btnConfirmar = screen.getByRole('button', { name: /confirmar aporte/i })
    await user.click(btnConfirmar)

    expect(aoConfirmar).toHaveBeenCalledWith('150.00')
  })

  it('renderiza no modo RESGATAR e valida valor máximo', async () => {
    const user = userEvent.setup()
    const aoConfirmar = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalAporteMeta
        aberto={true}
        meta={metaExemplo}
        tipo="RESGATAR"
        aoConfirmar={aoConfirmar}
        aoFechar={aoFechar}
      />,
    )

    expect(screen.getByRole('heading', { name: /resgatar dinheiro/i })).toBeInTheDocument()
    expect(screen.getByText(/saldo disponível:/i)).toBeInTheDocument()
    expect(screen.getByText(/4\.000,00/)).toBeInTheDocument()

    const input = screen.getByLabelText(/valor/i)
    await user.type(input, '5000,00')

    const btnConfirmar = screen.getByRole('button', { name: /confirmar resgate/i })
    await user.click(btnConfirmar)

    expect(aoConfirmar).not.toHaveBeenCalled()
    expect(screen.getByText(/valor excede o saldo guardado/i)).toBeInTheDocument()
  })

  it('permite usar pílulas rápidas de valor', async () => {
    const user = userEvent.setup()
    const aoConfirmar = vi.fn()
    const aoFechar = vi.fn()

    render(
      <ModalAporteMeta
        aberto={true}
        meta={metaExemplo}
        tipo="GUARDAR"
        aoConfirmar={aoConfirmar}
        aoFechar={aoFechar}
      />,
    )

    const pilula = screen.getByRole('button', { name: /\+ R\$\s*100/i })
    await user.click(pilula)

    const btnConfirmar = screen.getByRole('button', { name: /confirmar aporte/i })
    await user.click(btnConfirmar)

    expect(aoConfirmar).toHaveBeenCalledWith('100.00')
  })

  it('a folha usa rounded-t-[20px] no celular e rounded-2xl a partir de sm, sem sombra pesada', () => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const dialogo = screen.getByRole('dialog')
    expect(dialogo.className).toContain('rounded-t-[20px]')
    expect(dialogo.className).toContain('sm:rounded-2xl')
    expect(dialogo.className).not.toMatch(/rounded(-t)?-3xl/)
    expect(dialogo.className).not.toContain('shadow-2xl')
  })

  it('o corpo rola e o rodapé com o botão de confirmar fica fora da área de rolagem', () => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const confirmar = screen.getByRole('button', { name: /confirmar aporte/i })
    expect(confirmar.closest('.overflow-y-auto')).toBeNull()
    expect(screen.getByLabelText(/valor/i).closest('.overflow-y-auto')).not.toBeNull()
    expect(confirmar.closest('form')).not.toBeNull()
  })

  it.each(['GUARDAR', 'RESGATAR'] as const)('o botão de confirmar (%s) é coral, sem verde nem negrito, e Cancelar é secundário', (tipo) => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo={tipo} aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const confirmar = screen.getByRole('button', { name: tipo === 'GUARDAR' ? /confirmar aporte/i : /confirmar resgate/i })
    expect(confirmar.className).toContain('bg-[var(--cor-principal-fundo)]')
    expect(confirmar.className).toContain('text-[var(--cor-sobre-principal-fundo)]')
    expect(confirmar.className).toContain('rounded-[10px]')
    expect(confirmar.className).toContain('min-h-11')
    expect(confirmar.className).not.toMatch(/emerald|amber|font-(bold|semibold)/)
    const cancelar = screen.getByRole('button', { name: /^cancelar$/i })
    expect(cancelar.className).not.toContain('--cor-principal-fundo')
    expect(cancelar.className).toContain('min-h-11')
  })

  it.each(['GUARDAR', 'RESGATAR'] as const)('o ícone do cabeçalho (%s) é tile neutro, sem emerald nem amber', (tipo) => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo={tipo} aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const titulo = screen.getByRole('heading', { name: tipo === 'GUARDAR' ? /guardar dinheiro/i : /resgatar dinheiro/i })
    expect(titulo.className).toContain('font-medium')
    const tile = titulo.closest('div')?.previousElementSibling
    expect(tile?.className).toContain('bg-[var(--cor-elevado)]')
    expect(tile?.className).toContain('text-[var(--cor-texto)]')
    expect(tile?.className).not.toMatch(/emerald|amber/)
  })

  it('o campo de valor tem 16 px, 44 px e raio 10; as sugestões são chips de 44 px sem coral no hover', () => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="RESGATAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const campo = screen.getByLabelText(/valor/i)
    expect(campo.className).toContain('text-base')
    expect(campo.className).toContain('min-h-11')
    expect(campo.className).toContain('rounded-[10px]')
    expect(campo.className).not.toMatch(/font-(bold|semibold)/)
    for (const nome of [/^R\$\s*50$/, /^Tudo$/]) {
      const chip = screen.getByRole('button', { name: nome })
      expect(chip.className).toContain('min-h-11')
      expect(chip.className).toContain('rounded-md')
      expect(chip.className).not.toMatch(/font-semibold|(?:^|\s)(?:hover:)?(?:text|border|bg)-\[var\(--cor-principal/)
    }
  })

  it('o saldo usa formatarMoeda com peso 500, sem negrito', () => {
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    const saldo = screen.getByText(/4\.000,00/)
    expect(saldo.className).toContain('font-medium')
    expect(saldo.className).not.toContain('font-bold')
  })

  it('o erro de valor excedido usa os tokens de erro e não aparece ao digitar de novo', async () => {
    const user = userEvent.setup()
    render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="RESGATAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

    await user.type(screen.getByLabelText(/valor/i), '5000,00')
    await user.click(screen.getByRole('button', { name: /confirmar resgate/i }))

    const alerta = screen.getByRole('alert')
    expect(alerta.className).toContain('bg-[var(--cor-erro-fundo)]')
    expect(alerta.className).toContain('border-[var(--cor-negativo)]')
    expect(alerta.className).toContain('text-[var(--cor-negativo-texto)]')
    expect(alerta.className).not.toMatch(/red-|font-(bold|semibold)/)
  })

  describe('com o teclado do celular aberto', () => {
    afterEach(() => {
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
    })

    it('a folha segue a área visível: encolhe e sobe com o visualViewport, mantendo o rodapé acima do teclado', () => {
      const vv = Object.assign(new EventTarget(), { height: 800, offsetTop: 0 })
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: vv })
      render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

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
      render(<ModalAporteMeta aberto={true} meta={metaExemplo} tipo="GUARDAR" aoConfirmar={vi.fn()} aoFechar={vi.fn()} />)

      const raiz = screen.getByRole('dialog').parentElement as HTMLElement
      expect(raiz.style.height).toBe('')
      expect(raiz.style.transform).toBe('')
    })
  })
})

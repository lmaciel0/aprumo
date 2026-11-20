import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { ModalMetaForm } from './ModalMetaForm'

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

  it('permite escolher um preset visual e envia só preset e ícone, sem cores de degradê', async () => {
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
        icone: 'plane',
      }),
    )
    const enviado = aoSalvar.mock.calls[0]?.[0] as Record<string, unknown>
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
})

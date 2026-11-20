import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDialogoModal } from './useDialogoModal'

describe('useDialogoModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('re-renderizar com uma nova função aoFechar não devolve o foco ao primeiro item nem relê a rolagem', () => {
    const painel = document.createElement('div')
    const primeiro = document.createElement('button')
    const campo = document.createElement('input')
    painel.append(primeiro, campo)
    document.body.append(painel)

    const { result, rerender } = renderHook(
      ({ aoFechar }) => {
        const dialogo = useDialogoModal(true, aoFechar)
        dialogo.painel.current ??= painel
        return dialogo
      },
      { initialProps: { aoFechar: vi.fn() } },
    )
    expect(result.current.painel.current).toBe(painel)

    // O efeito já rodou na montagem (sem painel ainda); simula a pessoa focando o campo e o pai re-renderizando.
    campo.focus()
    rerender({ aoFechar: vi.fn() })

    expect(document.activeElement).toBe(campo)
  })

  it('o Esc chama a versão mais recente de aoFechar', () => {
    const antiga = vi.fn()
    const nova = vi.fn()
    const { rerender } = renderHook(({ aoFechar }) => useDialogoModal(true, aoFechar), {
      initialProps: { aoFechar: antiga },
    })

    rerender({ aoFechar: nova })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(antiga).not.toHaveBeenCalled()
    expect(nova).toHaveBeenCalledTimes(1)
  })
})

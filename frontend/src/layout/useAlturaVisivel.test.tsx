import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAlturaVisivel } from './useAlturaVisivel'

class VisualViewportFalso extends EventTarget {
  height = 800
  offsetTop = 0
}

function instalarVisualViewport() {
  const falso = new VisualViewportFalso()
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: falso })
  return falso
}

describe('useAlturaVisivel', () => {
  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
  })

  it('sem visualViewport devolve null (mantém o comportamento atual)', () => {
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined })
    const { result } = renderHook(() => useAlturaVisivel(true))
    expect(result.current).toBeNull()
  })

  it('devolve a altura e o deslocamento atuais e acompanha resize e scroll do visualViewport', () => {
    const vv = instalarVisualViewport()
    const { result } = renderHook(() => useAlturaVisivel(true))
    expect(result.current).toEqual({ altura: 800, deslocamento: 0 })

    act(() => {
      vv.height = 480
      vv.dispatchEvent(new Event('resize'))
    })
    expect(result.current).toEqual({ altura: 480, deslocamento: 0 })

    act(() => {
      vv.offsetTop = 120
      vv.dispatchEvent(new Event('scroll'))
    })
    expect(result.current).toEqual({ altura: 480, deslocamento: 120 })
  })

  it('inativo não devolve nada e não escuta o visualViewport', () => {
    const vv = instalarVisualViewport()
    const { result } = renderHook(() => useAlturaVisivel(false))
    expect(result.current).toBeNull()

    act(() => {
      vv.height = 300
      vv.dispatchEvent(new Event('resize'))
    })
    expect(result.current).toBeNull()
  })

  it('para de escutar quando o componente sai', () => {
    const vv = instalarVisualViewport()
    const { unmount } = renderHook(() => useAlturaVisivel(true))
    unmount()
    expect(() => vv.dispatchEvent(new Event('resize'))).not.toThrow()
  })
})

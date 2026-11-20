import { useEffect, useState, type CSSProperties } from 'react'

interface AreaVisivel {
  /** Altura, em px, da parte da tela não coberta pelo teclado. */
  altura: number
  /** Distância, em px, do topo da tela ao topo da área visível. */
  deslocamento: number
}

function lerAreaVisivel(): AreaVisivel | null {
  const visual = typeof window === 'undefined' ? undefined : window.visualViewport
  return visual ? { altura: visual.height, deslocamento: visual.offsetTop } : null
}

/**
 * Altura e deslocamento da área visível (`window.visualViewport`) enquanto `ativo`. No Chrome e na TWA do Android o
 * teclado não redimensiona o layout (`interactive-widget=resizes-visual`), então uma folha `fixed inset-0` continua
 * presa atrás dele. Quem usa aplica `estiloAreaVisivel` ao contêiner da folha para o rodapé ficar acima do teclado.
 * Devolve `null` sem `visualViewport` ou com `ativo` falso, e o contêiner mantém o comportamento de sempre.
 */
export function useAlturaVisivel(ativo: boolean): AreaVisivel | null {
  const [area, setArea] = useState<AreaVisivel | null>(() => (ativo ? lerAreaVisivel() : null))

  useEffect(() => {
    const visual = ativo ? window.visualViewport : null
    if (!visual) {
      setArea(null)
      return
    }
    const atualizar = () => setArea(lerAreaVisivel())
    atualizar()
    visual.addEventListener('resize', atualizar)
    visual.addEventListener('scroll', atualizar)
    return () => {
      visual.removeEventListener('resize', atualizar)
      visual.removeEventListener('scroll', atualizar)
    }
  }, [ativo])

  return ativo ? area : null
}

/** Estilo do contêiner `fixed inset-0` da folha: a altura da área visível substitui o `bottom: 0`. */
export function estiloAreaVisivel(area: AreaVisivel | null): CSSProperties | undefined {
  return area ? { height: `${area.altura}px`, transform: `translateY(${area.deslocamento}px)` } : undefined
}

import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react'
import { travarRolagem } from './travaRolagem'

/** Elementos que recebem foco por teclado dentro de um diálogo. */
export const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DialogoModal<T extends HTMLElement = HTMLDivElement> {
  /** Vai no elemento `role="dialog"` ou `<dialog>`. */
  painel: RefObject<T | null>
  /** Vai no `onKeyDown` do diálogo: mantém o Tab (e o Shift+Tab) dentro dele. */
  prenderFoco: (evento: KeyboardEvent<T>) => void
}

/**
 * Comportamento comum dos diálogos modais do celular (menu deslizante e folha "Criar"): enquanto `aberto`, leva o foco
 * ao primeiro item, trava a rolagem do `<body>` e chama `aoFechar` no Esc. Quem usa decide o que `aoFechar` faz
 * (normalmente fechar e devolver o foco ao botão de origem).
 */
export function useDialogoModal<T extends HTMLElement = HTMLDivElement>(aberto: boolean, aoFechar: () => void): DialogoModal<T> {
  const painel = useRef<T>(null)
  // Guarda a versão mais recente de aoFechar: assim o efeito depende só de `aberto` e um aoFechar novo a cada
  // render do pai não devolve o foco ao primeiro item nem refaz a trava de rolagem.
  const aoFecharAtual = useRef(aoFechar)
  useEffect(() => {
    aoFecharAtual.current = aoFechar
  })

  useEffect(() => {
    if (!aberto) {
      return
    }
    painel.current?.querySelector<HTMLElement>(FOCAVEIS)?.focus()
    const soltarRolagem = travarRolagem()
    const fecharComEsc = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === 'Escape') {
        aoFecharAtual.current()
      }
    }
    document.addEventListener('keydown', fecharComEsc)
    return () => {
      soltarRolagem()
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [aberto])

  const prenderFoco = (evento: KeyboardEvent<T>) => {
    if (evento.key !== 'Tab' || !painel.current) {
      return
    }
    const itens = painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)
    const primeiro = itens[0]
    const ultimo = itens[itens.length - 1]
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault()
      ultimo?.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primeiro?.focus()
    }
  }

  return { painel, prenderFoco }
}

import type { MetaResponse } from '../../api/tipos'

/** Meta marcada como concluída ou com o guardado igual ou acima do alvo. */
export function metaAtingida(meta: MetaResponse): boolean {
  const centavosGuardados = Math.round(Number.parseFloat(meta.valorGuardado || '0') * 100)
  const centavosAlvo = Math.round(Number.parseFloat(meta.valorAlvo || '0') * 100)
  return meta.concluida || (centavosAlvo > 0 && centavosGuardados >= centavosAlvo)
}

/**
 * Percentual inteiro para barra, texto e `aria-valuenow`. Meta atingida mostra 100; a que ainda não chegou arredonda
 * para baixo e para em 99, para 995 de 1000 não aparecer como "100%" com a meta incompleta. A folga de 1e-6 evita
 * que 0,29 * 100 (28,999...) caia para 28.
 */
export function percentualExibido(percentualConcluido: string, atingida: boolean): number {
  if (atingida) {
    return 100
  }
  const percentual = Number.parseFloat(percentualConcluido || '0') * 100
  return Math.min(99, Math.max(0, Math.floor(percentual + 1e-6)))
}

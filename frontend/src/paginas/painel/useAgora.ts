import { useEffect, useState } from 'react'
import { mesAtual } from '../../formato/mes'

const INTERVALO_MS = 60_000

/** Chave do dia em São Paulo (`2026-11-30`), para só renderizar de novo quando o dia muda. */
function chaveDoDia(data: Date): string {
  const { ano, mes } = mesAtual(data)
  const dia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', day: 'numeric' }).format(data)
  return `${ano}-${mes}-${dia}`
}

/**
 * O instante atual, a mesma fonte para o título e para as finanças do mês. Atualiza quando o dia (em São Paulo) muda:
 * a cada minuto e ao voltar para a aba, para o app aberto na virada do mês não mostrar título e números de meses
 * diferentes.
 */
export function useAgora(): Date {
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const atualizar = () => {
      const novo = new Date()
      setAgora((atual) => (chaveDoDia(atual) === chaveDoDia(novo) ? atual : novo))
    }
    const intervalo = window.setInterval(atualizar, INTERVALO_MS)
    document.addEventListener('visibilitychange', atualizar)
    window.addEventListener('focus', atualizar)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizar)
      window.removeEventListener('focus', atualizar)
    }
  }, [])

  return agora
}

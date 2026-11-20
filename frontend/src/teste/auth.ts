import { http, HttpResponse } from 'msw'
import type { UsuarioResponse } from '../api/tipos'
import { servidor } from './servidor'

/** Título (h1) da tela inicial `/`: o mês e o ano mudam com o relógio, então os testes conferem só o formato `Mês de 2026`. */
export const saudacaoDaTelaInicial = /^\p{Lu}\p{L}+ de \d{4}$/u

export const usuarioFicticio: UsuarioResponse = { id: 1, nome: 'Ana', email: 'ana@exemplo.com', temSenha: true }

/** Contador de chamadas a `GET /api/auth/me`, para provar que não há loop. */
export interface ContadorDeMe {
  chamadas: number
}

/** `GET /api/auth/me` responde 401 (visitante sem sessão). */
export function semSessao(): ContadorDeMe {
  const contador: ContadorDeMe = { chamadas: 0 }
  servidor.use(
    http.get('/api/auth/me', () => {
      contador.chamadas += 1
      return HttpResponse.json({ erro: 'Não autenticado.' }, { status: 401 })
    }),
  )
  return contador
}

/** `GET /api/auth/me` responde 200 com o usuário informado. */
export function comSessao(usuario: UsuarioResponse = usuarioFicticio): ContadorDeMe {
  const contador: ContadorDeMe = { chamadas: 0 }
  servidor.use(
    http.get('/api/auth/me', () => {
      contador.chamadas += 1
      return HttpResponse.json(usuario)
    }),
  )
  return contador
}

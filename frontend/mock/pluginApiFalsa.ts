import type { IncomingMessage } from 'node:http'
import { getResponse, type HttpHandler } from 'msw'
import type { Plugin } from 'vite'

function construirCabecalhos(req: IncomingMessage): Headers {
  const cabecalhos = new Headers()
  for (const [chave, valor] of Object.entries(req.headers)) {
    if (valor === undefined || chave.startsWith(':')) continue
    if (Array.isArray(valor)) {
      for (const item of valor) cabecalhos.append(chave, item)
    } else {
      cabecalhos.set(chave, valor)
    }
  }
  return cabecalhos
}

async function lerCorpo(req: IncomingMessage): Promise<Uint8Array<ArrayBuffer> | undefined> {
  const metodo = (req.method ?? 'GET').toUpperCase()
  if (metodo === 'GET' || metodo === 'HEAD') return undefined

  const pedacos: Buffer[] = []
  for await (const pedaco of req) {
    pedacos.push(typeof pedaco === 'string' ? Buffer.from(pedaco) : pedaco)
  }
  if (pedacos.length === 0) return undefined
  return new Uint8Array(Buffer.concat(pedacos))
}

export function apiFalsa(): Plugin {
  return {
    name: 'aprumo-api-falsa',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const metodo = (req.method ?? 'GET').toUpperCase()
          // Connect remove o prefixo '/api' de req.url ao montar em '/api'.
          const caminhoOriginal = req.originalUrl ?? `/api${req.url ?? ''}`
          const url = new URL(caminhoOriginal, 'http://localhost')
          const corpo = await lerCorpo(req)

          const requisicao = new Request(url, {
            method: metodo,
            headers: construirCabecalhos(req),
            ...(corpo !== undefined ? { body: corpo } : {}),
          })

          const { handlersDev } = (await server.ssrLoadModule('/mock/handlersDev.ts')) as {
            handlersDev: HttpHandler[]
          }
          const resposta = await getResponse(handlersDev, requisicao)

          if (resposta) {
            if (resposta.type === 'error') {
              res.statusCode = 502
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ erro: 'resposta de erro do mock' }))
              return
            }

            res.statusCode = resposta.status
            resposta.headers.forEach((valor, chave) => {
              if (chave.toLowerCase() === 'set-cookie') return
              res.setHeader(chave, valor)
            })
            const cookies = resposta.headers.getSetCookie()
            if (cookies.length > 0) {
              res.setHeader('set-cookie', cookies)
            }
            res.end(Buffer.from(await resposta.arrayBuffer()))
            return
          }

          const mensagem = `sem mock: ${metodo} ${url.pathname}`
          console.warn(mensagem)
          res.statusCode = 501
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ erro: mensagem }))
        } catch (erro) {
          next(erro)
        }
      })
    },
  }
}

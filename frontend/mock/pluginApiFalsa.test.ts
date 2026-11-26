// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import { http, HttpResponse, passthrough, type HttpHandler } from 'msw'
import { createServer, resolveConfig, type Connect, type PluginOption, type ViteDevServer } from 'vite'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { usuarioFicticio } from '../src/teste/auth'
import { servidor } from '../src/teste/servidor'
import configVite from '../vite.config'
import { apiFalsa } from './pluginApiFalsa'

const caminhoConfig = fileURLToPath(new URL('../vite.config.ts', import.meta.url))

function extrairNomesPlugins(plugins: PluginOption | undefined): string[] {
  if (!plugins) return []
  if (Array.isArray(plugins)) return plugins.flatMap(extrairNomesPlugins)
  if (typeof plugins === 'object' && 'name' in plugins && typeof plugins.name === 'string') return [plugins.name]
  return []
}

describe('apiFalsa e configuração do Vite', () => {
  it('expõe plugin com nome aprumo-api-falsa e apply serve', () => {
    const plugin = apiFalsa()
    expect(plugin.name).toBe('aprumo-api-falsa')
    expect(plugin.apply).toBe('serve')
  })

  it('ativa o plugin e remove proxy /api em mode mock no serve', () => {
    const config = configVite({ mode: 'mock', command: 'serve' })
    expect(extrairNomesPlugins(config.plugins)).toContain('aprumo-api-falsa')
    expect(config.server?.proxy?.['/api']).toBeUndefined()
  })

  it('mantém proxy para localhost:8080 e omite plugin em mode development', () => {
    const config = configVite({ mode: 'development', command: 'serve' })
    expect(extrairNomesPlugins(config.plugins)).not.toContain('aprumo-api-falsa')
    expect(config.server?.proxy?.['/api']).toBe('http://localhost:8080')
  })

  it('não carrega o plugin durante build mesmo com mode mock', async () => {
    const config = await resolveConfig({ configFile: caminhoConfig }, 'build', 'mock')
    expect(config.plugins.some((p) => p.name === 'aprumo-api-falsa')).toBe(false)
  })
})

describe('apiFalsa E2E', () => {
  let servidorVite: ViteDevServer | undefined
  let baseUrl = ''

  beforeAll(async () => {
    servidorVite = await createServer({
      configFile: caminhoConfig,
      mode: 'mock',
      server: { port: 0, host: '127.0.0.1' },
      logLevel: 'silent',
    })
    await servidorVite.listen()
    const endereco = servidorVite.httpServer?.address()
    if (!endereco || typeof endereco === 'string') {
      throw new Error('Servidor Vite não expôs porta TCP')
    }
    baseUrl = `http://127.0.0.1:${endereco.port}`
  })

  beforeEach(() => {
    servidor.use(
      http.all('http://127.0.0.1*', () => passthrough()),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await servidorVite?.close()
  })

  it('responde GET /api/auth/me com 200, application/json e usuarioFicticio', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')
    expect(await res.json()).toEqual(usuarioFicticio)
  })

  it('responde GET /api/inexistente com 501 e loga aviso', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const res = await fetch(`${baseUrl}/api/inexistente`)
    expect(res.status).toBe(501)
    expect(await res.json()).toEqual({ erro: 'sem mock: GET /api/inexistente' })
    expect(warn).toHaveBeenCalledWith('sem mock: GET /api/inexistente')
  })

  it(
    'responde POST /api/lancamentos com corpo JSON sem travar e retorna 501',
    async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const res = await fetch(`${baseUrl}/api/lancamentos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ valor: '10.00' }),
      })
      expect(res.status).toBe(501)
      expect(await res.json()).toEqual({ erro: 'sem mock: POST /api/lancamentos' })
      expect(warn).toHaveBeenCalledWith('sem mock: POST /api/lancamentos')
    },
    10_000,
  )
})

type MiddlewareApi = (
  req: Connect.IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) => Promise<void> | void

function criarMiddleware(handlers: HttpHandler[]): MiddlewareApi {
  let middlewareCapturado: MiddlewareApi | undefined
  const servidorFalso = {
    middlewares: {
      use(_caminho: string, fn: Connect.NextHandleFunction) {
        middlewareCapturado = fn as unknown as MiddlewareApi
      },
    },
    ssrLoadModule: async () => ({ handlersDev: handlers }),
  } as unknown as ViteDevServer

  const plugin = apiFalsa()
  if (typeof plugin.configureServer !== 'function') {
    throw new Error('apiFalsa() deve expor configureServer como função')
  }
  const configurar = plugin.configureServer as (server: ViteDevServer) => unknown
  configurar(servidorFalso)

  if (!middlewareCapturado) {
    throw new Error('Middleware /api não foi registrado')
  }
  return middlewareCapturado
}

async function invocarMiddleware(
  handlers: HttpHandler[],
  reqParcial: Partial<IncomingMessage> & { originalUrl?: string },
) {
  const middleware = criarMiddleware(handlers)
  const setHeader = vi.fn()
  const end = vi.fn()
  const next = vi.fn()
  const req = {
    method: 'GET',
    url: '/',
    headers: {},
    ...reqParcial,
  } as unknown as Connect.IncomingMessage
  const res = {
    statusCode: 200,
    setHeader,
    end,
  } as unknown as ServerResponse

  await middleware(req, res, next)
  return { res, setHeader, end, next }
}

describe('apiFalsa middleware (casos de borda)', () => {
  it('repassa múltiplos Set-Cookie como array para res.setHeader', async () => {
    const c1 = 'a=1; Path=/; HttpOnly'
    const c2 = 'b=2; Path=/; SameSite=Lax'
    const handler = http.get('*/api/cookies', () => {
      const headers = new Headers()
      headers.append('set-cookie', c1)
      headers.append('set-cookie', c2)
      headers.set('x-extra', 'valor')
      return new HttpResponse('ok', { status: 200, headers })
    })

    const { res, setHeader, next } = await invocarMiddleware([handler], {
      url: '/cookies',
      originalUrl: '/api/cookies',
    })

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(setHeader).toHaveBeenCalledWith('set-cookie', [c1, c2])
    expect(setHeader.mock.calls.filter(([chave]) => String(chave).toLowerCase() === 'set-cookie')).toHaveLength(1)
    expect(setHeader).toHaveBeenCalledWith('x-extra', 'valor')
  })

  it('responde 502 com JSON de erro quando handler retorna HttpResponse.error()', async () => {
    const handler = http.get('*/api/falha', () => HttpResponse.error())

    const { res, setHeader, end, next } = await invocarMiddleware([handler], {
      url: '/falha',
      originalUrl: '/api/falha',
    })

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(502)
    expect(setHeader).toHaveBeenCalledWith('content-type', 'application/json')
    expect(JSON.parse(String(end.mock.calls[0]?.[0]))).toEqual({ erro: 'resposta de erro do mock' })
  })

  it('ignora pseudo-headers HTTP/2 ao construir cabeçalhos da requisição', async () => {
    const handler = http.get('*/api/h2', ({ request }) =>
      HttpResponse.json({ teste: request.headers.get('x-teste') }),
    )

    const { res, end, next } = await invocarMiddleware([handler], {
      url: '/h2',
      originalUrl: '/api/h2',
      headers: {
        ':authority': 'localhost:5173',
        ':method': 'GET',
        ':path': '/api/h2',
        ':scheme': 'https',
        'x-teste': 'ok',
      },
    })

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(Buffer.from(end.mock.calls[0]?.[0] as Uint8Array).toString('utf8'))).toEqual({ teste: 'ok' })
  })
})

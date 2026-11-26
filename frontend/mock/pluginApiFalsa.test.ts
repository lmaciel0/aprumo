// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { http, passthrough } from 'msw'
import { createServer, resolveConfig, type PluginOption, type ViteDevServer } from 'vite'
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

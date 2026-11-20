/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** Arquivos e pastas que ficam para as fases 3 e 4 (caminhos relativos a `src/`; pasta termina em `/`). */
export const EXCECOES_FASE_3_4: string[] = [
  'paginas/metas/',
  'paginas/cartoes/CardCartao.tsx',
  'paginas/painel/CardReflexao.tsx',
  'paginas/lancamentos/FaixaSaldo.tsx',
  'paginas/lancamentos/ReceitasCard.tsx',
  'paginas/inicio/GraficoResultado.tsx',
]

const normalizar = (caminho: string): string => caminho.replaceAll('\\', '/')

/** Todos os `.tsx` de produção sob `src/` (caminhos relativos a `src/`, sem testes). */
export function tsxDeProducao(pasta = ''): string[] {
  const base = resolve(process.cwd(), 'src', pasta)
  return readdirSync(base, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory()) return tsxDeProducao(caminho)
    return caminho.endsWith('.tsx') && !caminho.endsWith('.test.tsx') ? [caminho] : []
  })
}

/** Arquivos de produção (fora das exceções) cujo conteúdo casa com `regex`. */
export function infratores(regex: RegExp, excecoes: string[] = []): string[] {
  return tsxDeProducao()
    .filter((arquivo) => {
      const caminho = normalizar(arquivo)
      return !excecoes.some((e) => (e.endsWith('/') ? caminho.startsWith(e) : caminho === e))
    })
    .filter((arquivo) => regex.test(readFileSync(resolve(process.cwd(), 'src', arquivo), 'utf8')))
    .map(normalizar)
}

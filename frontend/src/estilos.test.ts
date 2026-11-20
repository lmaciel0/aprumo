/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// O Vitest roda com `css: false`, que esvazia `import '...css?raw'`; por isso o arquivo é lido direto.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

/** Valor de uma variável CSS declarada em `:root`, sem espaços e em minúsculas. */
function token(nome: string): string | undefined {
  const achado = new RegExp(`--${nome}:\\s*([^;]+);`).exec(css)
  return achado?.[1]?.trim().toLowerCase()
}

/** Expande `#rgb`/`#rrggbb` para `[r, g, b]` (0 a 255). */
function rgbDeHex(hex: string): [number, number, number] {
  const cheio = hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex
  return [1, 3, 5].map((i) => parseInt(cheio.slice(i, i + 2), 16)) as [number, number, number]
}

function luminanciaRgb([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const canal = v / 255
    return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

function contrasteRgb(a: [number, number, number], b: [number, number, number]): number {
  const [maior, menor] = [luminanciaRgb(a), luminanciaRgb(b)].sort((x, y) => y - x) as [number, number]
  return (maior + 0.05) / (menor + 0.05)
}

/** Contraste WCAG entre duas cores `#rgb`/`#rrggbb`. */
function contrasteHex(a: string, b: string): number {
  return contrasteRgb(rgbDeHex(a), rgbDeHex(b))
}

const PRESETS = ['base', 'musgo', 'ceu'] as const
const TEMAS = ['claro', 'escuro'] as const
type Tema = (typeof TEMAS)[number]
type Preset = (typeof PRESETS)[number]

const blocoDe = (regex: RegExp): string => regex.exec(css)?.[1] ?? ''
const blocoClaro = blocoDe(/:root\s*\{([^}]*)\}/)
const blocoEscuro = blocoDe(/:root\[data-tema='escuro'\]\s*\{([^}]*)\}/)

/** Bloco do preset no tema: `html[data-preset=x]` no claro, `html[data-tema='escuro'][data-preset=x]` no escuro. */
function blocoDoPreset(tema: Tema, preset: Preset): string {
  if (preset === 'base') return ''
  const seletor =
    tema === 'claro' ? `html\\[data-preset='${preset}'\\]` : `html\\[data-tema='escuro'\\]\\[data-preset='${preset}'\\]`
  const bloco = blocoDe(new RegExp(`${seletor}\\s*\\{([^}]*)\\}`))
  if (bloco === '') throw new Error(`bloco do preset ${preset} (${tema}) ausente`)
  return bloco
}

/**
 * Hex do token no tema e preset: bloco do preset, senão o do tema, senão o de `:root` (o escuro herda do claro).
 * Token declarado no primeiro bloco que o traz; se o valor não for hex (var(), color-mix()), falha com o nome
 * em vez de cair no valor do bloco seguinte.
 */
function cor(tema: Tema, preset: Preset, nome: string): string {
  const re = new RegExp(`--${nome}:\\s*([^;]+);`)
  const blocos = [blocoDoPreset(tema, preset), tema === 'escuro' ? blocoEscuro : '', blocoClaro]
  for (const bloco of blocos) {
    const valor = re.exec(bloco)?.[1]?.trim()
    if (valor === undefined) continue
    if (!/^#[0-9a-fA-F]{3,6}$/.test(valor)) throw new Error(`token --${nome} não é cor hex (${tema}, ${preset}): ${valor}`)
    return valor.length === 4 ? '#' + [...valor.slice(1)].map((c) => c + c).join('') : valor.toLowerCase()
  }
  throw new Error(`token --${nome} ausente (${tema}, ${preset})`)
}

const CASOS_TEMA_PRESET = TEMAS.flatMap((tema) => PRESETS.map((preset) => [tema, preset] as const))

describe('tokens de cor', () => {
  it('o leitor de hex falha com o nome do token quando o valor declarado é expressão', () => {
    for (const nome of ['cor-principal-clara', 'cor-grafico-despesas', 'cor-grafico-receitas-previstas', 'cor-grafico-despesas-previstas']) {
      expect(() => cor('claro', 'base', nome), nome).toThrow(new RegExp(`--${nome} não é cor hex`))
      expect(() => cor('escuro', 'musgo', nome), nome).toThrow(new RegExp(`--${nome} não é cor hex`))
    }
  })

  it('o claro usa marinho, creme e coral; o escuro usa grafite', () => {
    expect(token('cor-fundo')).toBe('#f4ede0')
    expect(token('cor-texto')).toBe('#14213d')
    expect(token('cor-principal-fundo')).toBe('#ff6b5b')
    expect(blocoEscuro).toMatch(/--cor-fundo:\s*#141415;/)
    expect(blocoEscuro).toMatch(/--cor-card:\s*#19191b;/)
    expect(blocoEscuro).toMatch(/--cor-elevado:\s*#232325;/)
  })

  it('sobre-imagem é creme em :root e não é redefinido no escuro nem nos presets', () => {
    expect(blocoClaro).toMatch(/--cor-sobre-imagem:\s*#f4ede0;/)
    expect(blocoEscuro).not.toMatch(/--cor-sobre-imagem/)
    for (const [tema, preset] of [['claro', 'musgo'], ['claro', 'ceu'], ['escuro', 'musgo'], ['escuro', 'ceu']] as const) {
      expect(blocoDoPreset(tema, preset)).not.toMatch(/--cor-sobre-imagem/)
    }
  })

  it('celula_paga_e_diferenca_negativa_usam_os_tons_de_texto', () => {
    expect(css).toMatch(/\.celula-paga\s*\{\s*color:\s*var\(--cor-positivo-texto\);?\s*\}/)
    expect(css).toMatch(/\.diferenca-negativa\s*\{\s*color:\s*var\(--cor-texto\);?\s*\}/)
  })

  it('declara só os presets musgo e ceu, sem lima, esmeralda nem indigo', () => {
    expect(css).toMatch(/html\[data-preset='musgo'\]/)
    expect(css).toMatch(/html\[data-preset='ceu'\]/)
    expect(css).toMatch(/html\[data-tema='escuro'\]\[data-preset='musgo'\]/)
    expect(css).toMatch(/html\[data-tema='escuro'\]\[data-preset='ceu'\]/)
    for (const removido of ['lima', 'esmeralda', 'indigo']) {
      expect(css).not.toContain(`data-preset='${removido}'`)
    }
  })

  it('não declara os tokens removidos (principal-fim, auth-borda, auth-fundo-fim)', () => {
    for (const nome of ['cor-principal-fim', 'cor-auth-borda', 'cor-auth-fundo-fim']) {
      expect(css, `--${nome} ainda no index.css`).not.toContain(`--${nome}`)
    }
  })

  it.each(CASOS_TEMA_PRESET)('texto, secundário e mutado passam de 4,5:1 sobre card, fundo e elevado (%s, %s)', (tema, preset) => {
    for (const texto of ['cor-texto', 'cor-secundario', 'cor-mutado']) {
      for (const fundo of ['cor-card', 'cor-fundo', 'cor-elevado']) {
        expect(contrasteHex(cor(tema, preset, texto), cor(tema, preset, fundo)), `${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it.each(CASOS_TEMA_PRESET)('principal como texto passa de 4,5:1 sobre card e fundo (%s, %s)', (tema, preset) => {
    for (const fundo of ['cor-card', 'cor-fundo']) {
      expect(contrasteHex(cor(tema, preset, 'cor-principal'), cor(tema, preset, fundo)), `cor-principal sobre ${fundo}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(CASOS_TEMA_PRESET)('sobre-principal, sobre-principal-fundo e sobre-principal-suave passam de 4,5:1 sobre seus fundos (%s, %s)', (tema, preset) => {
    const pares: Array<[string, string]> = [
      ['cor-sobre-principal', 'cor-principal'],
      ['cor-sobre-principal-fundo', 'cor-principal-fundo'],
      ['cor-sobre-principal-suave', 'cor-principal'],
    ]
    for (const [texto, fundo] of pares) {
      expect(contrasteHex(cor(tema, preset, texto), cor(tema, preset, fundo)), `${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(TEMAS)('sobre-negativo e os tons de texto de positivo, negativo e aviso passam de 4,5:1 (%s)', (tema) => {
    const pares: Array<[string, string]> = [
      ['cor-sobre-negativo', 'cor-negativo'],
      ['cor-sobre-positivo', 'cor-positivo'],
      ['cor-positivo-texto', 'cor-card'],
      ['cor-positivo-texto', 'cor-fundo'],
      ['cor-positivo-texto', 'cor-ok-fundo'],
      ['cor-negativo-texto', 'cor-card'],
      ['cor-negativo-texto', 'cor-fundo'],
      ['cor-negativo-texto', 'cor-erro-fundo'],
      ['cor-aviso-texto', 'cor-aviso-fundo'],
    ]
    for (const [texto, fundo] of pares) {
      expect(contrasteHex(cor(tema, 'base', texto), cor(tema, 'base', fundo)), `${texto} sobre ${fundo}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

/** Todos os `.tsx` de produção sob `src/` (caminhos relativos a `src/`, sem testes). */
function tsxDeProducao(pasta = ''): string[] {
  const base = resolve(process.cwd(), 'src', pasta)
  return readdirSync(base, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory()) return tsxDeProducao(caminho)
    return caminho.endsWith('.tsx') && !caminho.endsWith('.test.tsx') ? [caminho] : []
  })
}

describe('cores fixas', () => {
  it('nenhum TSX de produção usa bg-white, hex fixo em bg/text nem text-white', () => {
    const proibido = /bg-white|bg-\[#|text-\[#|text-white/
    const infratores = tsxDeProducao()
      .filter((arquivo) => proibido.test(readFileSync(resolve(process.cwd(), 'src', arquivo), 'utf8')))
    expect(infratores).toEqual([])
  })

  it('as cores do gráfico do ano vêm dos tokens de tema', () => {
    const cores = readFileSync(resolve(process.cwd(), 'src/paginas/inicio/cores.ts'), 'utf8')
    expect(cores).toContain("COR_RECEITAS = 'var(--cor-grafico-receitas)'")
    expect(cores).toContain("COR_DESPESAS = 'var(--cor-grafico-despesas)'")
    expect(cores).toContain("FUNDO_RECEITAS_PREVISTAS = 'var(--cor-grafico-receitas-previstas)'")
    expect(cores).toContain("FUNDO_DESPESAS_PREVISTAS = 'var(--cor-grafico-despesas-previstas)'")
  })

  it('o card de auth e o botão principal não têm cor fixa fora dos tokens', () => {
    const auth = /\.auth-card\s*\{[^}]*\}/.exec(css)?.[0] ?? ''
    expect(auth).not.toMatch(/#[0-9a-fA-F]{3,6}|rgb\(244/)
    const botao = /\.auth-card button\[type='submit'\]\s*\{[^}]*\}/.exec(css)?.[0] ?? ''
    expect(botao).not.toMatch(/#[0-9a-fA-F]{3,6}/)
  })
})

describe('campos das telas de auth: contraste não textual (WCAG 1.4.11, 3:1)', () => {
  it.each(TEMAS)('a borda do campo de auth passa de 3:1 sobre o card (%s)', (tema) => {
    expect(contrasteHex(cor(tema, 'base', 'cor-auth-campo-borda'), cor(tema, 'base', 'cor-card'))).toBeGreaterThanOrEqual(3)
  })
})

describe('botão de tema: contraste não textual (WCAG 1.4.11, 3:1)', () => {
  const botao = readFileSync(resolve(process.cwd(), 'src/tema/botao-tema.css'), 'utf8')
  const tokens = (bloco: string) => (nome: string): string => {
    const valor = new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`).exec(bloco)?.[1]
    if (!valor) throw new Error(`token --${nome} ausente`)
    return valor.length === 4 ? '#' + [...valor.slice(1)].map((c) => c + c).join('') : valor
  }
  const claro = tokens(/:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? '')
  const escuro = tokens(/:root\[data-tema='escuro'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? '')

  /** Token usado por uma propriedade dentro de um seletor exato de botao-tema.css. */
  const usado = (seletor: string, propriedade: string): string => {
    const bloco = new RegExp(`${seletor.replace(/[.:()]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(botao)?.[1] ?? ''
    const achado = new RegExp(`${propriedade}:[^;]*var\\(--([a-z-]+)\\)`).exec(bloco)?.[1]
    if (!achado) throw new Error(`${seletor} ${propriedade} sem token`)
    return achado
  }

  it.each([
    ['claro', claro],
    ['escuro', escuro],
  ])('no tema %s o anel, o trilho e a bolinha passam de 3:1', (_nome, t) => {
    const anel = t(usado('.theme__toggle', 'box-shadow'))
    const trilho = t(usado('.theme__toggle', 'background-color'))
    const bolinha = t(usado('.theme__toggle::before', 'background-color'))
    for (const fundo of ['cor-card', 'cor-fundo']) {
      expect(contrasteHex(anel, t(fundo)), `anel sobre ${fundo}`).toBeGreaterThanOrEqual(3)
    }
    expect(contrasteHex(bolinha, trilho), 'bolinha sobre trilho').toBeGreaterThanOrEqual(3)
  })

  it('marcado (escuro): a bolinha continua com 3:1 sobre o trilho marcado', () => {
    const bloco = /\.theme__toggle:checked\s*\{([^}]*)\}/.exec(botao)?.[1] ?? ''
    const marcado = /background-color:\s*var\(--([a-z-]+)\)/.exec(bloco)?.[1] ?? usado('.theme__toggle', 'background-color')
    expect(contrasteHex(escuro(usado('.theme__toggle::before', 'background-color')), escuro(marcado))).toBeGreaterThanOrEqual(3)
  })
})

describe('fluidez e animações', () => {
  it('define animação item-entra e respeita prefers-reduced-motion', () => {
    expect(css).toMatch(/@keyframes item-entra\s*\{/)
    expect(css).toMatch(/\.item-entra\s*\{/)
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.item-entra\s*\{[\s\S]*?animation:\s*none/)
  })

  it('elementos interativos possuem transições suaves que respeitam prefers-reduced-motion', () => {
    expect(css).toMatch(/transition-duration:\s*150ms/)
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?transition:\s*none/)
  })
})

describe('superfícies sólidas, sombras e curva', () => {
  const cssSemComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const authCard = /\.auth-card\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const authH1 = /\.auth-card h1\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const authInput = /\.auth-card input\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const authFoco = /\.auth-card input:focus\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
  const authBotao = /\.auth-card button\[type='submit'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''

  it('declara superfície sólida, sombras e curva; sem degradê de fundo', () => {
    expect(token('superficie')).toBe('var(--cor-card)')
    expect(token('superficie-borda')).toBe('var(--cor-linha)')
    expect(token('fundo-degrade')).toBeUndefined()
    expect(token('raio-card')).toBe('14px')
    expect(token('curva')).toBe('cubic-bezier(0.22, 1, 0.36, 1)')
    expect(token('sombra-elevada')).toBeDefined()
  })

  it('a sombra elevada e a flutuante mudam entre o claro e o escuro', () => {
    expect(blocoClaro).toMatch(/--sombra-flutuante:\s*0 1px 2px rgb\(20 33 61 \/ 6%\);/)
    expect(blocoClaro).toMatch(/--sombra-elevada:\s*0 8px 24px rgb\(20 33 61 \/ 8%\);/)
    expect(blocoEscuro).toMatch(/--sombra-flutuante:\s*none;/)
    expect(blocoEscuro).toMatch(/--sombra-elevada:\s*inset 0 1px 0 rgb\(255 255 255 \/ 6%\);/)
    expect(blocoEscuro).not.toMatch(/--superficie-borda/)
  })

  it('nenhum backdrop-filter no index.css nem backdrop-blur em TSX de produção', () => {
    expect(cssSemComentarios).not.toMatch(/backdrop-filter/)
    const infratores = tsxDeProducao().filter((arquivo) =>
      /backdrop-blur|backdrop-filter/.test(readFileSync(resolve(process.cwd(), 'src', arquivo), 'utf8')),
    )
    expect(infratores).toEqual([])
  })

  it('o card de auth é sólido, sem degradê, sem peso 900 e sem hover com scale', () => {
    expect(authCard).not.toMatch(/gradient/)
    expect(authCard).toMatch(/border-radius:\s*18px/)
    expect(authCard).toMatch(/padding:\s*24px 32px/)
    expect(authCard).toMatch(/border:\s*1px solid var\(--cor-linha\)/)
    expect(authCard).toMatch(/background:\s*var\(--cor-card\)/)
    expect(authCard).toMatch(/box-shadow:\s*var\(--sombra-elevada\)/)
    expect(authH1).toMatch(/font-size:\s*28px/)
    expect(authH1).toMatch(/font-weight:\s*500/)
    expect(authH1).toMatch(/color:\s*var\(--cor-texto\)/)
    expect(authH1).not.toMatch(/font-weight:\s*900/)
    expect(authBotao).not.toMatch(/gradient/)
    expect(authBotao).toMatch(/background:\s*var\(--cor-principal-fundo\)/)
    expect(authBotao).toMatch(/color:\s*var\(--cor-sobre-principal-fundo\)/)
    expect(authBotao).toMatch(/transition:\s*transform 150ms var\(--curva\)/)
    const hover = /\.auth-card button\[type='submit'\]:hover:not\(:disabled\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(hover).not.toMatch(/scale/)
    const ativo = /\.auth-card button\[type='submit'\]:active:not\(:disabled\)\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(ativo).toMatch(/scale\(0\.98\)/)
  })

  it('o campo de auth tem borda de 1px em --cor-auth-campo-borda nos dois temas, sem sombra', () => {
    expect(authInput).toMatch(/border:\s*1px solid var\(--cor-auth-campo-borda\)/)
    expect(authInput).not.toMatch(/border-inline/)
    expect(authInput).toMatch(/border-radius:\s*10px/)
    expect(authInput).toMatch(/padding:\s*12px 16px/)
    expect(authInput).not.toMatch(/box-shadow/)
    expect(authFoco).toMatch(/border-color:\s*var\(--cor-principal\)/)
    // Sem regra própria do escuro: o contorno completo já vale nos dois temas.
    expect(css).not.toMatch(/:root\[data-tema='escuro'\]\s*\.auth-card/)
    expect(authBotao).toMatch(/border-radius:\s*10px/)
    expect(authBotao).toMatch(/padding-block:\s*12px/)
  })

  it('o ponto do spinner não tem box-shadow', () => {
    const ponto = /\.dot-spinner__dot::before\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(ponto).not.toMatch(/box-shadow/)
  })

  it('nenhuma animação usa a curva antiga nem ease-out', () => {
    expect(cssSemComentarios).not.toMatch(/cubic-bezier\(0\.16, 1, 0\.3, 1\)/)
    expect(cssSemComentarios).not.toMatch(/ease-out/)
    for (const regra of ['.nota-entra', '.item-entra', '.paleta-entra', '.menu-painel']) {
      const bloco = new RegExp(`\\${regra}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
      expect(bloco, `${regra} sem var(--curva)`).toMatch(/var\(--curva\)/)
    }
  })

  it('card_e_superficie_usam_os_tokens', () => {
    for (const classe of ['superficie', 'card']) {
      const bloco = new RegExp(`\\.${classe}\\s*\\{([^}]*)\\}`).exec(css)?.[1]
      expect(bloco, `.${classe} ausente`).toBeDefined()
      expect(bloco).toMatch(/background:\s*var\(--superficie\)/)
      expect(bloco).toMatch(/border:\s*1px solid var\(--superficie-borda\)/)
      expect(bloco).toMatch(/box-shadow:\s*var\(--sombra-flutuante\)/)
      expect(bloco).not.toMatch(/backdrop-filter/)
    }
  })

  it('card_mantem_raio_e_padding', () => {
    const bloco = /\.card\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bloco).toMatch(/border-radius:\s*var\(--raio-card\)/)
    expect(bloco).toMatch(/padding:\s*1rem/)
  })
})

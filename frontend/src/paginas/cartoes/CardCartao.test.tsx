import { render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CartaoResponse } from '../../api/tipos'
import { CardCartao } from './CardCartao'

// O Vitest roda com `css: false`, que esvazia `import '...css?raw'`; por isso os arquivos são lidos direto.
const lerFonte = (arquivo: string) => readFileSync(resolve(process.cwd(), 'src/paginas/cartoes', arquivo), 'utf8')
const tsx = lerFonte('CardCartao.tsx')
const css = lerFonte('CardCartao.css').replace(/\/\*[\s\S]*?\*\//g, '')

const cartao = (parcial: Partial<CartaoResponse> = {}): CartaoResponse => ({
  itemId: 7,
  nome: 'Nubank Ultravioleta',
  diaVencimento: 12,
  fatura: '730.00',
  limite: '1000.00',
  uso: '0.7300',
  faixa: 'AMARELO',
  titular: 'Marina',
  ...parcial,
})

describe('CardCartao: material do banco', () => {
  it('usa o degradê do banco no cartão, por estilo inline', () => {
    render(<CardCartao cartao={cartao()} />)
    const material = screen.getByTestId('material-cartao')
    expect(material.getAttribute('style')).toContain('linear-gradient(135deg, rgb(138, 5, 190), rgb(91, 3, 128))')
    expect(material).toHaveStyle({ color: '#F4EDE0' })
    expect(material).not.toHaveAttribute('data-neutro', 'true')
  })

  it('mostra o nome do banco em sentence case, sem "CARTÃO" em caixa-alta', () => {
    const { container } = render(<CardCartao cartao={cartao()} />)
    expect(within(screen.getByTestId('material-cartao')).getByText('Nubank')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/CARTÃO/)
  })

  it('banco desconhecido: material neutro de tema e nenhum rótulo genérico', () => {
    const { container } = render(<CardCartao cartao={cartao({ nome: 'Cartão Loja' })} />)
    const material = screen.getByTestId('material-cartao')
    expect(material).toHaveAttribute('data-neutro', 'true')
    expect(material.getAttribute('style')).toContain('var(--cor-elevado)')
    expect(material.getAttribute('style')).toContain('var(--cor-card)')
    expect(within(material).queryByText(/cart[aã]o/i)).not.toBeInTheDocument()
    expect(container.textContent).not.toMatch(/CARTÃO/)
  })

  it('palavra de cor no nome (azul, roxo) não pinta o cartão', () => {
    render(<CardCartao cartao={cartao({ nome: 'Cartão Roxo' })} />)
    expect(screen.getByTestId('material-cartao')).toHaveAttribute('data-neutro', 'true')
  })
})

describe('CardCartao: chips e botões neutros', () => {
  it('o titular é chip neutro, sem coral', () => {
    render(<CardCartao cartao={cartao()} />)
    const chip = screen.getByText('Marina')
    expect(chip).toHaveClass('rounded-md', 'bg-[var(--cor-elevado)]', 'text-[var(--cor-secundario)]')
    expect(chip.className).not.toMatch(/cor-principal|rounded-full|font-bold/)
  })

  it('o chip de uso usa token de status, rounded-md e peso 500', () => {
    render(<CardCartao cartao={cartao({ faixa: 'VERDE', uso: '0.2000' })} />)
    const chip = screen.getByText('20%')
    expect(chip).toHaveClass('rounded-md', 'font-medium', 'text-[var(--cor-positivo-texto)]')
    expect(chip.className).not.toMatch(/rounded-full|font-bold/)
  })

  it('o selo "Paga" usa os tokens de sucesso, não a paleta crua', () => {
    render(<CardCartao cartao={cartao({ faturaPaga: true })} />)
    const selo = screen.getByText('Paga')
    expect(selo).toHaveClass('rounded-md', 'bg-[var(--cor-ok-fundo)]', 'text-[var(--cor-positivo-texto)]')
    expect(selo.className).not.toMatch(/emerald|amber/)
  })

  it('o "+" do cartão é botão secundário de ícone, 44 px, sem coral', () => {
    render(<CardCartao cartao={cartao()} aoLancar={() => {}} />)
    const botao = screen.getByRole('button', { name: 'Lançar despesa em Nubank Ultravioleta' })
    expect(botao).toHaveClass('size-11', 'rounded-[10px]', 'bg-[var(--cor-elevado)]')
    expect(botao.className).not.toMatch(/bg-\[var\(--cor-principal|rounded-full|cartao-premium__action-btn/)
  })

  it('o lápis de editar tem 44 px e raio de botão', () => {
    render(<CardCartao cartao={cartao()} aoEditar={() => {}} />)
    const botao = screen.getByRole('button', { name: 'Editar Nubank Ultravioleta' })
    expect(botao).toHaveClass('size-11', 'rounded-[10px]')
    expect(botao.className).not.toMatch(/rounded-full/)
  })
})

describe('CardCartao: layout robusto em card estreito', () => {
  it('o rodapé quebra linha em vez de estourar, o "+" nunca encolhe e o rótulo não parte', () => {
    const { container } = render(<CardCartao cartao={cartao()} aoLancar={() => {}} />)
    const rodape = container.querySelector('.border-t') as HTMLElement
    expect(rodape).toHaveClass('flex-wrap')
    expect(screen.getByText('Fatura do mês')).toHaveClass('whitespace-nowrap')
    expect(screen.getByText('Fatura do mês').closest('.min-w-0')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Lançar despesa em Nubank Ultravioleta' })).toHaveClass('shrink-0')
  })

  it('a linha do título tem min-w-0 e o lápis não encolhe', () => {
    render(<CardCartao cartao={cartao()} aoEditar={() => {}} />)
    const titulo = screen.getByRole('heading', { level: 3 })
    expect(titulo).toHaveClass('min-w-0', 'truncate')
    expect(titulo.parentElement).toHaveClass('min-w-0', 'flex-wrap')
    expect(screen.getByRole('button', { name: 'Editar Nubank Ultravioleta' })).toHaveClass('shrink-0')
  })

  it('a barra de uso usa tokens, sem cor fixa', () => {
    render(<CardCartao cartao={cartao()} />)
    const barra = screen.getByRole('meter').firstElementChild as HTMLElement
    expect(barra.getAttribute('style')).toContain('var(--cor-aviso-texto)')
    expect(tsx).not.toMatch(/#[0-9a-f]{6}/i)
  })
})

describe('CardCartao: fonte sem resto do visual antigo', () => {
  it('o TSX não tem a cor-padrão roxa, transição genérica nem paleta crua', () => {
    expect(tsx).not.toMatch(/#4f46e5|#7c3aed/i)
    expect(tsx).not.toMatch(/transition-all|uppercase|tracking-wider|font-bold/)
    expect(tsx).not.toMatch(/emerald|amber|bg-gradient|from-|via-|drop-shadow|shadow-inner/)
    expect(tsx).not.toMatch(/bg-\[#|text-\[#/)
  })

  it('o CSS não tem brilho, glow, sombra colorida, hover que sobe nem cor de marca', () => {
    expect(css).not.toMatch(/shine|glow|pulse-icon|cartao-premium/)
    expect(css).not.toMatch(/transition:\s*all/)
    expect(css).not.toMatch(/translateY|scale\(/)
    expect(css).not.toMatch(/rgba?\(/)
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(css).not.toMatch(/ease(?!-)|cubic-bezier\(0\.16/)
    expect(css).not.toMatch(/border-radius:\s*(50%|20px)/)
  })
})

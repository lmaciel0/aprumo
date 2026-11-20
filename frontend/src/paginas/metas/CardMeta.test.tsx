import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { MetaResponse } from '../../api/tipos'
import { CardMeta } from './CardMeta'

const metaExemplo: MetaResponse = {
  id: 1,
  titulo: 'Reserva de Emergência',
  valorAlvo: '10000.00',
  valorGuardado: '4000.00',
  prazo: '2027-12-31',
  presetVisual: 'reserva',
  icone: 'shield',
  corGradienteInicio: '#047857',
  corGradienteFim: '#10b981',
  fotoUrl: null,
  ordem: 0,
  percentualConcluido: '0.4000',
  valorRestante: '6000.00',
  valorMensalSugerido: '428.57',
  mesesRestantes: 14,
  concluida: false,
}

const metaConcluida: MetaResponse = {
  ...metaExemplo,
  id: 2,
  titulo: 'Viagem dos Sonhos',
  valorAlvo: '5000.00',
  valorGuardado: '5000.00',
  percentualConcluido: '1.0000',
  valorRestante: '0.00',
  valorMensalSugerido: null,
  concluida: true,
}

describe('CardMeta', () => {
  it('renderiza título, valores, percentual e barra de progresso', () => {
    render(<CardMeta meta={metaExemplo} />)

    expect(screen.getByRole('heading', { name: 'Reserva de Emergência' })).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*4\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/de R\$\s*10\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()

    const barra = screen.getByRole('progressbar', { name: /progresso da meta reserva de emergência/i })
    expect(barra).toHaveAttribute('aria-valuenow', '40')
  })

  it('título e ícone de editar sobre a foto usam sobre-imagem, não sobre-principal', () => {
    render(<CardMeta meta={metaExemplo} aoEditar={vi.fn()} />)

    const titulo = screen.getByRole('heading', { name: 'Reserva de Emergência' })
    expect(titulo.className).toContain('text-[var(--cor-sobre-imagem)]')
    expect(titulo.className).toContain('font-medium')
    expect(titulo.className).not.toContain('--cor-sobre-principal')

    const editar = screen.getByRole('button', { name: /editar reserva de emergência/i })
    expect(editar.className).toContain('text-[var(--cor-sobre-imagem)]')
    expect(editar.className).toContain('size-11')
    expect(editar.className).toContain('rounded-[10px]')
    expect(editar.className).not.toContain('--cor-sobre-principal')
    expect(editar.className).not.toContain('rounded-full')
  })

  it('o código não usa paleta crua, preto ou branco com opacidade nem degradê em classe', () => {
    const arquivo = readFileSync(resolve(process.cwd(), 'src/paginas/metas/CardMeta.tsx'), 'utf8')

    expect(arquivo).not.toMatch(/\b(emerald|sky|amber|red|blue)-\d/)
    expect(arquivo).not.toMatch(/(black|white)\//)
    expect(arquivo).not.toMatch(/gradient/)
  })

  it('a foto aparece inteira sob um véu neutro, sem tinta do preset', () => {
    const { container } = render(
      <CardMeta meta={{ ...metaExemplo, fotoUrl: '/minha-foto.jpg' }} aoEditar={vi.fn()} />,
    )

    const foto = container.querySelector('img')
    expect(foto).toHaveAttribute('src', '/minha-foto.jpg')
    expect(foto?.className).not.toContain('mix-blend')
    expect(foto?.className).not.toContain('opacity-')
    expect(container.querySelector('.veu-foto')).not.toBeNull()
    expect(container.querySelector('[style*="gradient"]')).toBeNull()
  })

  it('meta personalizada sem foto mostra o hero em superfície elevada com o título legível', () => {
    const { container } = render(
      <CardMeta
        meta={{ ...metaExemplo, presetVisual: 'personalizado', icone: 'target', fotoUrl: null }}
        aoEditar={vi.fn()}
      />,
    )

    expect(container.querySelector('img')).toBeNull()
    const titulo = screen.getByRole('heading', { name: 'Reserva de Emergência' })
    const hero = titulo.closest('div.relative')
    expect(hero?.className).toContain('bg-[var(--cor-elevado)]')
    expect(hero?.querySelector('.veu-foto')).not.toBeNull()
    expect(titulo.className).toContain('text-[var(--cor-sobre-imagem)]')
    expect(screen.getByRole('button', { name: /editar reserva de emergência/i })).toBeInTheDocument()
  })

  it('o selo da categoria é um chip neutro, sem coral', () => {
    render(<CardMeta meta={metaExemplo} />)

    const chip = screen.getByText('Reserva de Emergência', { selector: 'span' }).closest('span.inline-flex')
    expect(chip?.className).toContain('rounded-md')
    expect(chip?.className).toContain('bg-[var(--cor-card)]/90')
    expect(chip?.className).toContain('text-[var(--cor-texto)]')
    expect(chip?.className).not.toContain('--cor-principal')
  })

  it('a barra usa a cor de dinheiro guardado e o trilho elevado', () => {
    render(<CardMeta meta={metaExemplo} />)

    const barra = screen.getByRole('progressbar', { name: /progresso da meta/i })
    expect(barra.className).toContain('bg-[var(--cor-elevado)]')
    const preenchimento = barra.firstElementChild as HTMLElement
    expect(preenchimento.className).toContain('bg-[var(--cor-grafico-receitas)]')
    expect(preenchimento.style.width).toBe('40%')
    expect(preenchimento.style.background).not.toContain('gradient')
  })

  it('meta concluída usa a barra positiva', () => {
    render(<CardMeta meta={metaConcluida} />)

    const barra = screen.getByRole('progressbar', { name: /progresso da meta/i })
    expect((barra.firstElementChild as HTMLElement).className).toContain('bg-[var(--cor-positivo)]')
  })

  it('valor guardado acima do alvo limita barra, aria e texto a 100%', () => {
    render(
      <CardMeta
        meta={{
          ...metaConcluida,
          valorGuardado: '7500.00',
          percentualConcluido: '1.5000',
        }}
      />,
    )

    const barra = screen.getByRole('progressbar', { name: /progresso da meta/i })
    expect(barra).toHaveAttribute('aria-valuenow', '100')
    expect((barra.firstElementChild as HTMLElement).style.width).toBe('100%')
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.queryByText('150%')).toBeNull()
  })

  it('Guardar é ação secundária e Resgatar é botão de texto, sem coral', () => {
    render(<CardMeta meta={metaExemplo} />)

    const guardar = screen.getByRole('button', { name: /guardar/i })
    expect(guardar.className).not.toContain('--cor-principal-fundo')
    expect(guardar.className).toContain('bg-[var(--cor-elevado)]')
    expect(guardar.className).toContain('border-[var(--cor-linha)]')
    expect(guardar.className).toContain('text-[var(--cor-texto)]')
    expect(guardar.className).toContain('min-h-11')

    const resgatar = screen.getByRole('button', { name: /resgatar/i })
    expect(resgatar.className).toContain('text-[var(--cor-secundario)]')
    expect(resgatar.className).toContain('hover:bg-[var(--cor-elevado)]')
    expect(resgatar.className).toContain('min-h-11')
  })

  it('valor mensal sugerido e percentual usam o tom secundário', () => {
    render(<CardMeta meta={metaExemplo} />)

    const mensal = screen.getByText(/R\$\s*428,57\/mês/)
    expect(mensal.className).toContain('text-[var(--cor-secundario)]')
    expect(mensal.className).not.toContain('--cor-principal')
    expect(screen.getByText('40%').className).toContain('text-[var(--cor-secundario)]')
  })

  it('números em peso 500, sem negrito', () => {
    render(<CardMeta meta={metaExemplo} />)

    const guardado = screen.getByText(/R\$\s*4\.000,00/)
    expect(guardado.className).toContain('font-medium')
    expect(guardado.className).not.toContain('font-bold')
  })

  it('exibe ritmo mensal sugerido quando houver prazo', () => {
    render(<CardMeta meta={metaExemplo} />)

    expect(screen.getByText(/R\$\s*428,57\/mês/)).toBeInTheDocument()
  })

  it('exibe selo de concluída como chip de status ok, sem exclamação', () => {
    const { container } = render(<CardMeta meta={metaConcluida} />)

    const selo = screen.getByText('Concluída').closest('span.inline-flex')
    expect(selo?.className).toContain('bg-[var(--cor-ok-fundo)]')
    expect(selo?.className).toContain('text-[var(--cor-positivo-texto)]')
    expect(selo?.className).toContain('rounded-md')
    expect(selo?.querySelector('svg')).toHaveClass('size-3')
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Objetivo alcançado')).toBeInTheDocument()
    expect(container.textContent).not.toContain('!')
  })

  it('aciona callbacks de guardar, resgatar e editar', async () => {
    const user = userEvent.setup()
    const aoGuardar = vi.fn()
    const aoResgatar = vi.fn()
    const aoEditar = vi.fn()

    render(
      <CardMeta
        meta={metaExemplo}
        aoGuardar={aoGuardar}
        aoResgatar={aoResgatar}
        aoEditar={aoEditar}
      />,
    )

    const btnGuardar = screen.getByRole('button', { name: /guardar/i })
    await user.click(btnGuardar)
    expect(aoGuardar).toHaveBeenCalledWith(metaExemplo)

    const btnResgatar = screen.getByRole('button', { name: /resgatar/i })
    await user.click(btnResgatar)
    expect(aoResgatar).toHaveBeenCalledWith(metaExemplo)

    const btnEditar = screen.getByRole('button', { name: /editar reserva de emergência/i })
    await user.click(btnEditar)
    expect(aoEditar).toHaveBeenCalledWith(metaExemplo)
  })
})

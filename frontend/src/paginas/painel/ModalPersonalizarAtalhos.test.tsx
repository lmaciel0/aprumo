import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PreferenciasProvider } from '../../preferencias/PreferenciasContext'
import { LISTA_ATALHOS } from './atalhosCatalogo'
import { ModalPersonalizarAtalhos } from './ModalPersonalizarAtalhos'

describe('ModalPersonalizarAtalhos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('os atalhos não selecionados têm contorno de 3:1 na linha e no marcador', () => {
    render(
      <PreferenciasProvider>
        <ModalPersonalizarAtalhos aberto={true} aoFechar={() => {}} />
      </PreferenciasProvider>,
    )

    const linhas = LISTA_ATALHOS.map((a) => screen.getByText(a.rotulo).closest('button') as HTMLElement)
    const naoSelecionadas = linhas.filter((l) => !l.className.includes('border-[var(--cor-texto)]'))
    expect(naoSelecionadas.length).toBeGreaterThan(0)
    for (const linha of naoSelecionadas) {
      expect(linha).toHaveClass('border-[var(--cor-auth-campo-borda)]')
      expect(linha.className).not.toContain('border-[var(--cor-linha)]')
      expect(linha.innerHTML).toContain('border-[var(--cor-auth-campo-borda)]')
      expect(linha.innerHTML).not.toContain('border-[var(--cor-linha)]')
    }
  })
})

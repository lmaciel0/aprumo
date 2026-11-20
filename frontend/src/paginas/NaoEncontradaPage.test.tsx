import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderComApp } from '../teste/render'
import { NaoEncontradaPage } from './NaoEncontradaPage'

describe('NaoEncontradaPage', () => {
  it('o_link_de_volta_e_a_acao_principal_em_coral_vivo', () => {
    renderComApp(<NaoEncontradaPage />)

    const voltar = screen.getByRole('link', { name: 'Voltar para o início' })
    expect(voltar).toHaveClass('bg-[var(--cor-principal-fundo)]', 'text-[var(--cor-sobre-principal-fundo)]')
    expect(voltar.className).not.toContain('bg-[var(--cor-principal)]')
  })
})

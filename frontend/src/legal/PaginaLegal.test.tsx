import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PrivacidadePage } from './PrivacidadePage'
import { TermosPage } from './TermosPage'

describe('páginas legais', () => {
  it.each([
    ['PrivacidadePage', <PrivacidadePage key="p" />],
    ['TermosPage', <TermosPage key="t" />],
  ])('%s: o destaque em <strong> usa semibold, não o bolder herdado', (_nome, pagina) => {
    const { container } = render(<MemoryRouter>{pagina}</MemoryRouter>)

    const conteudo = container.querySelector('article > div')
    expect(conteudo).toHaveClass('[&_strong]:font-semibold')
  })
})

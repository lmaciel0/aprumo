import type { FaixaUso } from '../../api/tipos'

/**
 * Cor do preenchimento da barra por faixa de uso (a faixa vem pronta da API), só com tokens do tema. A faixa média usa
 * `--cor-aviso-texto`: é o único tom de aviso com 3:1 contra o trilho (`--cor-linha`) nos dois temas.
 */
export const COR_DA_BARRA: Record<Exclude<FaixaUso, 'SEM_LIMITE'>, string> = {
  VERDE: 'var(--cor-positivo)',
  AMARELO: 'var(--cor-aviso-texto)',
  VERMELHO: 'var(--cor-negativo)',
}

// Texto do chip em tokens `*-texto` sobre os fundos `*-fundo`, para chegar a 4,5:1 (WCAG AA); tokens em index.css.
export const CLASSE_DO_CHIP: Record<Exclude<FaixaUso, 'SEM_LIMITE'>, string> = {
  VERDE: 'bg-[var(--cor-ok-fundo)] text-[var(--cor-positivo-texto)]',
  AMARELO: 'bg-[var(--cor-aviso-fundo)] text-[var(--cor-aviso-texto)]',
  VERMELHO: 'bg-[var(--cor-erro-fundo)] text-[var(--cor-negativo-texto)]',
}

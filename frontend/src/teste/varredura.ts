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

/**
 * Arquivos em que `rounded-full` só aparece em forma que é pílula de verdade: avatar, ponto, amostra de cor,
 * trilho e barra de progresso, botão "Criar" da dock. Arquivo de uso misto só entra aqui depois de os elementos
 * que não são pílula terem sido trocados (e conferidos no teste do componente).
 */
export const PILULAS_PERMITIDAS: Array<{ arquivo: string; motivo: string }> = [
  { arquivo: 'componentes/Esqueleto.tsx', motivo: 'variante circulo do esqueleto, que imita avatar' },
  { arquivo: 'layout/DockInferior.tsx', motivo: 'botão Criar elevado no centro da dock' },
  { arquivo: 'layout/DockLateral.tsx', motivo: 'avatar da conta' },
  { arquivo: 'layout/HeaderPrincipal.tsx', motivo: 'avatar da conta e ponto de notificação' },
  { arquivo: 'layout/Sidebar.tsx', motivo: 'avatar da conta' },
  { arquivo: 'layout/Logo.tsx', motivo: 'marca do logo, círculo com a inicial (como avatar)' },
  { arquivo: 'auth/LayoutAuth.tsx', motivo: 'marca do logo, círculo com a inicial (como avatar)' },
  { arquivo: 'paginas/mais/MaisPage.tsx', motivo: 'avatar da conta' },
  { arquivo: 'paginas/cartoes/CartoesPage.tsx', motivo: 'trilho do esqueleto de progresso do limite' },
  { arquivo: 'paginas/inicio/OndeMaisGastou.tsx', motivo: 'trilho e barra de progresso' },
  { arquivo: 'paginas/inicio/ResumoCartoes.tsx', motivo: 'trilho e barra de progresso do limite' },
  { arquivo: 'paginas/categorias/CabecalhoCategorias.tsx', motivo: 'pontos de tipo (despesa e receita)' },
  { arquivo: 'paginas/categorias/LinhaCategoria.tsx', motivo: 'ponto de cor da categoria' },
  { arquivo: 'paginas/categorias/LinhaSubcategoria.tsx', motivo: 'ponto de cor da subcategoria' },
  { arquivo: 'paginas/categorias/SeletorCor.tsx', motivo: 'amostras de cor' },
  { arquivo: 'paginas/notas/CartaoNota.tsx', motivo: 'ponto de cor da categoria' },
  { arquivo: 'paginas/notas/EditorCategoriaNota.tsx', motivo: 'amostras de cor' },
  { arquivo: 'paginas/notas/FaixaCategorias.tsx', motivo: 'ponto de cor da categoria' },
  { arquivo: 'paginas/painel/NotaFixada.tsx', motivo: 'ponto de cor da categoria' },
  { arquivo: 'paginas/painel/ModalPersonalizarAtalhos.tsx', motivo: 'indicador vazio de seleção (radio)' },
  { arquivo: 'preferencias/PreferenciasModal.tsx', motivo: 'amostra de cor do preset' },
]

/**
 * Arquivos em que `rounded-2xl` (16 px) é painel flutuante ou modal, o raio certo para esse tipo.
 * Linha, botão, campo e sub-painel dentro de formulário usam `rounded-[10px]` ou `rounded-[var(--raio-card)]`.
 */
export const PAINEIS_2XL: Array<{ arquivo: string; motivo: string }> = [
  { arquivo: 'layout/AcaoRapida.tsx', motivo: 'folha de ações flutuante sobre a dock' },
  { arquivo: 'layout/AppShell.tsx', motivo: 'barra do cabeçalho, dock lateral e menu do celular' },
  { arquivo: 'layout/DockInferior.tsx', motivo: 'barra flutuante da dock' },
  { arquivo: 'layout/HeaderPrincipal.tsx', motivo: 'menu da conta' },
  { arquivo: 'layout/PaletaNavegacao.tsx', motivo: 'janela da paleta' },
  { arquivo: 'paginas/categorias/CabecalhoCategorias.tsx', motivo: 'menu de criação' },
  { arquivo: 'paginas/lancamentos/Moldura.tsx', motivo: 'janela modal a partir de md' },
  { arquivo: 'paginas/painel/ModalPersonalizarAtalhos.tsx', motivo: 'modal centralizado a partir de sm' },
  { arquivo: 'preferencias/PreferenciasModal.tsx', motivo: 'modal centralizado' },
]

const normalizar =(caminho: string): string => caminho.replaceAll('\\', '/')

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

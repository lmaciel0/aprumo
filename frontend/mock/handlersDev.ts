import { http, HttpResponse, type HttpHandler } from 'msw'
import type { CategoriaNotaResponse, LancamentoResponse, NotaFixadaResponse, SaldoResponse } from '../src/api/tipos'
import { usuarioFicticio } from '../src/teste/auth'
import { CARTOES_API, CATEGORIAS_API, RESUMO_API } from '../src/teste/fixturesInicio'
import { CONSELHEIRO_API, META_API_CONCLUIDA, META_API_EM_ANDAMENTO, META_API_SEM_PRAZO } from '../src/teste/fixturesMetas'
import { categoriasFicticias, lancamento } from '../src/teste/lancamentos'

const [receitas, moradia, lazer] = categoriasFicticias()
if (!receitas || !moradia || !lazer) {
  throw new Error('categoriasFicticias() precisa retornar ao menos 3 categorias')
}

const lancamentosDev: LancamentoResponse[] = [
  lancamento({
    id: 1,
    itemId: 10,
    itemNome: 'Salário',
    categoriaId: receitas.id,
    categoriaNome: receitas.nome,
    tipo: 'RECEITA',
    ano: 2026,
    mes: 11,
    valor: '5000.00',
    status: 'PAGO',
    vencimento: '2026-11-05',
  }),
  lancamento({
    id: 2,
    itemId: 11,
    itemNome: 'Rendimento',
    categoriaId: receitas.id,
    categoriaNome: receitas.nome,
    tipo: 'RECEITA',
    ano: 2026,
    mes: 11,
    valor: '450.00',
    status: 'PREVISTO',
    vencimento: '2026-11-28',
  }),
  lancamento({
    id: 3,
    itemId: 20,
    itemNome: 'Luz',
    categoriaId: moradia.id,
    categoriaNome: moradia.nome,
    tipo: 'DESPESA',
    ano: 2026,
    mes: 11,
    valor: '245.80',
    status: 'PAGO',
    vencimento: '2026-11-10',
  }),
  lancamento({
    id: 4,
    itemId: 21,
    itemNome: 'Condomínio',
    categoriaId: moradia.id,
    categoriaNome: moradia.nome,
    tipo: 'DESPESA',
    ano: 2026,
    mes: 11,
    valor: '890.00',
    status: 'PREVISTO',
    vencimento: '2026-11-30',
  }),
  lancamento({
    id: 5,
    itemId: 22,
    itemNome: 'Gás',
    categoriaId: moradia.id,
    categoriaNome: moradia.nome,
    tipo: 'DESPESA',
    ano: 2026,
    mes: 11,
    valor: '115.00',
    status: 'PAGO',
    vencimento: '2026-11-15',
  }),
  lancamento({
    id: 6,
    itemId: 30,
    itemNome: 'Cinema',
    categoriaId: lazer.id,
    categoriaNome: lazer.nome,
    tipo: 'DESPESA',
    ano: 2026,
    mes: 11,
    valor: '120.00',
    status: 'PREVISTO',
    vencimento: null,
  }),
]

const saldoDev: SaldoResponse = { ativo: true, saldo: '5322.44' }
const notaFixadaDev: NotaFixadaResponse = { nota: null }
const categoriasNotaDev: CategoriaNotaResponse[] = []

export const handlersDev: HttpHandler[] = [
  http.get('*/api/auth/me', () => HttpResponse.json(usuarioFicticio)),
  http.get('*/api/resumo', () => HttpResponse.json(RESUMO_API)),
  http.get('*/api/cartoes', () => HttpResponse.json(CARTOES_API)),
  http.get('*/api/categorias', () => HttpResponse.json(CATEGORIAS_API)),
  http.get('*/api/metas', () => HttpResponse.json([META_API_EM_ANDAMENTO, META_API_CONCLUIDA, META_API_SEM_PRAZO])),
  http.get('*/api/metas/conselheiro', () => HttpResponse.json(CONSELHEIRO_API)),
  http.get('*/api/notas/fixada', () => HttpResponse.json(notaFixadaDev)),
  http.get('*/api/categorias-nota', () => HttpResponse.json(categoriasNotaDev)),
  http.get('*/api/saldo', () => HttpResponse.json(saldoDev)),
  http.get('*/api/lancamentos', () => HttpResponse.json(lancamentosDev)),
]

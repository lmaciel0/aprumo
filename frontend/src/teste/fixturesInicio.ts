import type { CartoesResponse, CategoriaResponse, ResumoResponse } from '../api/tipos'

/**
 * JSON da Início como a API devolve (`CartoesMes`/`CartaoUso`, `ResumoMes`, `CategoriaResponse` em `backend/`).
 * Valores fictícios; dinheiro em string com duas casas, frações com quatro. A ordem dos cartões é de propósito
 * diferente da ordem por fatura, para o teste enxergar a regra do "maior fatura".
 */
export const CARTOES_API: CartoesResponse = {
  totalFaturas: '2270.40',
  limiteTotal: '8000.00',
  usoGeral: '0.2588',
  cartoes: [
    {
      itemId: 11,
      nome: 'Nubank',
      diaVencimento: 10,
      fatura: '730.00',
      limite: '1000.00',
      uso: '0.7300',
      faixa: 'AMARELO',
      titular: 'Diana',
      categoriaId: 6,
      limiteDisponivel: '270.00',
      limiteUsado: '730.00',
      faturaPaga: false,
    },
    {
      itemId: 12,
      nome: 'Itaú Visa',
      diaVencimento: 5,
      fatura: '1240.50',
      limite: '5000.00',
      uso: '0.2481',
      faixa: 'VERDE',
      titular: null,
      categoriaId: 6,
      limiteDisponivel: '3759.50',
      limiteUsado: '1240.50',
      faturaPaga: false,
    },
    {
      itemId: 13,
      nome: 'Inter',
      diaVencimento: 20,
      fatura: '200.00',
      limite: null,
      uso: null,
      faixa: 'SEM_LIMITE',
      titular: null,
      categoriaId: 6,
      limiteDisponivel: null,
      limiteUsado: '200.00',
      faturaPaga: true,
    },
    {
      itemId: 14,
      nome: 'Mercado Pago',
      diaVencimento: null,
      fatura: '99.90',
      limite: '2000.00',
      uso: '0.0500',
      faixa: 'VERDE',
      titular: null,
      categoriaId: 6,
      limiteDisponivel: '1900.10',
      limiteUsado: '99.90',
      faturaPaga: false,
    },
  ],
}

export const RESUMO_API: ResumoResponse = {
  receitas: '5000.00',
  despesas: '3200.00',
  sobra: '1800.00',
  sobraAno: '9400.00',
  anterior: { receitas: '5000.00', despesas: '2900.00', sobra: '2100.00' },
  categorias: [
    { categoriaId: 2, nome: 'Doméstica', total: '1500.00', percentual: '0.4688' },
    { categoriaId: 3, nome: 'Transporte', total: '800.00', percentual: '0.2500' },
    { categoriaId: 4, nome: 'Entretenimento', total: '450.00', percentual: '0.1406' },
    { categoriaId: 5, nome: 'Saúde', total: '300.00', percentual: '0.0938' },
    { categoriaId: 11, nome: 'Pessoais', total: '150.00', percentual: '0.0469' },
  ],
  proximas: [
    {
      lancamentoId: 101,
      itemNome: 'Aluguel',
      categoriaNome: 'Doméstica',
      valor: '1300.00',
      vencimento: '2026-11-28',
      atrasada: false,
    },
  ],
  serieAno: Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receitas: i < 11 ? '5000.00' : '0.00',
    receitasPrevistas: '0.00',
    despesas: i < 11 ? '3000.00' : '0.00',
    despesasPrevistas: i === 10 ? '1300.00' : '0.00',
  })),
}

/** Não traz a categoria 11 (Pessoais), que está no resumo: cobre o caso "categoria desconhecida". */
export const CATEGORIAS_API: CategoriaResponse[] = [
  { id: 1, nome: 'Receitas', tipo: 'RECEITA', ordem: 0, icone: 'salario', cor: '#10b981', itens: [] },
  {
    id: 2,
    nome: 'Doméstica',
    tipo: 'DESPESA',
    ordem: 1,
    icone: 'casa',
    cor: '#06b6d4',
    itens: [
      { id: 21, nome: 'Aluguel', diaVencimento: 28, cartao: false, limite: null, arquivado: false, titular: null },
    ],
  },
  { id: 3, nome: 'Transporte', tipo: 'DESPESA', ordem: 2, icone: 'transporte', cor: '#3b82f6', itens: [] },
  { id: 4, nome: 'Entretenimento', tipo: 'DESPESA', ordem: 3, icone: 'praia', cor: '#f97316', itens: [] },
  { id: 5, nome: 'Saúde', tipo: 'DESPESA', ordem: 4, icone: 'saude', cor: '#84cc16', itens: [] },
  {
    id: 6,
    nome: 'Cartões de crédito',
    tipo: 'DESPESA',
    ordem: 5,
    icone: 'outros',
    cor: '#f43f5e',
    itens: [
      { id: 11, nome: 'Nubank', diaVencimento: 10, cartao: true, limite: '1000.00', arquivado: false, titular: 'Diana' },
      { id: 12, nome: 'Itaú Visa', diaVencimento: 5, cartao: true, limite: '5000.00', arquivado: false, titular: null },
    ],
  },
]

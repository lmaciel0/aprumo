import type { MetaApi, ResumoConselheiroApi } from '../api/tipos'

/**
 * JSON das metas como a API devolve (`MetaResponse.java`, `ResumoConselheiroResponse.java`). Valores fictícios,
 * monetários em string com duas casas e `percentualConcluido` como fração com quatro casas.
 */
export const META_API_EM_ANDAMENTO: MetaApi = {
  id: 1,
  nome: 'Viagem para Lisboa',
  valorAlvo: '10000.00',
  valorGuardado: '4000.00',
  mesAlvo: 12,
  anoAlvo: 2027,
  presetVisual: 'viagem',
  imagemUrl: 'https://exemplo.com/lisboa.jpg',
  corGradiente: null,
  ordem: 0,
  percentualConcluido: '0.4000',
  valorRestante: '6000.00',
  mesesRestantes: 13,
  valorMensalSugerido: '461.54',
  concluida: false,
}

export const META_API_CONCLUIDA: MetaApi = {
  id: 2,
  nome: 'IPVA 2027',
  valorAlvo: '3000.00',
  valorGuardado: '3000.00',
  mesAlvo: 1,
  anoAlvo: 2027,
  presetVisual: 'carro',
  imagemUrl: null,
  corGradiente: null,
  ordem: 1,
  percentualConcluido: '1.0000',
  valorRestante: '0.00',
  mesesRestantes: 2,
  valorMensalSugerido: '0.00',
  concluida: true,
}

export const META_API_SEM_PRAZO: MetaApi = {
  id: 3,
  nome: 'Reserva de emergência',
  valorAlvo: '5000.00',
  valorGuardado: '1250.00',
  mesAlvo: null,
  anoAlvo: null,
  presetVisual: null,
  imagemUrl: null,
  corGradiente: null,
  ordem: 2,
  percentualConcluido: '0.2500',
  valorRestante: '3750.00',
  mesesRestantes: null,
  valorMensalSugerido: '0.00',
  concluida: false,
}

export const CONSELHEIRO_API: ResumoConselheiroApi = {
  sobraMes: '1250.00',
  totalMetas: 3,
  totalGuardado: '8250.00',
  totalAlvo: '18000.00',
  sugestaoTexto: 'Sua sobra prevista em 11/2026 é de R$ 1250,00. Que tal destinar parte para suas metas?',
  sugestoes: [
    { metaId: 1, nome: 'Viagem para Lisboa', valorSugerido: '461.54', mesesRestantes: 13 },
    { metaId: 4, nome: 'Notebook novo', valorSugerido: '300.00', mesesRestantes: 1 },
  ],
}

/** Sobra negativa com meta ativa: o backend monta as sugestões mesmo assim (sem olhar a sobra do mês). */
export const CONSELHEIRO_API_SOBRA_NEGATIVA_COM_METAS: ResumoConselheiroApi = {
  sobraMes: '-350.00',
  totalMetas: 1,
  totalGuardado: '4000.00',
  totalAlvo: '10000.00',
  sugestaoTexto: 'Atenção: não há sobra prevista para 11/2026. O foco neste mês é manter as despesas no limite.',
  sugestoes: [{ metaId: 1, nome: 'Viagem para Lisboa', valorSugerido: '461.54', mesesRestantes: 13 }],
}

export const CONSELHEIRO_API_SEM_SUGESTOES: ResumoConselheiroApi = {
  sobraMes: '-350.00',
  totalMetas: 0,
  totalGuardado: '0.00',
  totalAlvo: '0.00',
  sugestaoTexto: 'Atenção: não há sobra prevista para 11/2026. O foco neste mês é manter as despesas no limite.',
  sugestoes: [],
}

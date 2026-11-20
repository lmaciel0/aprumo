import { obterPresetVisual, PRESETS_VISUAIS } from '../paginas/metas/presetsVisuais'
import type {
  MetaApi,
  MetaRequest,
  MetaRequestApi,
  MetaResponse,
  ResumoConselheiroApi,
  ResumoConselheiroResponse,
  SugestaoAporteApi,
  SugestaoAporteMeta,
} from './tipos'

/**
 * Fronteira entre o contrato HTTP de Metas e os tipos que as telas usam. A API guarda o prazo como mês e ano
 * (sem dia) e não guarda ícone; a UI trabalha com `prazo` em `AAAA-MM-01` e tira o ícone do preset.
 */

const PRESET_PADRAO = PRESETS_VISUAIS.personalizado

/** `AAAA-MM-01` a partir de mês e ano; sem um dos dois, `null`. */
function prazoDaApi(mesAlvo: number | null, anoAlvo: number | null): string | null {
  if (mesAlvo === null || anoAlvo === null) {
    return null
  }
  return `${String(anoAlvo).padStart(4, '0')}-${String(mesAlvo).padStart(2, '0')}-01`
}

/** Lê `AAAA-MM` ou `AAAA-MM-DD`; vazio ou fora do formato vira mês e ano nulos. */
function prazoParaApi(prazo: string | null | undefined): Pick<MetaRequestApi, 'mesAlvo' | 'anoAlvo'> {
  const partes = /^(\d{4})-(\d{2})/.exec(prazo ?? '')
  if (!partes) {
    return { mesAlvo: null, anoAlvo: null }
  }
  return { mesAlvo: Number(partes[2]), anoAlvo: Number(partes[1]) }
}

export function metaDaApi(m: MetaApi): MetaResponse {
  const presetVisual = m.presetVisual ?? PRESET_PADRAO.id
  return {
    id: m.id,
    titulo: m.nome,
    valorAlvo: m.valorAlvo,
    valorGuardado: m.valorGuardado,
    prazo: prazoDaApi(m.mesAlvo, m.anoAlvo),
    presetVisual,
    icone: obterPresetVisual(presetVisual).icone,
    fotoUrl: m.imagemUrl,
    ordem: m.ordem,
    percentualConcluido: m.percentualConcluido,
    valorRestante: m.valorRestante,
    valorMensalSugerido: m.valorMensalSugerido,
    mesesRestantes: m.mesesRestantes,
    concluida: m.concluida,
  }
}

/** O ícone não vai para a API (vem do preset); `corGradiente` a UI não usa e vai nulo. */
export function metaParaApi(m: MetaRequest): MetaRequestApi {
  return {
    nome: m.titulo,
    valorAlvo: m.valorAlvo,
    valorGuardado: m.valorGuardado ?? null,
    ...prazoParaApi(m.prazo),
    presetVisual: m.presetVisual ?? null,
    imagemUrl: m.fotoUrl ?? null,
    corGradiente: null,
    ordem: m.ordem ?? null,
  }
}

function motivoDaSugestao(mesesRestantes: number | null): string {
  if (mesesRestantes === null) {
    return 'Sem prazo fixo'
  }
  return mesesRestantes === 1 ? 'Falta 1 mês' : `Faltam ${mesesRestantes} meses`
}

/** A sugestão da API não traz preset nem foto: a UI recebe os do preset personalizado. */
function sugestaoDaApi(s: SugestaoAporteApi): SugestaoAporteMeta {
  return {
    metaId: s.metaId,
    titulo: s.nome,
    presetVisual: PRESET_PADRAO.id,
    icone: PRESET_PADRAO.icone,
    fotoUrl: null,
    valorSugerido: s.valorSugerido,
    motivo: motivoDaSugestao(s.mesesRestantes),
  }
}

/** Soma em centavos para não acumular erro de ponto flutuante. */
function somarValores(valores: string[]): string {
  const centavos = valores.reduce((total, valor) => total + Math.round(Number.parseFloat(valor) * 100), 0)
  return (centavos / 100).toFixed(2)
}

export function conselheiroDaApi(r: ResumoConselheiroApi): ResumoConselheiroResponse {
  return {
    sobraPrevistaMes: r.sobraMes,
    totalSugeridoAporte: somarValores(r.sugestoes.map((s) => s.valorSugerido)),
    sugestoes: r.sugestoes.map(sugestaoDaApi),
  }
}

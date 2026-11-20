export interface PresetVisualMeta {
  id: string
  nome: string
  descricao: string
  icone: string
  fotoPadrao: string
}

export type IdPresetVisual =
  | 'reserva'
  | 'viagem'
  | 'carro'
  | 'casa'
  | 'estudos'
  | 'personalizado'

export const PRESETS_VISUAIS: Record<IdPresetVisual, PresetVisualMeta> = {
  reserva: {
    id: 'reserva',
    nome: 'Reserva de Emergência',
    descricao: 'Segurança e tranquilidade para imprevistos',
    icone: 'shield',
    fotoPadrao: '/metas/reserva.jpg',
  },
  viagem: {
    id: 'viagem',
    nome: 'Viagem & Férias',
    descricao: 'Conhecer novos lugares e descansar',
    icone: 'plane',
    fotoPadrao: '/metas/viagem.jpg',
  },
  carro: {
    id: 'carro',
    nome: 'Carro & Transporte',
    descricao: 'IPVA, manutenção, seguro ou troca',
    icone: 'car',
    fotoPadrao: '/metas/carro.jpg',
  },
  casa: {
    id: 'casa',
    nome: 'Casa & Reforma',
    descricao: 'IPTU, mobília, decoração ou reforma',
    icone: 'home',
    fotoPadrao: '/metas/casa.jpg',
  },
  estudos: {
    id: 'estudos',
    nome: 'Estudos & Carreira',
    descricao: 'Cursos, livros, equipamentos e especialização',
    icone: 'book',
    fotoPadrao: '/metas/estudos.jpg',
  },
  personalizado: {
    id: 'personalizado',
    nome: 'Personalizado',
    descricao: 'Seu objetivo, com a foto que escolher',
    icone: 'target',
    fotoPadrao: '',
  },
}

export const LISTA_PRESETS: PresetVisualMeta[] = [
  PRESETS_VISUAIS.reserva,
  PRESETS_VISUAIS.viagem,
  PRESETS_VISUAIS.carro,
  PRESETS_VISUAIS.casa,
  PRESETS_VISUAIS.estudos,
  PRESETS_VISUAIS.personalizado,
]

export function obterPresetVisual(presetId?: string | null): PresetVisualMeta {
  if (!presetId) return PRESETS_VISUAIS.personalizado
  const mapa = PRESETS_VISUAIS as Record<string, PresetVisualMeta | undefined>
  return mapa[presetId] ?? PRESETS_VISUAIS.personalizado
}

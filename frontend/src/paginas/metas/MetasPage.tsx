import { useEffect, useState } from 'react'
import { PiggyBank, Plus } from 'lucide-react'
import { endpoints } from '../../api/endpoints'
import type { MetaRequest, MetaResponse } from '../../api/tipos'
import { Carregando } from '../../componentes/Carregando'
import { formatarMoeda } from '../../formato/moeda'
import { foco } from '../../layout/classesFoco'
import { CardMeta } from './CardMeta'
import { ModalAporteMeta } from './ModalAporteMeta'
import { ModalMetaForm } from './ModalMetaForm'

const BOTAO_PRINCIPAL = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[var(--cor-principal-fundo)] px-5 text-sm font-medium text-[var(--cor-sobre-principal-fundo)] transition-colors hover:brightness-95 ${foco}`

export function MetasPage() {
  const [metas, setMetas] = useState<MetaResponse[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modais
  const [metaAporte, setMetaAporte] = useState<MetaResponse | null>(null)
  const [tipoAporte, setTipoAporte] = useState<'GUARDAR' | 'RESGATAR'>('GUARDAR')
  const [modalFormAberto, setModalFormAberto] = useState(false)
  const [metaEdicao, setMetaEdicao] = useState<MetaResponse | null>(null)

  const carregarMetas = async () => {
    try {
      setCarregando(true)
      setErro(null)
      const dados = await endpoints.metas.listar()
      setMetas(dados)
    } catch {
      setErro('Não foi possível carregar suas metas. Verifique sua conexão.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarMetas()
  }, [])

  // Ações de modais
  const abrirGuardar = (meta: MetaResponse) => {
    setMetaAporte(meta)
    setTipoAporte('GUARDAR')
  }

  const abrirResgatar = (meta: MetaResponse) => {
    setMetaAporte(meta)
    setTipoAporte('RESGATAR')
  }

  const abrirCriar = () => {
    setMetaEdicao(null)
    setModalFormAberto(true)
  }

  const abrirEditar = (meta: MetaResponse) => {
    setMetaEdicao(meta)
    setModalFormAberto(true)
  }

  const salvarMeta = async (dados: MetaRequest) => {
    if (metaEdicao) {
      await endpoints.metas.atualizar(metaEdicao.id, dados)
    } else {
      await endpoints.metas.criar(dados)
    }
    await carregarMetas()
  }

  const excluirMeta = async (id: number) => {
    await endpoints.metas.excluir(id)
    await carregarMetas()
  }

  const confirmarAporte = async (valor: string) => {
    if (!metaAporte) return
    if (tipoAporte === 'GUARDAR') {
      await endpoints.metas.guardar(metaAporte.id, { valor })
    } else {
      await endpoints.metas.resgatar(metaAporte.id, { valor })
    }
    await carregarMetas()
  }

  const totalGuardado = metas.reduce(
    (acc, m) => acc + Number.parseFloat(m.valorGuardado || '0'),
    0,
  )
  const concluidasCount = metas.filter((m) => m.concluida).length
  const ativasCount = metas.length - concluidasCount

  const renderConteudo = () => {
    if (carregando) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Carregando />
        </div>
      )
    }

    if (metas.length === 0) {
      return (
        /* Estado vazio */
        <div className="flex flex-col items-center justify-center rounded-[var(--raio-card)] border border-dashed border-[var(--cor-linha)] bg-[var(--cor-card)] p-8 text-center sm:p-12">
          <PiggyBank aria-hidden="true" className="size-6 text-[var(--cor-mutado)]" />
          <h2 className="m-0 mt-4 text-lg font-medium text-[var(--cor-texto)]">
            Nenhuma meta cadastrada
          </h2>
          <p className="m-0 mt-1.5 max-w-sm text-xs text-[var(--cor-mutado)] sm:text-sm">
            Crie sua primeira caixinha para organizar seus objetivos futuros.
            Pode ser IPVA, reserva de emergência, férias ou reformas.
          </p>
          <button
            type="button"
            onClick={abrirCriar}
            className={`mt-6 ${BOTAO_PRINCIPAL}`}
          >
            <Plus className="size-4" />
            <span>Criar primeira meta</span>
          </button>
        </div>
      )
    }

    return (
      <>
        {/* Totais */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card">
            <span className="text-xs font-medium text-[var(--cor-secundario)]">
              Total guardado em metas
            </span>
            <p className="valor m-0 mt-0.5 text-lg font-medium text-[var(--cor-texto)]">
              {formatarMoeda(totalGuardado)}
            </p>
          </div>

          <div className="card">
            <span className="text-xs font-medium text-[var(--cor-secundario)]">
              Metas ativas
            </span>
            <p className="valor m-0 mt-0.5 text-lg font-medium text-[var(--cor-texto)]">
              {ativasCount}
            </p>
          </div>

          <div className="card">
            <span className="text-xs font-medium text-[var(--cor-secundario)]">
              Objetivos alcançados
            </span>
            <p className="valor m-0 mt-0.5 text-lg font-medium text-[var(--cor-texto)]">
              {concluidasCount}
            </p>
          </div>
        </div>

        {/* Grid de Cards de Metas */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metas.map((meta) => (
            <CardMeta
              key={meta.id}
              meta={meta}
              aoGuardar={abrirGuardar}
              aoResgatar={abrirResgatar}
              aoEditar={abrirEditar}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6">
      {/* Cabeçalho da Página */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-[28px] font-medium tracking-tight text-[var(--cor-texto)]">
            Metas e Caixinhas
          </h1>
          <p className="m-0 mt-1 text-xs text-[var(--cor-mutado)] sm:text-sm">
            Guarde dinheiro com propósito para IPVA, viagens, reformas ou reserva.
          </p>
        </div>

        {metas.length > 0 && (
          <button type="button" onClick={abrirCriar} className={BOTAO_PRINCIPAL}>
            <Plus className="size-4" />
            <span>Nova meta</span>
          </button>
        )}
      </header>

      {/* Alerta de Erro */}
      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--raio-card)] border border-[var(--cor-negativo)] bg-[var(--cor-erro-fundo)] p-4 text-xs font-medium text-[var(--cor-negativo-texto)]"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => {
              void carregarMetas()
            }}
            className={`min-h-11 cursor-pointer rounded-[10px] px-2 font-medium underline ${foco}`}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Conteúdo Principal */}
      {renderConteudo()}

      {/* Modais */}
      <ModalAporteMeta
        aberto={Boolean(metaAporte)}
        meta={metaAporte}
        tipo={tipoAporte}
        aoConfirmar={confirmarAporte}
        aoFechar={() => setMetaAporte(null)}
      />

      <ModalMetaForm
        aberto={modalFormAberto}
        meta={metaEdicao}
        aoSalvar={salvarMeta}
        aoExcluir={excluirMeta}
        aoFechar={() => {
          setModalFormAberto(false)
          setMetaEdicao(null)
        }}
      />
    </div>
  )
}

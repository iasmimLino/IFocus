import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

const CORES = ['#2c4a22', '#6f9a5e', '#b07a35', '#567d91', '#a15c53', '#72834a']
const DIAS_POR_PERIODO = { '1d': 1, '1s': 7, '2s': 14, '3s': 21, '1m': 30 }

function formatarDuracao(segundos) {
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const minutosRestantes = minutos % 60
  return horas ? `${horas}h${String(minutosRestantes).padStart(2, '0')}` : `${minutos}min`
}

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function criarEstatisticas(db, periodo) {
  const dias = DIAS_POR_PERIODO[periodo] ?? 7
  const agora = new Date()
  const inicio = new Date(agora)
  inicio.setDate(inicio.getDate() - dias + 1)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + dias)
  const blocos = (db.estudos ?? []).filter((bloco) => {
    const data = new Date(bloco.concluidoEm)
    return Number.isFinite(data.getTime()) && data >= inicio && data < fim
  })
  const categorias = db.kanban?.categorias ?? []
  const tarefas = categorias.flatMap((categoria) => (categoria.itens ?? []).map((item) => ({
    item: typeof item === 'string' ? { titulo: item } : item,
    concluida: /conclu|done/i.test(`${categoria.id} ${categoria.nome}`),
  })))
  const quantidadeBuckets = 7
  const duracaoPeriodo = fim.getTime() - inicio.getTime()
  const datas = Array.from({ length: quantidadeBuckets }, (_, indice) => {
    if (dias === 1) return `${String(indice * 4).padStart(2, '0')}h`
    const data = new Date(inicio.getTime() + ((dias - 1) * indice / (quantidadeBuckets - 1)) * 86400000)
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'numeric' })
  })

  const materias = (db.materias ?? []).map((materia, indice) => {
    const id = String(materia.id ?? materia.materiaId)
    const tarefasMateria = tarefas.filter(({ item }) => String(item.materiaId) === id)
    const estudosMateria = blocos.filter((bloco) => String(bloco.materiaId) === id)
    const serie = Array(quantidadeBuckets).fill(0)
    estudosMateria.forEach((bloco) => {
      const indice = Math.min(quantidadeBuckets - 1, Math.floor(((new Date(bloco.concluidoEm).getTime() - inicio.getTime()) / duracaoPeriodo) * quantidadeBuckets))
      serie[indice] += Number(bloco.segundos) / 60
    })

    return {
      id,
      nome: materia.nome,
      cor: CORES[indice % CORES.length],
      paraFazer: tarefasMateria.filter(({ concluida }) => !concluida).length,
      feitas: tarefasMateria.filter(({ concluida }) => concluida).length,
      totalHr: formatarDuracao(estudosMateria.reduce((total, bloco) => total + Number(bloco.segundos || 0), 0)),
      serie,
    }
  })

  return { datas, materias }
}

/**
 * Spring: EstatisticaController
 *   GET /api/estatisticas?periodo=1d|1s|2s|3s|1m
 */
export async function buscarEstatisticas(periodo) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return criarEstatisticas(db, periodo)
  }
  const { data } = await api.get('/estatisticas', { params: { periodo } })
  return data
}

export async function registrarEstudo({ materiaId, segundos }) {
  const duracao = Math.floor(Number(segundos))
  if (duracao <= 0) return

  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    db.estudos.push({
      id: String(Date.now()),
      materiaId: materiaId ? String(materiaId) : null,
      segundos: duracao,
      concluidoEm: new Date().toISOString(),
    })
    await saveDb(db)
    return
  }

  await api.post('/sessoes/estudos', { materiaId: materiaId || null, segundos: duracao })
}

import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'
import { buscarKanban, removerItem } from './kanbanApi'

function normalizarEvento(evento) {
  return {
    ...evento,
    id: evento.id ?? evento.id_evento,
    titulo: evento.titulo ?? evento.nome,
    data: typeof evento.data === 'string' ? evento.data.slice(0, 10) : evento.data,
    categoria: evento.categoria ?? 'Pessoal',
  }
}

function eventoParaApi(evento) {
  const { id, id_evento, titulo, origem, kanbanItemId, statusKanban, ...campos } = evento
  return {
    ...campos,
    nome: evento.titulo ?? evento.nome,
    prioridade: evento.prioridade ?? false,
  }
}

function mapearItensKanban(kanban, dataFiltro) {
  return (kanban?.categorias ?? []).flatMap((categoria) => (categoria.itens ?? [])
    .filter((item) => typeof item !== 'string' && item.data && (!dataFiltro || item.data === dataFiltro))
    .map((item) => ({
      ...item,
      id: `kanban:${item.id}`,
      kanbanItemId: item.id,
      origem: 'kanban',
      statusKanban: categoria.nome,
      categoria: 'Escola',
      titulo: item.titulo ?? item.texto,
    })))
}

/**
 * Spring: EventoController
 *   GET    /api/eventos
 *   POST   /api/eventos
 *   PUT    /api/eventos/{id}
 *   DELETE /api/eventos/{id}
 *
 * Spring: TurmaController
 *   GET /api/turma                                   -> dados da turma (nome etc.)
 *   GET /api/turma/eventos?data=2024-02-20            -> eventos da turma no dia
 *   GET /api/turma/eventos/mes?ano=2024&mes=2         -> todas as datas do mês com evento da turma
 */
export async function listarEventos(data) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return [
      ...db.eventos.filter((evento) => evento.data === data),
      ...mapearItensKanban(db.kanban, data),
    ]
  }
  const [{ data: eventos }, kanban] = await Promise.all([
    api.get('/eventos', { params: { data } }),
    buscarKanban().catch(() => null),
  ])
  return [
    ...eventos.map(normalizarEvento).filter((evento) => !data || evento.data === data),
    ...mapearItensKanban(kanban, data),
  ]
}

// Retorna o conjunto de dias (YYYY-MM-DD) do mês que têm pelo menos um
// evento pessoal — usado para destacar dias no calendário mensal.
export async function listarDiasComEventos(prefixoMes) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const diasEventos = db.eventos.filter((evento) => evento.data.startsWith(prefixoMes)).map((evento) => evento.data)
    const diasKanban = mapearItensKanban(db.kanban).filter((evento) => evento.data.startsWith(prefixoMes)).map((evento) => evento.data)
    return [...new Set([...diasEventos, ...diasKanban])]
  }
  const [{ data: eventos }, kanban] = await Promise.all([
    api.get('/eventos'),
    buscarKanban().catch(() => null),
  ])
  const diasEventos = eventos.map(normalizarEvento)
    .filter((evento) => evento.data.startsWith(prefixoMes))
    .map((evento) => evento.data)
  const diasKanban = mapearItensKanban(kanban).filter((evento) => evento.data.startsWith(prefixoMes)).map((evento) => evento.data)
  return [...new Set([...diasEventos, ...diasKanban])]
}

export async function criarEvento(evento) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const novo = { ...evento, id: Date.now() }
    db.eventos.push(novo)
    await saveDb(db)
    return novo
  }
  const { data } = await api.post('/eventos', eventoParaApi(evento))
  return normalizarEvento(data)
}

export async function listarEventosCronograma() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.eventos
  }
  const { data } = await api.get('/eventos')
  return data.map(normalizarEvento)
}

export async function editarEvento(id, evento) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const indice = db.eventos.findIndex((item) => item.id === id)
    if (indice < 0) throw new Error('Compromisso não encontrado.')
    db.eventos[indice] = { ...db.eventos[indice], ...evento, id }
    await saveDb(db)
    return db.eventos[indice]
  }
  const { data } = await api.put(`/eventos/${id}`, eventoParaApi(evento))
  return normalizarEvento(data)
}

export async function removerEvento(id) {
  if (typeof id === 'string' && id.startsWith('kanban:')) {
    await removerItem(id.slice('kanban:'.length))
    return true
  }
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    db.eventos = db.eventos.filter((e) => e.id !== id)
    await saveDb(db)
    return true
  }
  await api.delete(`/eventos/${id}`)
  return true
}

// ---------- Turma (calendário da turma/classe) ----------

export async function buscarTurma() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.turma
  }
  const { data } = await api.get('/turma')
  return data
}

export async function listarEventosTurma(data) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.eventosTurma.filter((e) => e.data === data)
  }
  const { data: res } = await api.get('/turma/eventos', { params: { data } })
  return res
}

export async function listarDiasComEventosTurma(prefixoMes) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return [...new Set(db.eventosTurma.filter((e) => e.data.startsWith(prefixoMes)).map((e) => e.data))]
  }
  const [ano, mes] = prefixoMes.split('-').map(Number)
  const { data } = await api.get('/turma/eventos/mes', { params: { ano, mes } })
  return data
}

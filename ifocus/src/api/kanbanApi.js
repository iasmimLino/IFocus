import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

const CATEGORIAS_BACKEND = [
  { id: 'todo', nome: 'A Fazer', status: 'A_FAZER' },
  { id: 'doing', nome: 'Em Progresso', status: 'FAZENDO' },
  { id: 'done', nome: 'Concluído', status: 'FEITA' },
]

function mapearAtividades(atividades) {
  return {
    categorias: CATEGORIAS_BACKEND.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      itens: atividades
        .filter((atividade) => (atividade.status ?? 'A_FAZER') === categoria.status)
        .map((atividade) => ({
          ...atividade,
          id: atividade.id_atividade ?? atividade.id,
          titulo: atividade.titulo ?? atividade.tipo_de_atividade,
          tipo: atividade.tipo_de_atividade,
          data: atividade.prazo ?? atividade.data ?? '',
        })),
    })),
  }
}

function statusDaCategoria(categoriaId) {
  return CATEGORIAS_BACKEND.find((categoria) => categoria.id === categoriaId)?.status ?? 'A_FAZER'
}

/**
 * Spring: AtividadeController
 *   GET   /api/atividade/listar
 *   POST  /api/atividade/cadastrar
 *   PATCH /api/atividade/{id}/status
 *   DELETE /api/atividade/{id}
 */
export async function buscarKanban() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    let alterado = false
    db.kanban.categorias = db.kanban.categorias.map((categoria) => ({
      ...categoria,
      itens: categoria.itens.map((item, indice) => {
        if (typeof item !== 'string') return item
        alterado = true
        return { id: `${categoria.id}-${indice}`, titulo: item, tipo: 'Atividade', data: '' }
      }),
    }))
    if (alterado) await saveDb(db)
    return db.kanban
  }
  const { data } = await api.get('/atividade/listar')
  return mapearAtividades(data)
}

export async function adicionarItem(categoriaId, texto) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const cat = db.kanban.categorias.find((c) => c.id === categoriaId)
    cat.itens.push({ id: String(Date.now()), titulo: texto, tipo: 'Atividade', data: '' })
    await saveDb(db)
    return db.kanban
  }
  await api.post('/atividade/cadastrar', {
    titulo: texto,
    tipo_de_atividade: 'Atividade',
    prazo: new Date().toISOString().slice(0, 10),
    disciplina: 'Geral',
    prioridade: false,
    status: statusDaCategoria(categoriaId),
  })
  return buscarKanban()
}

export async function adicionarEvento(categoriaId, { nome, tipo, data, materiaId = null, duracaoMinutos = null }) {
  const evento = { id: String(Date.now()), titulo: nome, tipo, data, materiaId, duracaoMinutos }
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const categoria = db.kanban.categorias.find((item) => item.id === categoriaId)
    if (!categoria) throw new Error('Categoria inicial não encontrada.')
    categoria.itens.push(evento)
    await saveDb(db)
    return db.kanban
  }
  await api.post('/atividade/cadastrar', {
    titulo: nome,
    tipo_de_atividade: tipo,
    prazo: data,
    disciplina: 'Geral',
    prioridade: false,
    status: statusDaCategoria(categoriaId),
    materiaId,
    duracaoMinutos,
  })
  return buscarKanban()
}

export async function moverItem(itemId, categoriaDestino) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    let itemEncontrado
    db.kanban.categorias = db.kanban.categorias.map((categoria) => ({
      ...categoria,
      itens: categoria.itens.filter((item) => {
        if (String(item.id) !== String(itemId)) return true
        itemEncontrado = item
        return false
      }),
    }))
    if (!itemEncontrado) throw new Error('Evento não encontrado.')
    db.kanban.categorias.find((categoria) => categoria.id === categoriaDestino).itens.push(itemEncontrado)
    await saveDb(db)
    return db.kanban
  }
  await api.patch(`/atividade/${itemId}/status`, null, { params: { novoStatus: statusDaCategoria(categoriaDestino) } })
  return buscarKanban()
}

export async function removerItem(itemId) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    db.kanban.categorias = db.kanban.categorias.map((categoria) => ({
      ...categoria,
      itens: categoria.itens.filter((item) => String(item.id) !== String(itemId)),
    }))
    await saveDb(db)
    return db.kanban
  }
  await api.delete(`/atividade/${itemId}`)
  return buscarKanban()
}

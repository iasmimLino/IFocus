import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

export async function listarMaterias() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.materias
  }
  const { data } = await api.get('/materias')
  return data
}

export async function criarMateria(nome) {
  const nomeNormalizado = nome.trim()
  if (!nomeNormalizado) throw new Error('Informe o nome da matéria.')

  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const existente = db.materias.find((materia) => materia.nome?.toLocaleLowerCase('pt-BR') === nomeNormalizado.toLocaleLowerCase('pt-BR'))
    if (existente) throw new Error('Essa matéria já está cadastrada.')
    const materia = { id: String(Date.now()), nome: nomeNormalizado }
    db.materias.push(materia)
    await saveDb(db)
    return materia
  }

  const { data } = await api.post('/materias', { nome: nomeNormalizado })
  return data
}
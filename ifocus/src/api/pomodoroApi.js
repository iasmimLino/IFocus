import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

/**
 * Spring: SessaoEstudoController
 *   GET  /api/sessoes/config              -> configuração atual (tempos/etapas)
 *   PUT  /api/sessoes/config               -> salva nova configuração
 *   POST /api/sessoes/{id}/encerrar
 *   POST /api/sessoes/nova                 -> cria a próxima sessão (incrementa o número)
 */
export async function buscarConfig() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.pomodoro
  }
  const { data } = await api.get('/sessoes/config')
  return data
}

/**
 * Salva as configurações do Pomodoro (tempos em SEGUNDOS e quantidade de etapas).
 * Usado pela tela de edição (PomodoroConfigModal).
 */
export async function salvarConfig({ tempoFoco, tempoRelaxamento, etapas }) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    db.pomodoro = { ...db.pomodoro, tempoFoco, tempoRelaxamento, etapas }
    await saveDb(db)
    return db.pomodoro
  }
  const { data } = await api.put('/sessoes/config', { tempoFoco, tempoRelaxamento, etapas })
  return data
}

export async function encerrarSessao(id) {
  if (USE_MOCK) {
    await delay()
    return { id, status: 'ENCERRADA' }
  }
  const { data } = await api.post(`/sessoes/${id}/encerrar`)
  return data
}

/**
 * Avança para a próxima sessão (ex: #23 -> #24), mantendo a mesma
 * configuração de tempos/etapas. Chamado automaticamente quando uma
 * sessão termina todas as suas etapas, ou manualmente pelo botão
 * "Nova sessão" depois de um Encerrar manual.
 */
export async function iniciarNovaSessao() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    db.pomodoro.sessaoAtual += 1
    await saveDb(db)
    return db.pomodoro
  }
  const { data } = await api.post('/sessoes/nova')
  return data
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

const FOTO_PERFIL_KEY = 'foto_perfil'

function chaveFotoPerfil(perfil = {}) {
  const identificador = perfil.id || perfil.cpf || perfil.email || 'usuario'
  return `${FOTO_PERFIL_KEY}:${encodeURIComponent(String(identificador).toLocaleLowerCase('pt-BR'))}`
}

/**
 * Spring: UsuarioController
 *   GET /api/usuarios/me
 *   PUT /api/usuarios/me
 */
export async function buscarPerfil() {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    return db.user
  }
  const { data } = await api.get('/usuarios/me')
  return data
}

export async function atualizarPerfil(campos) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const usuarioAnterior = db.user
    db.user = { ...db.user, ...campos }
    const indiceUsuario = db.users.findIndex((usuario) => (
      (usuarioAnterior.email && usuario.email === usuarioAnterior.email)
      || (usuarioAnterior.cpf && usuario.cpf === usuarioAnterior.cpf)
    ))
    if (indiceUsuario >= 0) db.users[indiceUsuario] = db.user
    await saveDb(db)
    return db.user
  }
  const { data } = await api.put('/usuarios/me', campos)
  return data
}

export async function buscarFotoPerfil(perfil) {
  return AsyncStorage.getItem(chaveFotoPerfil(perfil))
}

export async function salvarFotoPerfil(uri, perfil) {
  const chave = chaveFotoPerfil(perfil)
  if (uri) {
    await AsyncStorage.setItem(chave, uri)
    return uri
  }
  await AsyncStorage.removeItem(chave)
  return null
}

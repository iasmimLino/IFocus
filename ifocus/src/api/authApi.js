import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './client'
import { USE_MOCK } from './config'
import { loadDb, saveDb, delay } from './mock'

/**
 * Spring: AuthController
 *   POST /api/auth/login    -> { token, user }
 *   POST /api/auth/register -> { token, user }
 */
export async function login(emailOuCpf, senha) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const identificador = emailOuCpf.trim().toLocaleLowerCase('pt-BR')

    const usuario = db.users.find((conta) =>
      conta.email?.toLocaleLowerCase('pt-BR') === identificador || conta.cpf === emailOuCpf.trim()
    )

    if (!usuario || usuario.senha !== senha) {
      throw new Error('E-mail/CPF ou senha incorretos.')
    }

    db.user = usuario
    await saveDb(db)
    await AsyncStorage.setItem('token', 'demo-token')
    await AsyncStorage.setItem('authRole', 'STUDENT')
    return { token: 'demo-token', user: usuario }
  }

  try {
    const { data } = await api.post('/auth/login', { emailOuCpf: emailOuCpf.trim(), senha })
    await AsyncStorage.setItem('token', data.token)
    await AsyncStorage.setItem('authRole', 'STUDENT')
    return data
  } catch (error) {
    const mensagemErro = error.response?.data?.detail || error.response?.data?.message || 'E-mail/CPF ou senha incorretos.'
    throw new Error(mensagemErro)
  }
}

export async function loginAdmin(login, senha) {
  if (USE_MOCK) {
    throw new Error('O login de administrador requer conexão com o servidor.')
  }

  try {
    const { data } = await api.post('/user_admin/login', { login: login.trim(), senha })
    await AsyncStorage.setItem('token', data.token)
    await AsyncStorage.setItem('authRole', 'ADMIN')
    return data
  } catch (error) {
    const mensagemErro = error.response?.data?.detail || error.response?.data?.message
    throw new Error(mensagemErro || 'Login ou senha de administrador incorretos.')
  }
}

/**
 * Cria uma conta e já efetua o login com ela.
 *
 * No Spring: POST /api/auth/register recebe os mesmos campos e deve
 * validar e-mail duplicado antes de salvar.
 */
export async function register({ nomeCompleto, email, senha, cpf = '', pais = 'Brasil', cidade = '' }) {
  if (USE_MOCK) {
    await delay()
    const db = await loadDb()
    const emailNormalizado = email.trim().toLocaleLowerCase('pt-BR')
    if (db.users.some((conta) => conta.email?.toLocaleLowerCase('pt-BR') === emailNormalizado)) {
      throw new Error('Este e-mail já está cadastrado.')
    }
    const usuario = { nomeCompleto: nomeCompleto.trim(), email: emailNormalizado, senha, cpf, pais, cidade }
    db.users.push(usuario)
    db.user = usuario
    await saveDb(db)
    await AsyncStorage.setItem('token', 'demo-token')
    await AsyncStorage.setItem('authRole', 'STUDENT')
    return { token: 'demo-token', user: usuario }
  }

  try {
    const { data } = await api.post('/auth/register', { nomeCompleto, email, senha, cpf, pais, cidade })
    await AsyncStorage.setItem('token', data.token)
    await AsyncStorage.setItem('authRole', 'STUDENT')
    return data
  } catch (error) {
    const codigo = error.response?.data?.code || error.response?.data?.error
    const mensagemServidor = error.response?.data?.detail || error.response?.data?.message || ''
    if (error.response?.status === 409 || codigo === 'EMAIL_ALREADY_EXISTS' || /e-?mail.*(cadastrad|exist)|already exists|duplicate/i.test(mensagemServidor)) {
      throw new Error('Este e-mail já está cadastrado.')
    }
    const mensagemErro = mensagemServidor || 'Não foi possível criar a conta.'
    throw new Error(mensagemErro)
  }
}

export async function logout() {
  await AsyncStorage.removeItem('token')
  await AsyncStorage.removeItem('authRole')
}
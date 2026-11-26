import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * ======================================================================
 *  PONTO ÚNICO DE CONFIGURAÇÃO DA API (Spring Boot)
 * ======================================================================
 * No React Native NÃO existe proxy tipo o do Vite, então aponte direto
 * para o IP da máquina onde o Spring está rodando. O endereço padrão
 * 10.0.2.2 é o host do Android Emulator; em dispositivo físico, configure
 * EXPO_PUBLIC_API_URL com o IP acessível na rede local.
 *
 * No Spring, isso corresponde a um controller com:
 *   @RestController
 *   @RequestMapping("/api")
 *   @CrossOrigin(origins = "*") // ajuste em produção
 * ======================================================================
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('authRole')
    }
    return Promise.reject(err)
  }
)

export default api

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/LoginScreen'
import CriarContaScreen from '../screens/CriarContaScreen'
import RecuperarSenhaScreen from '../screens/RecuperarSenhaScreen'
import MainTabs from './MainTabs'
import CalendarioScreen from '../screens/CalendarioScreen'
import PerfilScreen from '../screens/PerfilScreen'
import InformacoesPerfilScreen from '../screens/InformacoesPerfilScreen'
import NotificacoesScreen from '../screens/NotificacoesScreen'
import ConfigNotificacoesScreen from '../screens/ConfigNotificacoesScreen'
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen'

const Stack = createNativeStackNavigator()

/**
 * ======================================================================
 *  ROTAS DO APLICATIVO  ->  É AQUI que você adiciona/edita telas.
 * ======================================================================
 * Para criar uma tela nova:
 *   1. crie o arquivo em src/screens/NovaTela.js
 *   2. importe aqui em cima
 *   3. adicione <Stack.Screen name="NovaTela" component={NovaTela} />
 *   4. navegue até ela de qualquer lugar com: navigation.navigate('NovaTela')
 *
 * initialRouteName vem do App.js (login salvo -> começa em "MainTabs";
 * sem login salvo -> começa em "Login").
 * ======================================================================
 */
export default function RootNavigator({ initialRouteName }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CriarConta" component={CriarContaScreen} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Calendario" component={CalendarioScreen} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="InformacoesPerfil" component={InformacoesPerfilScreen} />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      <Stack.Screen name="ConfigNotificacoes" component={ConfigNotificacoesScreen} />
    </Stack.Navigator>
  )
}

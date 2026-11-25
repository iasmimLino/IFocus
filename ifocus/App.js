import 'react-native-gesture-handler'
import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import RootNavigator from './src/navigation/RootNavigator'
import { colors } from './src/theme/colors'

export default function App() {
  const [pronto, setPronto] = useState(false)
  const [rotaInicial, setRotaInicial] = useState('Login')

  // Verifica se já existe um login salvo (token) para pular a tela de
  // Login ao reabrir o app — ver src/api/authApi.js (login/logout).
  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      setRotaInicial(token ? 'MainTabs' : 'Login')
      setPronto(true)
    })
  }, [])

  if (!pronto) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.dark2} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <RootNavigator initialRouteName={rotaInicial} />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

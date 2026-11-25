import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import SideMenu from './SideMenu'
import { logout } from '../api/authApi'

// Sobe a cadeia de navegadores aninhados (Tab -> Stack) até achar o
// navigator raiz, que é quem realmente controla a tela "Login"/"MainTabs".
// Necessário porque o Header é usado tanto dentro das abas quanto fora.
function navegadorRaiz(navigation) {
  let atual = navigation
  while (atual.getParent()) atual = atual.getParent()
  return atual
}

export default function Header({ navigation, showBack, title, onBellPress, onBackPress }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const rootNavigation = navegadorRaiz(navigation)

  function handleSair() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout()
          rootNavigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        },
      },
    ])
  }

  return (
    <View style={styles.row}>
      {showBack ? (
        <TouchableOpacity onPress={onBackPress || (() => navigation.goBack())} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setMenuAberto(true)} hitSlop={10}>
          <Ionicons name="menu" size={26} color={colors.dark} />
        </TouchableOpacity>
      )}
      {title ? <Text style={styles.title}>{title}</Text> : <View />}
      <TouchableOpacity onPress={onBellPress || (() => rootNavigation.navigate('Notificacoes'))} hitSlop={10}>
        <Ionicons name="notifications-outline" size={24} color={colors.dark} />
      </TouchableOpacity>

      <SideMenu
        visible={menuAberto}
        onClose={() => setMenuAberto(false)}
        navigation={rootNavigation}
        onLogout={handleSair}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: colors.bg,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.dark },
})

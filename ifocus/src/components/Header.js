import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

export default function Header({
  navigation,
  showBack,
  title,
  onBellPress,
  onBackPress,
  compact = false,
  backgroundColor = colors.bg,
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const insets = useSafeAreaInsets()
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
    <View style={[
      styles.row,
      compact && styles.compactRow,
      compact && { paddingTop: Math.max(8, insets.top + 4) },
      { backgroundColor },
    ]}>
      {showBack ? (
        <TouchableOpacity
          style={compact ? styles.compactButton : undefined}
          onPress={onBackPress || (() => navigation.goBack())}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={compact ? 19 : 24} color={colors.dark} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={compact ? styles.compactButton : undefined}
          onPress={() => setMenuAberto(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Ionicons name="menu" size={compact ? 20 : 26} color={colors.dark} />
        </TouchableOpacity>
      )}
      {title ? <Text style={compact ? styles.compactTitle : undefined} numberOfLines={1}>{title}</Text> : <View style={compact ? styles.titleSpacer : undefined} />}
      <TouchableOpacity
        style={compact ? styles.compactButton : undefined}
        onPress={onBellPress || (() => rootNavigation.navigate('Notificacoes'))}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Notificações"
      >
        <Ionicons name="notifications-outline" size={compact ? 18 : 24} color={colors.dark} />
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
  compactRow: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  compactButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 1 },
  titleSpacer: { flex: 1 },
  compactTitle: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', marginHorizontal: 8 },
})

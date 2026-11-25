import { useEffect, useState } from 'react'
import { Alert, View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { buscarPreferencias, listarNotificacoes, salvarPreferencias } from '../api/notificationsApi'
import Header from '../components/Header'
import { colors } from '../theme/colors'

export default function NotificacoesScreen({ navigation }) {
  const [lista, setLista] = useState([])
  const [prefs, setPrefs] = useState({ naoPerturbe: true })

  useEffect(() => {
    Promise.all([listarNotificacoes(), buscarPreferencias()])
      .then(([notificacoes, preferencias]) => {
        setLista(notificacoes)
        setPrefs({ naoPerturbe: true, ...preferencias })
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar as notificações.'))
  }, [])

  async function alternarNaoPerturbe() {
    const anteriores = prefs
    const atualizadas = { ...prefs, naoPerturbe: !prefs.naoPerturbe }
    setPrefs(atualizadas)
    try {
      await salvarPreferencias(atualizadas)
    } catch {
      setPrefs(anteriores)
      Alert.alert('Erro', 'Não foi possível salvar essa configuração.')
    }
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Notificações</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ConfigNotificacoes')}>
              <Text>⚙</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.switchInline}>
            <Text style={{ fontSize: 13 }}>Não perturbe</Text>
            <Switch value={prefs.naoPerturbe} onValueChange={alternarNaoPerturbe} />
          </View>
        </View>

        {lista.map((n) => (
          <View style={styles.row} key={n.id}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{n.titulo}</Text>
              <Text style={styles.muted}>{n.quando}</Text>
            </View>
          </View>
        ))}
        {lista.length > 0 && <Text style={[styles.muted, { textAlign: 'center', marginTop: 8 }]}>Fim das notificações</Text>}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  switchInline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.dark2, marginTop: 6 },
  itemTitle: { fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, fontSize: 12 },
})

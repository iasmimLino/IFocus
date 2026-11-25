import { useEffect, useState } from 'react'
import { Alert, View, Text, Switch, StyleSheet, ScrollView } from 'react-native'
import { buscarPreferencias, salvarPreferencias } from '../api/notificationsApi'
import Header from '../components/Header'
import { colors } from '../theme/colors'

const OPCOES = [
  'Receber notificações',
  'Notificações push',
  'Notificações por email',
  'Notificações no app (interna)',
  'Mensagens',
  'Atualizações de conta',
  'Lembretes',
  'Alertas de Segurança',
  'Silenciar notificações à noite',
  'Som de notificação',
  'Vibração',
  'Notificar com tela bloqueada',
]

const PADRAO = Object.fromEntries(OPCOES.map((opcao) => [opcao, true]))

export default function ConfigNotificacoesScreen({ navigation }) {
  const [prefs, setPrefs] = useState(PADRAO)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarPreferencias()
      .then((salvas) => setPrefs({ ...PADRAO, ...salvas }))
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar as preferências.'))
      .finally(() => setCarregando(false))
  }, [])

  async function toggle(op) {
    const next = { ...prefs, [op]: !prefs[op] }
    setPrefs(next)
    try {
      await salvarPreferencias(next)
    } catch {
      setPrefs(prefs)
      Alert.alert('Erro', 'Não foi possível salvar esta preferência.')
    }
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configurações de Notificações</Text>
        {carregando && <Text style={styles.loading}>Carregando preferências...</Text>}
        {OPCOES.map((op) => (
          <View style={styles.row} key={op}>
            <Text style={styles.rowText}>{op}</Text>
            <Switch value={prefs[op]} onValueChange={() => toggle(op)} disabled={carregando} />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text },
  loading: { color: colors.muted, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  rowText: { fontSize: 14, color: colors.text, flex: 1, marginRight: 10 },
})

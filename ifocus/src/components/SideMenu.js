import { useContext, useEffect, useState } from 'react'
import { Alert, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import { buscarPerfil } from '../api/profileApi'
import { TutorialContext } from './TutorialGuide'

function identificarTurma(perfil) {
  const anoSerie = perfil?.anoSerie?.trim().replace(/\s*ano$/i, '')
  const curso = perfil?.curso?.trim()
  const cursoCurto = /^informática$/i.test(curso || '') ? 'Info' : curso

  return [anoSerie, cursoCurto].filter(Boolean).join(' ') || 'Turma não informada'
}

const ITENS = [
  { label: 'Histórico', icone: 'time-outline', route: 'historico' },
  { label: 'Tutorial', icone: 'help-circle', route: 'tutorial' },
  { label: 'Suporte', icone: 'chatbox-outline', route: 'indisponivel' },
  { label: 'Acessibilidade', icone: 'accessibility-outline', route: 'indisponivel' },
  { label: 'Configurações', icone: 'settings-sharp', route: 'Configuracoes' },
]

export default function SideMenu({ visible, onClose, navigation, onLogout }) {
  const [perfil, setPerfil] = useState(null)
  const tutorial = useContext(TutorialContext)
  const larguraPainel = Math.min(310, Math.max(250, Dimensions.get('window').width * 0.64))

  useEffect(() => {
    if (!visible) return undefined

    let ativo = true
    buscarPerfil()
      .then((usuario) => {
        if (ativo) setPerfil(usuario)
      })
      .catch(() => {})

    return () => { ativo = false }
  }, [visible])

  function irPara(item) {
    onClose()
    if (item.route === 'tutorial') {
      if (tutorial?.iniciarTutorial) {
        tutorial.iniciarTutorial()
      } else {
        navigation.navigate('MainTabs', {
          screen: 'Painel',
          iniciarTutorial: true,
        })
      }
    } else if (item.route === 'historico') {
      navigation.navigate('MainTabs', { screen: 'Análises' })
    } else if (item.route === 'indisponivel') {
      Alert.alert(item.label, 'Esta seção ainda não está disponível.')
    } else {
      navigation.navigate(item.route)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar menu" />
        <View style={[styles.panel, { width: larguraPainel }]}>
          <Image
            source={require('../../assets/dandelion-banner.jpg')}
            style={styles.banner}
            resizeMode="cover"
            accessibilityLabel="Campo verde com dentes-de-leão"
          />

          <ScrollView contentContainerStyle={styles.panelContent}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={46} color={colors.bg} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {perfil?.nomeCompleto?.trim() || 'Usuário'}
                </Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>Estudante</Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>{identificarTurma(perfil)}</Text>
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => {
                    onClose()
                    navigation.navigate('Perfil')
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.profileButtonText}>Perfil</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.items}>
              {ITENS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.item}
                  onPress={() => irPara(item)}
                  accessibilityRole="button"
                >
                  <Ionicons name={item.icone} size={16} color={colors.dark} style={styles.itemIcon} />
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.logout}
            onPress={() => {
              onClose()
              onLogout()
            }}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={16} color={colors.muted} style={styles.itemIcon} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.48)' },
  panel: { height: '100%', backgroundColor: '#f3f7e9' },
  banner: { width: '100%', height: 164 },
  panelContent: { flexGrow: 1, paddingBottom: 18 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 34, marginHorizontal: 24 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  profileDetails: { flex: 1, minWidth: 0 },
  profileName: { color: colors.dark, fontSize: 16, lineHeight: 19, fontWeight: '700' },
  profileSubtitle: { color: '#4f5b4b', fontSize: 10, lineHeight: 13, fontWeight: '600' },
  profileButton: { width: 96, height: 24, borderRadius: 8, backgroundColor: colors.dark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 3 },
  profileButtonText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  items: { marginTop: 31, paddingHorizontal: 31 },
  item: { minHeight: 39, flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 17, marginRight: 11 },
  itemText: { color: colors.dark, fontSize: 12, fontWeight: '500' },
  logout: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(31,56,23,0.14)', paddingHorizontal: 31 },
  logoutText: { color: colors.muted, fontSize: 12, fontWeight: '500' },
})

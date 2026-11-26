import { useContext, useEffect, useState } from 'react'
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { buscarPerfil } from '../api/profileApi'
import { TutorialContext } from './TutorialGuide'
import BrandSymbol from '../../assets/Mini logo — Foca.svg'

const mascote = require('../../assets/Foca Acenando.png')

function identificarTurma(perfil) {
  const anoSerie = perfil?.anoSerie?.trim().replace(/\s*ano$/i, '')
  const curso = perfil?.curso?.trim()
  const cursoCurto = /^informática$/i.test(curso || '') ? 'Info' : curso

  return [anoSerie, cursoCurto].filter(Boolean).join(' ') || 'Turma não informada'
}

const ITENS = [
  { label: 'Configurações', detalhe: 'Preferências', icone: 'settings-sharp', route: 'Configuracoes' },
  { label: 'Tutorial', detalhe: 'Como usar', icone: 'help-circle', route: 'tutorial' },
  { label: 'Suporte', detalhe: 'Fale conosco', icone: 'chatbox-outline', route: 'indisponivel' },
  { label: 'Acessibilidade', detalhe: 'Leitura e cores', icone: 'accessibility-outline', route: 'indisponivel' },
  { label: 'Histórico', detalhe: 'Ver análises', icone: 'time-outline', route: 'historico' },
]

export default function SideMenu({ visible, onClose, navigation, onLogout }) {
  const [perfil, setPerfil] = useState(null)
  const [erroPerfil, setErroPerfil] = useState(false)
  const tutorial = useContext(TutorialContext)
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const larguraPainel = Math.min(370, Math.max(280, width * 0.8))

  useEffect(() => {
    if (!visible) return undefined

    let ativo = true
    setErroPerfil(false)
    buscarPerfil()
      .then((usuario) => {
        if (ativo) setPerfil(usuario)
      })
      .catch(() => {
        if (ativo) setErroPerfil(true)
      })

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar menu" />
        <View style={[styles.panel, { width: larguraPainel, paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
          <View style={styles.brandRow}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <BrandSymbol width={22} height={22} />
              </View>
              <Text style={styles.brandName}><Text style={styles.brandAccent}>i</Text>Focus</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
            >
              <Ionicons name="close" size={19} color={colors.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.profileCard}
              onPress={() => {
                onClose()
                navigation.navigate('Perfil')
              }}
              accessibilityRole="button"
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.dark} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {erroPerfil ? 'Perfil indisponível' : perfil?.nomeCompleto?.trim() || 'Carregando perfil...'}
                </Text>
                <Text style={styles.profileSubtitle} numberOfLines={1}>
                  {perfil ? `Estudante · ${identificarTurma(perfil)}` : erroPerfil ? 'Não foi possível carregar os dados' : ' '}
                </Text>
                <Text style={styles.profileLink}>Ver meu perfil</Text>
              </View>
              <View style={styles.profileArrow}>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>ATALHOS</Text>
            <View style={styles.items}>
              {ITENS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.item}
                  onPress={() => irPara(item)}
                  accessibilityRole="button"
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icone} size={17} color={colors.dark} />
                  </View>
                  <Text style={styles.itemText} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.itemDetail} numberOfLines={1}>{item.detalhe}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.greeting}>
              <Image source={mascote} style={styles.greetingMascot} resizeMode="contain" />
              <View style={styles.greetingCopy}>
                <Text style={styles.greetingTitle}>Bons estudos!</Text>
                <Text style={styles.greetingSubtitle}>iFocus · versão 1.0</Text>
              </View>
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
            <Ionicons name="log-out-outline" size={17} color={colors.muted} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.42)' },
  panel: {
    height: '100%',
    backgroundColor: '#F4F8EB',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
    elevation: 12,
  },
  brandRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 26, height: 26, borderRadius: 7, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.dark, fontSize: 14, fontWeight: '700' },
  brandAccent: { color: '#31A84A' },
  closeButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 1 },
  panelContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16 },
  profileCard: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.dark,
    elevation: 4,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ACD095', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  profileDetails: { flex: 1, minWidth: 0 },
  profileName: { color: colors.white, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  profileSubtitle: { color: '#D5E4C8', fontSize: 9, lineHeight: 13 },
  profileLink: { color: '#D5E4C8', fontSize: 9, lineHeight: 12 },
  profileArrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  sectionTitle: { color: '#4E594C', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginTop: 19, marginBottom: 10 },
  items: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  item: {
    width: '48.5%',
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E1EBD8',
  },
  itemIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#E4EED9', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  itemText: { color: '#303530', fontSize: 10, lineHeight: 13, fontWeight: '600' },
  itemDetail: { color: '#727A70', fontSize: 8, lineHeight: 11, marginTop: 1 },
  greeting: { minHeight: 62, flexDirection: 'row', alignItems: 'center', marginTop: 28, paddingHorizontal: 10, borderRadius: 15, backgroundColor: '#E4EED9' },
  greetingMascot: { width: 42, height: 50, marginRight: 8 },
  greetingCopy: { flex: 1 },
  greetingTitle: { color: colors.dark, fontSize: 10, fontWeight: '700' },
  greetingSubtitle: { color: colors.muted, fontSize: 8, marginTop: 3 },
  logout: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(31,56,23,0.14)' },
  logoutText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
})

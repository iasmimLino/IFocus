import { useState } from 'react'
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Brand from '../../Brand.svg'

const mascote = require('../../assets/Foca Confusa.png')

export default function RecuperarSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const alturaHero = Math.min(260, Math.max(220, height * 0.29))

  function informarIndisponibilidade() {
    Alert.alert('Recuperação indisponível', 'Nenhum e-mail foi enviado porque a recuperação de senha ainda não está disponível.')
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { height: alturaHero, paddingTop: Math.max(42, insets.top + 22) }]}>
          <View style={styles.brandRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={20} color="#1C3F1E" />
            </TouchableOpacity>
            <Brand width={103} height={30} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Esqueceu a{'\n'}
              <Text style={styles.accent}>senha?</Text>
            </Text>
            <Text style={styles.heroSub}>Sem problemas! Vamos te{'\n'}ajudar a recuperar.</Text>
          </View>
          <View style={styles.mascotCircle}>
            <Image source={mascote} style={styles.mascot} resizeMode="contain" />
          </View>
        </View>

        <View style={[styles.panel, { paddingBottom: Math.max(22, insets.bottom + 14) }]}>
          <Text style={styles.panelTitle}>Recuperar acesso</Text>
          <Text style={styles.panelSub}>Informe o e-mail da sua conta para continuar.</Text>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder="Insira seu e-mail"
              placeholderTextColor="#8A9D88"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={informarIndisponibilidade}>
            <Ionicons name="mail-outline" size={19} color="#B5D99A" />
            <Text style={styles.primaryButtonText}>Enviar link</Text>
          </TouchableOpacity>

          <View style={styles.notice} accessibilityRole="alert">
            <Ionicons name="shield-checkmark-outline" size={17} color="#1C3F1E" />
            <Text style={styles.noticeText}>
              A recuperação de senha ainda não está disponível. Nenhum e-mail foi enviado.
            </Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Lembrou a senha? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F8EB' },
  content: { flexGrow: 1 },
  hero: { backgroundColor: '#F4F8EB', paddingHorizontal: 32, position: 'relative', overflow: 'hidden' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { marginTop: 10, zIndex: 1, width: '67%' },
  heroTitle: { color: '#111711', fontSize: 25, lineHeight: 28, fontWeight: '800', letterSpacing: -0.8 },
  accent: { color: '#31A84A' },
  heroSub: { color: '#6C706C', fontSize: 12, lineHeight: 18, marginTop: 7 },
  mascotCircle: { position: 'absolute', right: -17, bottom: -17, width: '44%', aspectRatio: 1, borderRadius: 999, backgroundColor: '#B5D99A', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  mascot: { width: '100%', height: '108%', marginBottom: -3 },
  panel: { flexGrow: 1, backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -25, paddingTop: 24, paddingHorizontal: 22 },
  panelTitle: { color: '#1C3F1E', fontSize: 16, fontWeight: '700' },
  panelSub: { color: '#6C706C', fontSize: 11, lineHeight: 16, marginTop: 3, marginBottom: 12 },
  label: { color: '#303530', fontSize: 11, fontWeight: '600', marginBottom: 5 },
  field: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F8EB', borderColor: '#DDE9CE', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  input: { flex: 1, color: '#283728', fontSize: 12, paddingVertical: 10 },
  primaryButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: '#1C3F1E' },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E6F0D8', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  noticeText: { flex: 1, color: '#1C3F1E', fontSize: 10, lineHeight: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  footerText: { color: '#747874', fontSize: 11 },
  footerLink: { color: '#1C3F1E', fontSize: 11, fontWeight: '700' },
})

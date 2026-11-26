import { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { login, loginAdmin } from '../api/authApi'
import Brand from '../../Brand.svg'

const mascote = require('../../assets/Foca Acenando.png')

export default function LoginScreen({ navigation }) {
  const [emailOuCpf, setEmailOuCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('aluno')
  const [lembrar, setLembrar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const alturaHero = Math.min(370, Math.max(310, height * 0.42))

  async function handleEntrar() {
    setErro('')
    setCarregando(true)
    try {
      if (perfil === 'admin') {
        await loginAdmin(emailOuCpf, senha)
      } else {
        await login(emailOuCpf, senha)
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    } catch (e) {
      setErro(e.message || 'Não foi possível entrar. Confira seus dados.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { height: alturaHero, paddingTop: Math.max(48, insets.top + 28) }]}>
          <View style={styles.heroCopy}>
            <View style={styles.brandRow}>
              <Brand width={103} height={30} />
            </View>
            <Text style={styles.heroTitle}>
              Foco no que{'\n'}
              <Text style={styles.accent}>importa.</Text>
            </Text>
            <Text style={styles.heroSub}>Organize trabalhos,{'\n'}provas e estudos.</Text>
            <View style={styles.benefits}>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}><Ionicons name="timer-outline" size={15} color="#234B24" /></View>
                <Text style={styles.benefitText}><Text style={styles.benefitStrong}>Foco</Text> com Pomodoro</Text>
              </View>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}><Ionicons name="calendar-outline" size={15} color="#234B24" /></View>
                <Text style={styles.benefitText}><Text style={styles.benefitStrong}>Provas</Text> organizadas</Text>
              </View>
              <View style={styles.benefitRow}>
                <View style={styles.benefitIcon}><Ionicons name="bar-chart-outline" size={15} color="#234B24" /></View>
                <Text style={styles.benefitText}><Text style={styles.benefitStrong}>Progresso</Text> semanal</Text>
              </View>
            </View>
          </View>
          <View style={styles.mascotCircle}>
            <Image source={mascote} style={styles.mascot} resizeMode="contain" />
          </View>
        </View>

        <View style={[styles.panel, { paddingBottom: Math.max(22, insets.bottom + 14) }]}>
          <Text style={styles.panelTitle}>Bem-vindo de volta</Text>
          <Text style={styles.panelSub}>Entre para continuar sua rotina de estudos.</Text>

          <View style={styles.profileSelector} accessibilityRole="radiogroup">
            <TouchableOpacity
              style={[styles.profileOption, perfil === 'aluno' && styles.profileOptionSelected]}
              onPress={() => setPerfil('aluno')}
              disabled={carregando}
              accessibilityRole="radio"
              accessibilityState={{ checked: perfil === 'aluno' }}
            >
              <Ionicons name="school-outline" size={14} color={perfil === 'aluno' ? '#fff' : '#687168'} />
              <Text style={[styles.profileOptionText, perfil === 'aluno' && styles.profileOptionTextSelected]}>Aluno</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profileOption, perfil === 'admin' && styles.profileOptionSelected]}
              onPress={() => setPerfil('admin')}
              disabled={carregando}
              accessibilityRole="radio"
              accessibilityState={{ checked: perfil === 'admin' }}
            >
              <Ionicons name="shield-checkmark-outline" size={14} color={perfil === 'admin' ? '#fff' : '#687168'} />
              <Text style={[styles.profileOptionText, perfil === 'admin' && styles.profileOptionTextSelected]}>Administrador</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{perfil === 'admin' ? 'Login' : 'E-mail'}</Text>
          <View style={styles.field}>
            <Ionicons name={perfil === 'admin' ? 'person-outline' : 'mail-outline'} size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder={perfil === 'admin' ? 'Insira seu login de administrador' : 'Insira seu e-mail ou CPF'}
              placeholderTextColor="#8A9D88"
              value={emailOuCpf}
              onChangeText={setEmailOuCpf}
              autoCapitalize="none"
              keyboardType={perfil === 'admin' ? 'default' : 'email-address'}
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder="Insira sua senha"
              placeholderTextColor="#8A9D88"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
            />
            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              accessibilityRole="button"
              accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Ionicons name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'} size={19} color="#8A9D88" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <Pressable style={styles.rememberRow} onPress={() => setLembrar(!lembrar)} accessibilityRole="checkbox" accessibilityState={{ checked: lembrar }}>
              <View style={[styles.checkbox, lembrar && styles.checkboxChecked]}>
                {lembrar && <Ionicons name="checkmark" size={15} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Lembrar meus dados</Text>
            </Pressable>
            <TouchableOpacity onPress={() => navigation.navigate('RecuperarSenha')}>
              <Text style={styles.forgotLink}>Esqueci a senha</Text>
            </TouchableOpacity>
          </View>

          {!!erro && <Text style={styles.error}>{erro}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleEntrar} disabled={carregando}>
            <Text style={styles.primaryButtonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
            {!carregando && <Ionicons name="arrow-forward-circle" size={22} color="#B5D99A" />}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CriarConta')}>
              <Text style={styles.footerLink}>Criar conta</Text>
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
  hero: { backgroundColor: '#F4F8EB', paddingHorizontal: 38, position: 'relative', overflow: 'hidden' },
  heroCopy: { zIndex: 1, width: '68%' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  heroTitle: { color: '#1C3F1E', fontSize: 26, lineHeight: 29, fontWeight: '800', letterSpacing: -0.8 },
  accent: { color: '#31A84A' },
  heroSub: { color: '#6C706C', fontSize: 13, lineHeight: 19, marginTop: 7 },
  benefits: { marginTop: 13, gap: 8 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#E4EED9', alignItems: 'center', justifyContent: 'center' },
  benefitText: { color: '#606660', fontSize: 10.5 },
  benefitStrong: { color: '#2A332A', fontWeight: '700' },
  mascotCircle: { position: 'absolute', right: -14, bottom: -7, width: '48%', aspectRatio: 1, borderRadius: 999, backgroundColor: '#B5D99A', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  mascot: { width: '100%', height: '108%', marginBottom: -3 },
  panel: { flexGrow: 1, backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -25, paddingTop: 24, paddingHorizontal: 22 },
  panelTitle: { color: '#1C3F1E', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  panelSub: { color: '#6C706C', fontSize: 12, marginTop: 2, marginBottom: 16 },
  profileSelector: { flexDirection: 'row', gap: 5, padding: 3, backgroundColor: '#F4F8EB', borderColor: '#DDE9CE', borderWidth: 1, borderRadius: 12, marginBottom: 14 },
  profileOption: { flex: 1, minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 5 },
  profileOptionSelected: { backgroundColor: '#1C3F1E' },
  profileOptionText: { color: '#687168', fontSize: 10, fontWeight: '600' },
  profileOptionTextSelected: { color: '#fff' },
  label: { color: '#303530', fontSize: 11, fontWeight: '600', marginBottom: 5 },
  field: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F8EB', borderColor: '#DDE9CE', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 13 },
  input: { flex: 1, color: '#283728', fontSize: 12, paddingVertical: 10 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1, marginBottom: 14 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#D5E4C8', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#1C3F1E', borderColor: '#1C3F1E' },
  rememberText: { color: '#3F453F', fontSize: 11 },
  forgotLink: { color: '#1C3F1E', textDecorationLine: 'underline', fontSize: 11, fontWeight: '600' },
  error: { color: '#B42318', fontSize: 12, marginBottom: 10 },
  primaryButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: '#1C3F1E', elevation: 4, shadowColor: '#1C3F1E', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 13 },
  footerText: { color: '#747874', fontSize: 11 },
  footerLink: { color: '#1C3F1E', fontSize: 11, fontWeight: '700' },
})

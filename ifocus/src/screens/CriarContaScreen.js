import { useState } from 'react'
import {
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
import { register } from '../api/authApi'
import Brand from '../../Brand.svg'

const mascote = require('../../assets/Foca Acenando.png')

export default function CriarContaScreen({ navigation }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const alturaHero = Math.min(236, Math.max(190, height * 0.30))

  const regrasSenha = {
    tamanhoMinimo: senha.length >= 8,
    temNumero: /[0-9]/.test(senha),
  }
  const senhaEhValida = Object.values(regrasSenha).every(Boolean)
  const senhasCoincidem = senha.length > 0 && senha === confirmarSenha

  async function realizarCadastro() {
    setErro('')

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Por favor, preencha todos os campos.')
      return
    }

    if (!senhaEhValida) {
      setErro('A senha deve ter pelo menos 8 caracteres e 1 número.')
      return
    }

    if (!senhasCoincidem) {
      setErro('As senhas digitadas não coincidem.')
      return
    }

    setCarregando(true)
    try {
      await register({ nomeCompleto: nome, email, senha })
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    } catch (e) {
      setErro(e.message || 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { height: alturaHero, paddingTop: Math.max(28, insets.top + 10) }]}>
          <View style={styles.brandRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={20} color="#1C3F1E" />
            </TouchableOpacity>
            <Brand width={103} height={30} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              Crie sua{'\n'}
              <Text style={styles.accent}>conta.</Text>
            </Text>
            <Text style={styles.heroSub}>Leva menos de um minuto.</Text>
          </View>
          <View style={styles.mascotCircle}>
            <Image source={mascote} style={styles.mascot} resizeMode="contain" />
          </View>
        </View>

        <View style={[styles.panel, { paddingBottom: Math.max(22, insets.bottom + 14) }]}>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.field}>
            <Ionicons name="person-outline" size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder="Insira o seu nome completo"
              placeholderTextColor="#8A9D88"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

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

          <Text style={styles.label}>Senha</Text>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha"
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

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color="#8A9D88" />
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#8A9D88"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarConfirmarSenha}
            />
            <TouchableOpacity
              onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              accessibilityRole="button"
              accessibilityLabel={mostrarConfirmarSenha ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
            >
              <Ionicons name={mostrarConfirmarSenha ? 'eye-outline' : 'eye-off-outline'} size={19} color="#8A9D88" />
            </TouchableOpacity>
          </View>

          {confirmarSenha.length > 0 && (
            <Text style={[styles.passwordFeedback, { color: senhasCoincidem ? '#31A84A' : '#B42318' }]}>
              {senhasCoincidem ? '✓ As senhas coincidem' : '✕ As senhas não coincidem'}
            </Text>
          )}

          <View style={styles.termsRow}>
            <TouchableOpacity
              style={styles.termsCheckboxTarget}
              onPress={() => setAceitouTermos(!aceitouTermos)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: aceitouTermos }}
              accessibilityLabel="Aceito os termos de uso e a política de privacidade"
            >
              <View style={[styles.termsCheckbox, aceitouTermos && styles.termsCheckboxChecked]}>
                {aceitouTermos && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
            <View style={styles.termsCopy}>
              <Text style={styles.termsText}>
                Li e aceito os{' '}
                <Text style={styles.termsLink}>Termos de uso</Text>
                {' e a '}
                <Text style={styles.termsLink}>Política de privacidade</Text>.
              </Text>
            </View>
          </View>

          {!!erro && <Text style={styles.error}>{erro}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={realizarCadastro} disabled={carregando}>
            <Text style={styles.primaryButtonText}>{carregando ? 'Criando conta...' : 'Criar conta'}</Text>
            {!carregando && <Ionicons name="arrow-forward-circle" size={22} color="#B5D99A" />}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já tem conta? </Text>
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
  heroCopy: { marginTop: 8, zIndex: 1, width: '64%' },
  heroTitle: { color: '#1C3F1E', fontSize: 26, lineHeight: 29, fontWeight: '800', letterSpacing: -0.8 },
  accent: { color: '#31A84A' },
  heroSub: { color: '#6C706C', fontSize: 12, marginTop: 6 },
  mascotCircle: { position: 'absolute', right: -8, bottom: 16, width: '38%', maxWidth: 130, aspectRatio: 1, borderRadius: 999, backgroundColor: '#B5D99A', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  mascot: { width: '100%', height: '100%' },
  panel: { flexGrow: 1, backgroundColor: '#fff', borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -14, paddingTop: 20, paddingHorizontal: 22 },
  label: { color: '#303530', fontSize: 11, fontWeight: '600', marginBottom: 5 },
  field: { minHeight: 43, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F8EB', borderColor: '#DDE9CE', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  input: { flex: 1, color: '#283728', fontSize: 12, paddingVertical: 10 },
  passwordFeedback: { fontSize: 11, textAlign: 'center', marginBottom: 8 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 1, marginBottom: 10 },
  termsCheckboxTarget: { width: 21, height: 21, alignItems: 'center', justifyContent: 'center' },
  termsCheckbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#D5E4C8', alignItems: 'center', justifyContent: 'center' },
  termsCheckboxChecked: { backgroundColor: '#1C3F1E', borderColor: '#1C3F1E' },
  termsCopy: { flex: 1 },
  termsText: { color: '#606660', fontSize: 11, lineHeight: 16 },
  termsLink: { color: '#1C3F1E', fontWeight: '700', textDecorationLine: 'underline' },
  error: { color: '#B42318', fontSize: 12, textAlign: 'center', marginBottom: 9 },
  primaryButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: '#1C3F1E', marginTop: 1, elevation: 4, shadowColor: '#1C3F1E', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 13 },
  footerText: { color: '#747874', fontSize: 11 },
  footerLink: { color: '#1C3F1E', fontSize: 11, fontWeight: '700' },
})

import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { colors } from '../theme/colors'

export default function ConfiguracoesScreen({ navigation }) {
  const [area, setArea] = useState('inicio')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState({ atual: false, nova: false, confirmar: false })
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleAlterarSenha() {
    setMensagem('')
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setMensagem('Preencha todos os campos.')
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      setMensagem('A nova senha e a confirmação não coincidem.')
      return
    }

    setSalvando(true)
    try {
      const senhaSalva = await SecureStore.getItemAsync('senhaUsuario')
      if (senhaSalva && senhaAtual !== senhaSalva) {
        setMensagem('A senha atual está incorreta.')
        return
      }
      await SecureStore.setItemAsync('senhaUsuario', novaSenha)
      Alert.alert('Sucesso!', 'Sua senha foi alterada com sucesso.')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarNovaSenha('')
      setSenhaVisivel({ atual: false, nova: false, confirmar: false })
    } catch {
      setMensagem('Erro ao verificar ou alterar a senha.')
    } finally {
      setSalvando(false)
    }
  }

  function voltar() {
    if (area === 'senha') {
      setArea('conta')
    } else if (area === 'conta') {
      setArea('inicio')
    } else {
      navigation.goBack()
    }
  }

  function abrirAtualizacaoSenha() {
    setSenhaVisivel({ atual: false, nova: false, confirmar: false })
    setMensagem('')
    setArea('senha')
  }

  function campoSenha(rotulo, valor, aoAlterar, chave) {
    return (
      <View key={chave} style={styles.passwordField}>
        <Text style={styles.fieldLabel}>{rotulo}</Text>
        <View style={styles.passwordInputRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder={rotulo}
            value={valor}
            onChangeText={aoAlterar}
            secureTextEntry={!senhaVisivel[chave]}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setSenhaVisivel((atual) => ({ ...atual, [chave]: !atual[chave] }))}
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel[chave] ? `Ocultar ${rotulo.toLocaleLowerCase('pt-BR')}` : `Mostrar ${rotulo.toLocaleLowerCase('pt-BR')}`}
          >
            <Ionicons name={senhaVisivel[chave] ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} showBack onBackPress={voltar} />
      <ScrollView contentContainerStyle={styles.content}>
        {area === 'inicio' ? (
          <>
            <Text style={styles.title}>Configurações</Text>
            <TouchableOpacity style={styles.option} onPress={() => setArea('conta')} accessibilityRole="button">
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>Configurações da conta</Text>
                <Text style={styles.optionDescription}>Senha e acesso à conta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.dark2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ConfigNotificacoes')} accessibilityRole="button">
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>Notificações</Text>
                <Text style={styles.optionDescription}>Preferências de notificação do aplicativo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.dark2} />
            </TouchableOpacity>
          </>
        ) : area === 'conta' ? (
          <>
            <Text style={styles.title}>Configurações da conta</Text>
            <TouchableOpacity style={styles.option} onPress={abrirAtualizacaoSenha} accessibilityRole="button">
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>Atualizar senha</Text>
                <Text style={styles.optionDescription}>Alterar a senha de acesso</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.dark2} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Atualizar senha</Text>
            {campoSenha('Senha atual', senhaAtual, setSenhaAtual, 'atual')}
            {campoSenha('Nova senha', novaSenha, setNovaSenha, 'nova')}
            {campoSenha('Confirmar nova senha', confirmarNovaSenha, setConfirmarNovaSenha, 'confirmar')}
            {!!mensagem && <Text style={styles.error}>{mensagem}</Text>}
            <TouchableOpacity style={styles.saveButton} onPress={handleAlterarSenha} disabled={salvando}>
              <Text style={styles.saveButtonText}>{salvando ? 'Salvando...' : 'Atualizar senha'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 40 },
  title: { color: colors.dark, fontSize: 20, fontWeight: '700', marginBottom: 20 },
  option: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(31,56,23,0.2)', paddingVertical: 12 },
  optionCopy: { flex: 1, marginRight: 12 },
  optionTitle: { color: colors.dark, fontSize: 15, fontWeight: '700' },
  optionDescription: { color: colors.muted, fontSize: 12, marginTop: 4 },
  fieldLabel: { color: colors.dark, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  passwordField: { marginBottom: 14 },
  passwordInputRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12 },
  passwordInput: { flex: 1, paddingVertical: 12, color: colors.text },
  eyeButton: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#a33', marginBottom: 10, textAlign: 'center' },
  saveButton: { backgroundColor: colors.dark2, borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: colors.white, fontWeight: '700' },
})
import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import Header from '../components/Header'
import { atualizarPerfil, buscarPerfil } from '../api/profileApi'
import { colors } from '../theme/colors'

const CAMPOS_PERFIL = [
  { chave: 'nomeCompleto', rotulo: 'Nome completo', placeholder: 'Seu nome completo' },
  { chave: 'email', rotulo: 'E-mail', placeholder: 'seu@email.com', teclado: 'email-address' },
  { chave: 'pais', rotulo: 'País', placeholder: 'País' },
  { chave: 'cidade', rotulo: 'Cidade/Município', placeholder: 'Cidade ou município' },
  { chave: 'anoSerie', rotulo: 'Ano/série', placeholder: 'Ex.: 3º ano' },
  { chave: 'curso', rotulo: 'Curso/turma', placeholder: 'Ex.: Informática' },
]

export default function InformacoesPerfilScreen({ navigation }) {
  const [perfil, setPerfil] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    let ativo = true
    buscarPerfil()
      .then((dados) => { if (ativo) setPerfil(dados || {}) })
      .catch(() => { if (ativo) setMensagem('Não foi possível carregar os dados do perfil.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  async function handleSalvarPerfil() {
    setMensagem('')
    setSalvando(true)
    try {
      const campos = Object.fromEntries(CAMPOS_PERFIL.map(({ chave }) => [chave, (perfil[chave] || '').trim()]))
      await atualizarPerfil(campos)
      Alert.alert('Sucesso!', 'As informações do perfil foram atualizadas.')
      navigation.goBack()
    } catch {
      setMensagem('Não foi possível salvar as informações do perfil.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Informações do perfil</Text>
        {carregando ? <Text style={styles.loading}>Carregando perfil...</Text> : CAMPOS_PERFIL.map((campo) => (
          <View key={campo.chave}>
            <Text style={styles.fieldLabel}>{campo.rotulo}</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder={campo.placeholder}
                value={perfil[campo.chave] || ''}
                onChangeText={(valor) => setPerfil((atual) => ({ ...atual, [campo.chave]: valor }))}
                autoCapitalize={campo.teclado === 'email-address' ? 'none' : 'words'}
                keyboardType={campo.teclado || 'default'}
              />
            </View>
          </View>
        ))}
        {!!mensagem && <Text style={styles.error}>{mensagem}</Text>}
        <TouchableOpacity style={styles.btnPrimary} onPress={handleSalvarPerfil} disabled={carregando || salvando}>
          <Text style={styles.btnPrimaryText}>{salvando ? 'Salvando...' : 'Salvar perfil'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, backgroundColor: colors.dark, padding: 24 },
  content: { flexGrow: 1, paddingBottom: 24 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  fieldLabel: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  field: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  input: { paddingVertical: 12 },
  error: { color: '#ffb3b3', marginBottom: 10, textAlign: 'center' },
  loading: { color: '#fff', marginBottom: 16 },
  btnPrimary: { backgroundColor: colors.light2, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: colors.dark, fontWeight: '700' },
})
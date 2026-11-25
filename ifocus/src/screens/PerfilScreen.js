import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { File, Paths } from 'expo-file-system'
import Header from '../components/Header'
import { buscarFotoPerfil, buscarPerfil, salvarFotoPerfil } from '../api/profileApi'
import { colors } from '../theme/colors'

function identificarTurma(perfil) {
  const anoSerie = perfil?.anoSerie?.trim().replace(/\s*ano$/i, '')
  const curso = perfil?.curso?.trim()
  const cursoCurto = /^informática$/i.test(curso || '') ? 'Info' : curso
  return [anoSerie, cursoCurto].filter(Boolean).join(' ') || 'Turma não informada'
}

export default function PerfilScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null)
  const [fotoPerfilUri, setFotoPerfilUri] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useFocusEffect(useCallback(() => {
    let ativo = true
    setCarregando(true)
    buscarPerfil()
      .then(async (dados) => {
        if (!ativo) return
        const usuario = dados || {}
        setPerfil(usuario)
        setFotoPerfilUri(await buscarFotoPerfil(usuario))
      })
      .catch(() => { if (ativo) setPerfil({}) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, []))

  async function selecionarFoto() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso às fotos para escolher uma imagem de perfil.')
        return
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      })
      if (resultado.canceled || !resultado.assets?.[0]) return

      const imagem = resultado.assets[0]
      let uri = imagem.uri
      if (Platform.OS !== 'web') {
        const extensaoInformada = imagem.fileName?.split('.').pop()?.toLowerCase() || 'jpg'
        const extensao = /^[a-z0-9]{1,5}$/.test(extensaoInformada) ? extensaoInformada : 'jpg'
        const destino = new File(Paths.document, `perfil-${Date.now()}.${extensao}`)
        new File(imagem.uri).copy(destino)
        uri = destino.uri
      }

      await salvarFotoPerfil(uri, perfil)
      setFotoPerfilUri(uri)
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar ou salvar essa foto.')
    }
  }

  async function removerFoto() {
    try {
      if (fotoPerfilUri && Platform.OS !== 'web') {
        const arquivo = new File(fotoPerfilUri)
        if (arquivo.exists && arquivo.uri.startsWith(Paths.document.uri)) arquivo.delete()
      }
      await salvarFotoPerfil(null, perfil)
      setFotoPerfilUri(null)
    } catch {
      Alert.alert('Erro', 'Não foi possível remover a foto de perfil.')
    }
  }

  const informacoes = [
    { rotulo: 'Nome Completo', valor: perfil?.nomeCompleto },
    { rotulo: 'Email', valor: perfil?.email },
    { rotulo: 'País', valor: perfil?.pais },
    { rotulo: 'Cidade/Município', valor: perfil?.cidade },
    { rotulo: 'Turma', valor: identificarTurma(perfil) },
  ]

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} showBack onBackPress={() => navigation.navigate('MainTabs', { screen: 'Painel' })} title="Perfil" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={selecionarFoto} disabled={carregando || !perfil} accessibilityRole="button" accessibilityLabel="Escolher foto de perfil">
          <View style={styles.avatar}>
            {fotoPerfilUri
              ? <Image source={{ uri: fotoPerfilUri }} style={styles.avatarImage} />
              : <Ionicons name="person" size={58} color={colors.bg} />}
          </View>
          <View style={styles.avatarEdit}>
            <Ionicons name="camera-outline" size={16} color={colors.dark} />
          </View>
          </TouchableOpacity>
          {!!fotoPerfilUri && (
            <TouchableOpacity style={styles.removePhotoButton} onPress={removerFoto} accessibilityRole="button">
              <Text style={styles.removePhotoText}>Remover foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {carregando ? <ActivityIndicator color={colors.dark} style={styles.loading} /> : informacoes.map((info) => (
          <View key={info.rotulo} style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{info.rotulo}</Text>
            <Text style={styles.infoValue}>{info.valor?.trim() || 'Não informado'}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('InformacoesPerfil')}
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={18} color={colors.white} />
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  avatarWrap: { alignSelf: 'center', marginBottom: 15, position: 'relative', alignItems: 'center' },
  avatar: { width: 94, height: 94, borderRadius: 47, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarEdit: { position: 'absolute', right: 0, bottom: 1, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.light },
  removePhotoButton: { marginTop: 5, paddingVertical: 2 },
  removePhotoText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  infoBlock: { marginBottom: 14 },
  infoLabel: { color: colors.dark, fontSize: 16, lineHeight: 19, fontWeight: '700' },
  infoValue: { color: '#5c6259', fontSize: 13, lineHeight: 17, fontWeight: '500', marginLeft: 8 },
  loading: { marginVertical: 30 },
  editButton: { minHeight: 44, borderRadius: 8, backgroundColor: colors.dark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  editButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
})
import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { buscarKanban, adicionarEvento, moverItem, removerItem } from '../api/kanbanApi'
import { listarEventosCronograma, removerEvento } from '../api/eventsApi'
import { listarMaterias } from '../api/materiasApi'
import Header from '../components/Header'
import DatePickerField from '../components/DatePickerField'
import MateriaPicker from '../components/MateriaPicker'
import { colors } from '../theme/colors'

function dataLocalISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export default function KanbanScreen({ navigation }) {
  const [board, setBoard] = useState(null)
  const [eventosCronograma, setEventosCronograma] = useState([])
  const [materias, setMaterias] = useState([])
  const [aberta, setAberta] = useState({ todo: true })
  const [modalVisivel, setModalVisivel] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('Atividade')
  const [data, setData] = useState(() => dataLocalISO(new Date()))
  const [materiaId, setMateriaId] = useState('')
  const [duracaoMinutos, setDuracaoMinutos] = useState('')

  useFocusEffect(useCallback(() => {
    let ativo = true
    Promise.all([buscarKanban(), listarMaterias().catch(() => []), listarEventosCronograma().catch(() => [])])
      .then(([kanban, listaMaterias, listaEventosCronograma]) => {
        if (!ativo) return
        setBoard(kanban)
        setMaterias(listaMaterias)
        setEventosCronograma(listaEventosCronograma)
      })
      .catch(() => { if (ativo) Alert.alert('Erro', 'Não foi possível carregar o Kanban.') })
    return () => { ativo = false }
  }, []))

  async function handleAdicionar() {
    if (!nome.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      Alert.alert('Confira os dados', 'Informe o nome do evento e a data no formato AAAA-MM-DD.')
      return
    }
    if (duracaoMinutos && (!Number.isInteger(Number(duracaoMinutos)) || Number(duracaoMinutos) < 1)) {
      Alert.alert('Confira os dados', 'A duração estimada deve ser um número de minutos maior que zero.')
      return
    }
    const categoriaInicial = board.categorias.find((categoria) => /a fazer|to do/i.test(categoria.nome)) ?? board.categorias[0]
    if (!categoriaInicial) {
      Alert.alert('Erro', 'Não há uma categoria disponível para criar o evento.')
      return
    }
    try {
      setBoard(await adicionarEvento(categoriaInicial.id, {
        nome: nome.trim(),
        tipo,
        data,
        materiaId: materiaId || null,
        duracaoMinutos: duracaoMinutos ? Number(duracaoMinutos) : null,
      }))
      setAberta((estado) => ({ ...estado, [categoriaInicial.id]: true }))
      setModalVisivel(false)
      setNome('')
      setData(dataLocalISO(new Date()))
      setTipo('Atividade')
      setMateriaId('')
      setDuracaoMinutos('')
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o evento.')
    }
  }

  function abrirModal() {
    setNome('')
    setTipo('Atividade')
    setData(dataLocalISO(new Date()))
    setMateriaId('')
    setDuracaoMinutos('')
    setModalVisivel(true)
  }

  function handleMover(item, categoriaId) {
    if (item.id == null) {
      Alert.alert('Não foi possível mover', 'Este item antigo não tem um identificador no servidor.')
      return
    }
    moverItem(item.id, categoriaId).then(setBoard).catch(() => Alert.alert('Erro', 'Não foi possível alterar o estado.'))
  }

  function handleRemover(item) {
    if (item.origem === 'cronograma' && item.eventoId == null) {
      Alert.alert('Não foi possível excluir', 'Este evento não tem referência ao Cronograma.')
      return
    }
    if (item.origem !== 'cronograma' && item.id == null) {
      Alert.alert('Não foi possível excluir', 'Este item antigo não tem um identificador no servidor.')
      return
    }
    const mensagem = item.origem === 'cronograma'
      ? 'Este evento será removido do Cronograma e do Kanban. Deseja continuar?'
      : 'Deseja excluir este evento?'
    Alert.alert('Excluir evento', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item.origem === 'cronograma') {
              await removerEvento(item.eventoId)
              setEventosCronograma((anteriores) => anteriores.filter((evento) => String(evento.id) !== String(item.eventoId)))
            } else {
              setBoard(await removerItem(item.id))
            }
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o evento.')
          }
        },
      },
    ])
  }

  if (!board) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={{ padding: 20 }}>Carregando...</Text>
      </View>
    )
  }

  const categoriaEventos = board.categorias.find((categoria) => /a fazer|to do/i.test(categoria.nome)) ?? board.categorias[0]

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Utilidades</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Método Kanban</Text>
            <TouchableOpacity onPress={abrirModal} accessibilityLabel="Adicionar evento">
              <Ionicons name="add-circle-outline" size={25} color={colors.dark2} />
            </TouchableOpacity>
        </View>
        <Text style={styles.muted}>{board.categorias.length} Categorias</Text>
          <TouchableOpacity style={styles.addEventButton} onPress={abrirModal}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addEventText}>Adicionar evento</Text>
          </TouchableOpacity>

        {board.categorias.map((cat) => {
          const itensCronograma = cat.id === categoriaEventos?.id
            ? eventosCronograma.map((evento) => ({
              ...evento,
              id: `cronograma:${evento.id}`,
              eventoId: evento.id,
              origem: 'cronograma',
              tipo: evento.categoria ?? 'Cronograma',
            }))
            : []
          const itens = [...cat.itens, ...itensCronograma]
          return (
            <View style={styles.col} key={cat.id}>
            <TouchableOpacity
              style={styles.colHeader}
              onPress={() => setAberta((a) => ({ ...a, [cat.id]: !a[cat.id] }))}
            >
              <View>
                <Text style={styles.colHeaderText}>{cat.nome}</Text>
                <Text style={styles.colHeaderSub}>{itens.length} Itens</Text>
              </View>
              <Text style={styles.colHeaderText}>{aberta[cat.id] ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {aberta[cat.id] && (
              <View style={styles.colBody}>
                {itens.map((item, indice) => {
                  const titulo = typeof item === 'string' ? item : item.titulo ?? item.texto
                  const itemAtual = typeof item === 'string' ? { titulo } : item
                  const anterior = board.categorias[board.categorias.findIndex((categoria) => categoria.id === cat.id) - 1]
                  const proxima = board.categorias[board.categorias.findIndex((categoria) => categoria.id === cat.id) + 1]
                  return (
                    <View key={item.id ?? `${cat.id}-${indice}`} style={styles.itemRow}>
                      <View style={styles.itemContent}>
                        <Text style={styles.item}>{titulo}</Text>
                        {!!(itemAtual.tipo || itemAtual.data || itemAtual.materiaId) && (
                          <Text style={styles.itemMeta}>
                            {[
                              itemAtual.tipo,
                              itemAtual.data,
                              materias.find((materia) => String(materia.id ?? materia.materiaId) === String(itemAtual.materiaId))?.nome,
                              itemAtual.duracaoMinutos ? `${itemAtual.duracaoMinutos} min` : null,
                            ].filter(Boolean).join(' · ')}
                          </Text>
                        )}
                      </View>
                      <View style={styles.itemActions}>
                        {itemAtual.origem !== 'cronograma' && anterior && <TouchableOpacity onPress={() => handleMover(itemAtual, anterior.id)} accessibilityLabel={`Mover para ${anterior.nome}`}>
                          <Ionicons name="chevron-back" size={19} color={colors.dark2} />
                        </TouchableOpacity>}
                        {itemAtual.origem !== 'cronograma' && proxima && <TouchableOpacity onPress={() => handleMover(itemAtual, proxima.id)} accessibilityLabel={`Mover para ${proxima.nome}`}>
                          <Ionicons name="chevron-forward" size={19} color={colors.dark2} />
                        </TouchableOpacity>}
                        <TouchableOpacity onPress={() => handleRemover(itemAtual)} accessibilityLabel="Excluir evento">
                          <Ionicons name="trash-outline" size={17} color="#8b3030" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                })}
              </View>
            )}
            </View>
          )
        })}
      </ScrollView>
      <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar evento</Text>
            <TextInput style={styles.input} placeholder="Nome do evento" value={nome} onChangeText={setNome} />
            <Text style={styles.fieldLabel}>Tipo</Text>
            <View style={styles.typeRow}>
              {['Atividade', 'Prova', 'Trabalho'].map((opcao) => (
                <TouchableOpacity key={opcao} style={[styles.typeOption, tipo === opcao && styles.typeOptionActive]} onPress={() => setTipo(opcao)}>
                  <Text style={[styles.typeText, tipo === opcao && styles.typeTextActive]}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <DatePickerField value={data} onChange={setData} />
            <MateriaPicker materias={materias} onMateriasChange={setMaterias} selectedId={materiaId} onSelect={setMateriaId} />
            <TextInput
              style={styles.input}
              placeholder="Tempo estimado (minutos, opcional)"
              value={duracaoMinutos}
              onChangeText={setDuracaoMinutos}
              keyboardType="number-pad"
            />
            <Text style={styles.modalHint}>O evento será criado em “A Fazer”.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisivel(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAdicionar}><Text style={styles.saveText}>Criar evento</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: '600', color: colors.dark },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, marginBottom: 14 },
  col: { marginBottom: 10, borderRadius: 10, overflow: 'hidden' },
  colHeader: { backgroundColor: colors.light, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  colHeaderText: { fontWeight: '700', color: colors.text },
  colHeaderSub: { fontSize: 12, color: colors.muted },
  colBody: { backgroundColor: '#f6f8ef', padding: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed', paddingVertical: 7 },
  itemContent: { flex: 1 },
  item: { fontSize: 13, color: colors.text },
  itemMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  addEventButton: { backgroundColor: colors.dark2, borderRadius: 8, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 },
  addEventText: { color: '#fff', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: colors.bg, borderRadius: 12, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d4ddcc', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, color: colors.text },
  fieldLabel: { color: colors.text, fontWeight: '600', marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeOption: { borderWidth: 1, borderColor: colors.dark2, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 7 },
  typeOptionActive: { backgroundColor: colors.dark2 },
  typeText: { color: colors.dark2, fontSize: 12 },
  typeTextActive: { color: '#fff' },
  modalHint: { color: colors.muted, fontSize: 12, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  cancelButton: { padding: 10 },
  cancelText: { color: colors.muted, fontWeight: '600' },
  saveButton: { backgroundColor: colors.dark2, borderRadius: 7, paddingHorizontal: 14, paddingVertical: 10 },
  saveText: { color: '#fff', fontWeight: '700' },
})

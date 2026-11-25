import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { listarEventos, criarEvento, removerEvento } from '../api/eventsApi'
import { listarMaterias } from '../api/materiasApi'
import { adicionarAoCalendario } from '../api/deviceCalendarApi'
import Header from '../components/Header'
import DatePickerField from '../components/DatePickerField'
import MateriaPicker from '../components/MateriaPicker'
import { colors } from '../theme/colors'

const CATEGORIAS = ['Todos', 'Pessoal', 'Escola']
const CATEGORIAS_FORM = ['Pessoal', 'Escola']

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export default function CronogramaScreen({ navigation }) {
  const [eventos, setEventos] = useState([])
  const [materias, setMaterias] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date())
  const [filtro, setFiltro] = useState('Todos')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaForm, setCategoriaForm] = useState('Pessoal')
  const [materiaId, setMateriaId] = useState('')
  const [dataForm, setDataForm] = useState(dataISO(new Date()))
  const [inicio, setInicio] = useState('19:00')
  const [fim, setFim] = useState('20:00')
  const [notificar, setNotificar] = useState(true)
  const salvandoRef = useRef(false)

  const chaveData = dataISO(dataSelecionada)

  useFocusEffect(useCallback(() => {
    let ativo = true
    setCarregando(true)
    listarEventos(chaveData)
      .then((listaEventos) => {
        if (!ativo) return
        setEventos(listaEventos)
      })
      .catch(() => {
        if (ativo) Alert.alert('Erro', 'Não foi possível carregar os compromissos.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
    }, [chaveData]))

  useFocusEffect(useCallback(() => {
    let ativo = true
    listarMaterias()
      .then((lista) => { if (ativo) setMaterias(lista) })
      .catch(() => { if (ativo) setMaterias([]) })
    return () => { ativo = false }
  }, []))

  function abrirModal() {
    setNome('')
    setDescricao('')
    setCategoriaForm('Pessoal')
    setMateriaId('')
    setDataForm(chaveData)
    setInicio('19:00')
    setFim('20:00')
    setNotificar(true)
    setModalVisivel(true)
  }

  function fecharModal() {
    setModalVisivel(false)
  }

  function horaValida(hora) {
    if (!/^\d{2}:\d{2}$/.test(hora)) return false
    const [horas, minutos] = hora.split(':').map(Number)
    return horas < 24 && minutos < 60
  }

  function dataValida(data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
    const [ano, mes, dia] = data.split('-').map(Number)
    const dataVerificada = new Date(ano, mes - 1, dia)
    return dataVerificada.getFullYear() === ano && dataVerificada.getMonth() === mes - 1 && dataVerificada.getDate() === dia
  }

  const formularioValido = Boolean(nome.trim())
    && dataValida(dataForm)
    && horaValida(inicio)
    && horaValida(fim)
    && fim > inicio

  async function handleCriar() {
    if (salvandoRef.current) return
    if (!formularioValido) {
      Alert.alert('Confira os dados', 'Informe o nome, uma data válida (AAAA-MM-DD) e horários válidos (HH:MM).')
      return
    }
    const compromisso = {
      categoria: categoriaForm,
      titulo: nome.trim(),
      descricao: descricao.trim(),
      materiaId: materiaId || null,
      notificar,
      data: dataForm,
      inicio,
      fim,
    }
    try {
      salvandoRef.current = true
      setSalvando(true)
      const resposta = await criarEvento(compromisso)
      const salvo = { ...compromisso, ...resposta, id: resposta?.id ?? `local-${Date.now()}` }
      let listaAtualizada = null
      try {
        listaAtualizada = await listarEventos(dataForm)
      } catch {
        listaAtualizada = null
      }
      if (listaAtualizada) {
        setEventos(listaAtualizada)
      } else if (dataForm === chaveData) {
        setEventos((anteriores) => [...anteriores, salvo])
      }
      if (salvo.data !== chaveData) {
        const [ano, mes, dia] = salvo.data.split('-').map(Number)
        setDataSelecionada(new Date(ano, mes - 1, dia))
      }
      fecharModal()
    } catch (erro) {
      const mensagem = erro.response?.data?.message || erro.message || 'Não foi possível salvar o compromisso.'
      Alert.alert('Erro ao salvar compromisso', mensagem)
    } finally {
      salvandoRef.current = false
      setSalvando(false)
    }
  }

  function handleRemover(id) {
    Alert.alert('Remover evento', 'Deseja remover este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        await removerEvento(id)
        setEventos((prev) => prev.filter((e) => e.id !== id))
      } },
    ])
  }

  async function handleAdicionarAoCalendario(evento) {
    try {
      const resultado = await adicionarAoCalendario(evento)
      if (resultado.action === 'saved') {
        Alert.alert('Calendário', 'Compromisso adicionado ao calendário do dispositivo.')
      } else if (resultado.action === 'canceled') {
        Alert.alert('Calendário', 'A inclusão foi cancelada.')
      } else {
        Alert.alert('Calendário', 'O calendário do dispositivo foi aberto. Confirme a gravação na tela apresentada.')
      }
    } catch (erro) {
      Alert.alert('Calendário', erro.message || 'Não foi possível abrir o calendário do dispositivo.')
    }
  }

  const visiveis = filtro === 'Todos' ? eventos : eventos.filter((e) => e.categoria === filtro)

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Cronograma</Text>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity style={styles.pillSolid} onPress={() => setDataSelecionada(new Date())}>
            <Text style={styles.pillSolidText}>Hoje</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => setDataSelecionada((data) => new Date(data.getFullYear(), data.getMonth(), data.getDate() - 1))} accessibilityLabel="Dia anterior">
            <Ionicons name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDataSelecionada(new Date())}>
            <Text style={styles.dateTitle}>{dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long' })}</Text>
            <Text style={styles.dateSub}>{dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDataSelecionada((data) => new Date(data.getFullYear(), data.getMonth(), data.getDate() + 1))} accessibilityLabel="Próximo dia">
            <Ionicons name="chevron-forward" size={22} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          {CATEGORIAS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, filtro === c && styles.chipActive]}
              onPress={() => setFiltro(c)}
            >
              <Text style={[styles.chipText, filtro === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.chip, styles.chipOutline]} onPress={abrirModal}>
            <Text style={styles.chipText}>+ Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, styles.chipOutline]} onPress={() => navigation.navigate('Calendario')}>
            <Ionicons name="calendar-outline" size={17} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardPanel}>
          <Text style={styles.cardHeader}>{visiveis.length} Eventos</Text>
          {carregando && <Text>Carregando...</Text>}
          {!carregando && visiveis.length === 0 && <Text>Nenhum compromisso nesta data.</Text>}
          {visiveis.map((ev) => {
            const materia = materias.find((item) => String(item.id ?? item.materiaId) === String(ev.materiaId))
            const categoriaExibida = ev.origem === 'kanban' ? `Kanban · ${ev.statusKanban}` : ev.categoria
            return (
              <View key={ev.id} style={styles.eventRow}>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventCat}>{categoriaExibida}{materia ? ` · ${materia.nome}` : ''}</Text>
                  <Text style={styles.eventTitle}>{ev.titulo}</Text>
                  <Text style={styles.eventTime}>
                    {ev.inicio && ev.fim
                      ? `${ev.inicio} - ${ev.fim}`
                      : ev.duracaoMinutos ? `${ev.duracaoMinutos} min estimados` : 'Sem horário definido'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemover(ev.id)} accessibilityLabel="Excluir compromisso" hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.dark2} />
                </TouchableOpacity>
                {!!(ev.inicio && ev.fim) && (
                  <TouchableOpacity onPress={() => handleAdicionarAoCalendario(ev)} accessibilityLabel="Adicionar ao calendário do dispositivo" hitSlop={8} style={styles.calendarAction}>
                    <Ionicons name="calendar-outline" size={18} color={colors.dark2} />
                  </TouchableOpacity>
                )}
              </View>
            )
          })}
          <TouchableOpacity style={styles.fab} onPress={abrirModal}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={modalVisivel} animationType="slide" transparent onRequestClose={fecharModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.modalKeyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar compromisso</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do Compromisso"
              placeholderTextColor={colors.muted}
              value={nome}
              onChangeText={setNome}
            />

            <DatePickerField value={dataForm} onChange={setDataForm} />
            <View style={styles.timeRow}>
              <TextInput style={[styles.input, styles.timeInput]} placeholder="Início (HH:MM)" placeholderTextColor={colors.muted} value={inicio} onChangeText={setInicio} />
              <TextInput style={[styles.input, styles.timeInput]} placeholder="Fim (HH:MM)" placeholderTextColor={colors.muted} value={fim} onChangeText={setFim} />
            </View>

            <TextInput
              style={[styles.input, styles.inputArea]}
              placeholder="Descrição"
              placeholderTextColor={colors.muted}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.escolherLabel}>Tipo de compromisso</Text>
            <View style={styles.categoriaOpcoes}>
              {CATEGORIAS_FORM.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.categoriaOpcao, categoriaForm === c && styles.categoriaOpcaoAtiva]}
                  onPress={() => setCategoriaForm(c)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: categoriaForm === c }}
                >
                  <Text style={[styles.categoriaOpcaoText, categoriaForm === c && styles.categoriaOpcaoTextAtiva]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <MateriaPicker
              materias={materias}
              onMateriasChange={setMaterias}
              selectedId={materiaId}
              onSelect={setMateriaId}
            />

            <View style={styles.notificarRow}>
              <Text style={styles.escolherLabel}>Me Notificar</Text>
              <Switch
                value={notificar}
                onValueChange={setNotificar}
                trackColor={{ false: colors.light2, true: colors.mid }}
                thumbColor={colors.white}
              />
            </View>

            <TouchableOpacity
              style={[styles.criarBtn, !formularioValido && styles.criarBtnDisabled]}
              onPress={handleCriar}
              disabled={salvando || !formularioValido}
            >
              <Text style={styles.criarBtnText}>{salvando ? 'Salvando...' : 'Salvar compromisso'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelarBtn} onPress={fecharModal}>
              <Text style={styles.cancelarBtnText}>Cancelar</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: '600', color: colors.dark, marginBottom: 8 },
  pillSolid: { backgroundColor: colors.dark2, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18 },
  pillSolidText: { color: '#fff', fontSize: 13 },
  dateTitle: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginTop: 10, color: colors.text },
  dateSub: { textAlign: 'center', color: colors.muted, marginBottom: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderWidth: 1, borderColor: colors.dark, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: colors.dark2, borderColor: colors.dark2 },
  chipOutline: { borderStyle: 'dashed' },
  chipText: { color: colors.dark, fontSize: 13 },
  chipTextActive: { color: '#fff' },
  cardPanel: { backgroundColor: colors.light, borderRadius: 14, padding: 14 },
  cardHeader: { fontWeight: '700', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 8, marginBottom: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: colors.dark2, paddingVertical: 8, paddingLeft: 10, marginBottom: 8 },
  eventDetails: { flex: 1 },
  calendarAction: { marginLeft: 12 },
  eventCat: { fontSize: 12, color: colors.muted },
  eventTitle: { fontWeight: '700', color: colors.text },
  eventTime: { fontSize: 12, marginTop: 4, color: colors.text },
  fab: { backgroundColor: colors.dark2, borderRadius: 999, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  fabText: { color: '#fff', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalKeyboard: { width: '100%' },
  modalCard: { maxHeight: '92%', backgroundColor: colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 22, paddingTop: 22 },
  modalContent: { paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 18 },
  input: { backgroundColor: colors.light2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, color: colors.text },
  inputArea: { minHeight: 90, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeInput: { flex: 1 },
  escolherRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  escolherLabel: { color: colors.text, fontWeight: '600' },
  escolherBtn: { backgroundColor: colors.dark2, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  escolherBtnText: { color: '#fff', fontWeight: '600' },
  categoriaOpcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  categoriaOpcao: { borderWidth: 1, borderColor: colors.dark2, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  categoriaOpcaoAtiva: { backgroundColor: colors.dark2 },
  categoriaOpcaoText: { color: colors.dark2, fontSize: 13 },
  categoriaOpcaoTextAtiva: { color: '#fff' },
  notificarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 24 },
  criarBtn: { backgroundColor: colors.dark2, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  criarBtnDisabled: { backgroundColor: colors.mid, opacity: 0.65 },
  criarBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelarBtn: { alignItems: 'center', paddingVertical: 4 },
  cancelarBtnText: { color: colors.muted, fontSize: 13 },
})
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { listarEventos, listarDiasComEventos, criarEvento, removerEvento } from '../api/eventsApi'
import { listarMaterias } from '../api/materiasApi'
import { adicionarAoCalendario } from '../api/deviceCalendarApi'
import Header from '../components/Header'
import DatePickerField from '../components/DatePickerField'
import MateriaPicker from '../components/MateriaPicker'
import { colors } from '../theme/colors'

const CATEGORIAS = ['Todos', 'Pessoal', 'Escola']
const CATEGORIAS_FORM = ['Pessoal', 'Escola']
const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function diasDoMes(data) {
  const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1)
  const deslocamento = primeiroDia.getDay()
  const quantidade = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate()
  const celulas = Math.ceil((deslocamento + quantidade) / 7) * 7
  return Array.from({ length: celulas }, (_, indice) => (
    new Date(data.getFullYear(), data.getMonth(), indice - deslocamento + 1)
  ))
}

function nomeDoMes(data) {
  const nome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return nome.charAt(0).toLocaleUpperCase('pt-BR') + nome.slice(1)
}

function nomeDoDia(data) {
  const dia = data.toLocaleDateString('pt-BR', { weekday: 'long' })
  const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  const diaFormatado = String(data.getDate()).padStart(2, '0')
  return `${dia.charAt(0).toLocaleUpperCase('pt-BR') + dia.slice(1)}, ${diaFormatado} ${mes}`
}

export default function CronogramaScreen({ navigation, route }) {
  const [eventos, setEventos] = useState([])
  const [materias, setMaterias] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(() => new Date())
  const [filtro, setFiltro] = useState('Todos')
  const [modoExibicao, setModoExibicao] = useState('geral')
  const [diasComEventos, setDiasComEventos] = useState([])
  const [erroEventos, setErroEventos] = useState('')
  const [erroCalendario, setErroCalendario] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [carregandoCalendario, setCarregandoCalendario] = useState(true)
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
  const chaveMes = `${dataSelecionada.getFullYear()}-${String(dataSelecionada.getMonth() + 1).padStart(2, '0')}`
  const diasCalendario = useMemo(() => diasDoMes(dataSelecionada), [chaveMes])

  useFocusEffect(useCallback(() => {
    let ativo = true
    setCarregando(true)
    setErroEventos('')
    listarEventos(chaveData)
      .then((listaEventos) => {
        if (!ativo) return
        setEventos(listaEventos)
      })
      .catch(() => {
        if (ativo) setErroEventos('Não foi possível carregar os compromissos.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [chaveData]))

  useFocusEffect(useCallback(() => {
    let ativo = true
    setCarregandoCalendario(true)
    setErroCalendario('')
    listarDiasComEventos(chaveMes)
      .then((dias) => { if (ativo) setDiasComEventos(dias) })
      .catch(() => { if (ativo) setErroCalendario('Não foi possível carregar os indicadores do calendário.') })
      .finally(() => { if (ativo) setCarregandoCalendario(false) })
    return () => { ativo = false }
  }, [chaveMes]))

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

  useEffect(() => {
    if (!route?.params?.abrirNovo) return
    abrirModal()
    navigation.setParams({ abrirNovo: false })
  }, [navigation, route?.params?.abrirNovo])

  function mudarMes(direcao) {
    setDataSelecionada((atual) => {
      const primeiroDiaNovoMes = new Date(atual.getFullYear(), atual.getMonth() + direcao, 1)
      const ultimoDiaNovoMes = new Date(primeiroDiaNovoMes.getFullYear(), primeiroDiaNovoMes.getMonth() + 1, 0).getDate()
      return new Date(primeiroDiaNovoMes.getFullYear(), primeiroDiaNovoMes.getMonth(), Math.min(atual.getDate(), ultimoDiaNovoMes))
    })
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
      if (salvo.data?.startsWith(chaveMes)) {
        setDiasComEventos((dias) => dias.includes(salvo.data) ? dias : [...dias, salvo.data])
      }
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
        try {
          await removerEvento(id)
          const restantes = eventos.filter((evento) => evento.id !== id)
          setEventos(restantes)
          if (restantes.length === 0) {
            setDiasComEventos((dias) => dias.filter((dia) => dia !== chaveData))
          }
        } catch (erro) {
          Alert.alert('Erro ao remover compromisso', erro.message || 'Não foi possível remover o compromisso.')
        }
      } },
    ])
  }

  function mostrarAcoesEvento(evento) {
    const acoes = []
    if (evento.inicio && evento.fim) {
      acoes.push({ text: 'Adicionar ao calendário', onPress: () => handleAdicionarAoCalendario(evento) })
    }
    acoes.push({ text: 'Excluir compromisso', style: 'destructive', onPress: () => handleRemover(evento.id) })
    acoes.push({ text: 'Cancelar', style: 'cancel' })
    Alert.alert(evento.titulo, 'Escolha uma ação para este compromisso.', acoes)
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

  const eventosOrdenados = [...eventos].sort((a, b) => (a.inicio ?? '').localeCompare(b.inicio ?? ''))
  const visiveis = filtro === 'Todos' ? eventosOrdenados : eventosOrdenados.filter((evento) => evento.categoria === filtro)
  const categoriasVisiveis = [
    ...CATEGORIAS_FORM.filter((categoria) => visiveis.some((evento) => evento.categoria === categoria)),
    ...new Set(visiveis.map((evento) => evento.categoria || 'Outros').filter((categoria) => !CATEGORIAS_FORM.includes(categoria))),
  ]
  const gruposVisiveis = categoriasVisiveis.map((categoria) => ({
    categoria,
    eventos: visiveis.filter((evento) => (evento.categoria || 'Outros') === categoria),
  }))

  function renderEvento(evento) {
    const corCategoria = evento.categoria === 'Escola' ? '#7CAB63' : '#1C3F1E'
    const categoriaExibida = evento.origem === 'kanban' ? `Kanban · ${evento.statusKanban}` : evento.categoria
    const materia = materias.find((item) => String(item.id ?? item.materiaId) === String(evento.materiaId))
    return (
      <View style={[styles.eventRow, { borderLeftColor: corCategoria }]} key={evento.id}>
        <View style={styles.eventDetails}>
          <Text style={[styles.eventCat, { color: corCategoria }]}>{categoriaExibida?.toUpperCase()}{materia ? ` · ${materia.nome}` : ''}</Text>
          <Text style={styles.eventTitle}>{evento.titulo}</Text>
          <View style={styles.eventTimeRow}>
            <Ionicons name="time-outline" size={13} color={colors.muted} />
            <Text style={styles.eventTime}>
              {evento.inicio && evento.fim
                ? `${evento.inicio} – ${evento.fim}`
                : evento.duracaoMinutos ? `${evento.duracaoMinutos} min estimados` : 'Sem horário definido'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => mostrarAcoesEvento(evento)} accessibilityLabel="Ações do compromisso" hitSlop={8} style={styles.eventAction}>
          <Ionicons name="ellipsis-vertical" size={17} color="#7B8A76" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Cronograma" compact backgroundColor="#F4F8EB" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{nomeDoMes(dataSelecionada)}</Text>
            <View style={styles.monthActions}>
              <TouchableOpacity style={styles.todayButton} onPress={() => setDataSelecionada(new Date())}>
                <Text style={styles.todayText}>Hoje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.monthArrow} onPress={() => mudarMes(-1)} accessibilityLabel="Mês anterior">
                <Ionicons name="chevron-back" size={16} color={colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.monthArrow} onPress={() => mudarMes(1)} accessibilityLabel="Próximo mês">
                <Ionicons name="chevron-forward" size={16} color={colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.weekHeader}>
            {DIAS_SEMANA.map((dia) => <Text style={styles.weekday} key={dia}>{dia}</Text>)}
          </View>
          <View style={styles.calendarGrid}>
            {diasCalendario.map((dia) => {
              const chaveDia = dataISO(dia)
              const noMesAtual = dia.getMonth() === dataSelecionada.getMonth()
              const selecionado = chaveDia === chaveData
              const temEvento = diasComEventos.includes(chaveDia)
              return (
                <TouchableOpacity
                  key={chaveDia}
                  style={styles.dayCell}
                  onPress={() => setDataSelecionada(dia)}
                  accessibilityRole="button"
                  accessibilityLabel={dia.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  accessibilityState={{ selected: selecionado }}
                >
                  <View style={[styles.dayButton, selecionado && styles.dayButtonSelected]}>
                    <Text style={[
                      styles.dayNumber,
                      !noMesAtual && styles.dayOutsideMonth,
                      selecionado && styles.dayNumberSelected,
                    ]}>{dia.getDate()}</Text>
                    {temEvento && <View style={[styles.dayMarker, selecionado && styles.dayMarkerSelected]} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          {erroCalendario ? <Text style={styles.inlineError}>{erroCalendario}</Text> : null}
          {carregandoCalendario && <Text style={styles.calendarLoading}>Atualizando calendário...</Text>}
        </View>

        <View style={styles.selectedDateRow}>
          <View style={styles.selectedDateCopy}>
            <Text style={styles.dateTitle}>{nomeDoDia(dataSelecionada)}</Text>
            <Text style={styles.dateSub}>{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</Text>
          </View>
          <View style={styles.modeToggle}>
            {[
              { id: 'geral', label: 'Geral', icon: 'reorder-three-outline' },
              { id: 'categorias', label: 'Categorias', icon: 'layers-outline' },
            ].map((modo) => (
              <TouchableOpacity
                key={modo.id}
                style={[styles.modeButton, modoExibicao === modo.id && styles.modeButtonActive]}
                onPress={() => setModoExibicao(modo.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: modoExibicao === modo.id }}
              >
                <Ionicons name={modo.icon} size={12} color={modoExibicao === modo.id ? '#fff' : colors.dark} />
                <Text style={[styles.modeText, modoExibicao === modo.id && styles.modeTextActive]}>{modo.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chipRow}>
          {CATEGORIAS.map((categoria) => (
            <TouchableOpacity
              key={categoria}
              style={[styles.chip, filtro === categoria && styles.chipActive]}
              onPress={() => setFiltro(categoria)}
              accessibilityRole="button"
              accessibilityState={{ selected: filtro === categoria }}
            >
              {categoria !== 'Todos' && <View style={[styles.filterDot, categoria === 'Escola' && styles.schoolDot]} />}
              <Text style={[styles.chipText, filtro === categoria && styles.chipTextActive]}>{categoria}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.chip, styles.newChip]} onPress={abrirModal} accessibilityRole="button">
            <Ionicons name="add" size={16} color={colors.dark} />
            <Text style={styles.chipText}>Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.calendarShortcut} onPress={() => navigation.navigate('Calendario')} accessibilityRole="button" accessibilityLabel="Abrir calendário da turma">
            <Ionicons name="calendar-outline" size={17} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.eventsPanel}>
          {carregando ? (
            <Text style={styles.emptyEvents}>Carregando compromissos...</Text>
          ) : erroEventos ? (
            <Text style={styles.inlineError}>{erroEventos}</Text>
          ) : visiveis.length === 0 ? (
            <Text style={styles.emptyEvents}>Nenhum compromisso para este filtro nesta data.</Text>
          ) : modoExibicao === 'geral' ? (
            visiveis.map(renderEvento)
          ) : (
            gruposVisiveis.map((grupo) => (
              <View style={styles.categoryGroup} key={grupo.categoria}>
                <View style={styles.categoryHeading}>
                  <View style={[styles.filterDot, grupo.categoria === 'Escola' && styles.schoolDot]} />
                  <Text style={styles.categoryTitle}>{grupo.categoria}</Text>
                  <Text style={styles.categoryCount}>{grupo.eventos.length}</Text>
                </View>
                {grupo.eventos.map(renderEvento)}
              </View>
            ))
          )}
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
  container: { flex: 1, backgroundColor: '#F4F8EB' },
  content: { paddingHorizontal: 14, paddingTop: 3, paddingBottom: 128 },
  calendarCard: { paddingHorizontal: 11, paddingTop: 11, paddingBottom: 9, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E1EBD8', marginBottom: 10 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 29 },
  monthTitle: { color: colors.dark, fontSize: 12, fontWeight: '700' },
  monthActions: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  todayButton: { minHeight: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9, borderRadius: 13, borderWidth: 1, borderColor: '#E1EBD8', backgroundColor: '#fff' },
  todayText: { color: colors.dark, fontSize: 9, fontWeight: '600' },
  monthArrow: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4EED9' },
  weekHeader: { flexDirection: 'row', marginTop: 9, marginBottom: 4 },
  weekday: { width: '14.2857%', color: '#7A8675', fontSize: 8, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 31, alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  dayButtonSelected: { backgroundColor: colors.dark },
  dayNumber: { color: '#273027', fontSize: 9, lineHeight: 12, textAlign: 'center' },
  dayOutsideMonth: { color: '#B5C0B1' },
  dayNumberSelected: { color: '#fff', fontWeight: '700' },
  dayMarker: { position: 'absolute', bottom: 2, width: 3, height: 3, borderRadius: 2, backgroundColor: '#6F9A5E' },
  dayMarkerSelected: { backgroundColor: '#fff' },
  calendarLoading: { color: colors.muted, fontSize: 8, textAlign: 'center', marginTop: 3 },
  inlineError: { color: '#A33B35', fontSize: 9, lineHeight: 13, marginTop: 4 },
  selectedDateRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 7 },
  selectedDateCopy: { flex: 1 },
  dateTitle: { color: colors.dark, fontSize: 11, fontWeight: '700' },
  dateSub: { color: colors.muted, fontSize: 8, marginTop: 1 },
  modeToggle: { flexDirection: 'row', gap: 2, padding: 3, borderRadius: 15, backgroundColor: '#E4EED9' },
  modeButton: { minHeight: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 7, borderRadius: 13 },
  modeButtonActive: { backgroundColor: colors.dark },
  modeText: { color: colors.dark, fontSize: 8, fontWeight: '600' },
  modeTextActive: { color: '#fff' },
  chipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  chip: { minHeight: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 9, borderRadius: 14, borderWidth: 1, borderColor: '#E1EBD8', backgroundColor: '#fff' },
  chipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  chipText: { color: colors.dark, fontSize: 8, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  filterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dark },
  schoolDot: { backgroundColor: '#7CAB63' },
  newChip: { backgroundColor: '#E4EED9', borderColor: '#E4EED9' },
  calendarShortcut: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#E4EED9' },
  eventsPanel: { padding: 8, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8' },
  emptyEvents: { color: colors.muted, fontSize: 10, textAlign: 'center', paddingVertical: 21 },
  categoryGroup: { padding: 8, borderRadius: 13, borderWidth: 1, borderColor: '#E1EBD8', marginBottom: 7 },
  categoryHeading: { minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  categoryTitle: { color: colors.dark, fontSize: 10, fontWeight: '700' },
  categoryCount: { minWidth: 15, textAlign: 'center', color: colors.dark, fontSize: 8, fontWeight: '700', backgroundColor: '#E4EED9', borderRadius: 8, overflow: 'hidden', paddingHorizontal: 4, paddingVertical: 2 },
  eventRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderLeftWidth: 3, borderColor: '#E1EBD8', borderLeftColor: colors.dark2, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 8, marginBottom: 6 },
  eventDetails: { flex: 1 },
  eventCat: { fontSize: 7, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2 },
  eventTitle: { fontWeight: '700', color: '#303530', fontSize: 10 },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  eventTime: { fontSize: 8, color: colors.text },
  eventAction: { width: 24, height: 30, alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalKeyboard: { width: '100%' },
  modalCard: { maxHeight: '92%', backgroundColor: colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 22, paddingTop: 22 },
  modalContent: { paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 18 },
  input: { backgroundColor: colors.light2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, color: colors.text },
  inputArea: { minHeight: 90, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeInput: { flex: 1 },
  escolherLabel: { color: colors.text, fontWeight: '600' },
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
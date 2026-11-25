import { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { buscarKanban } from '../api/kanbanApi'
import { listarMaterias } from '../api/materiasApi'
import { colors } from '../theme/colors'

const PERIODOS = [
  { nome: 'Manhã', inicio: 5 * 60, fim: 12 * 60, horaPadrao: '08:00' },
  { nome: 'Tarde', inicio: 12 * 60, fim: 18 * 60, horaPadrao: '13:00' },
  { nome: 'Noite', inicio: 18 * 60, fim: 23 * 60, horaPadrao: '19:00' },
]

function criarTarefas(board) {
  return (board?.categorias ?? [])
    .filter((categoria) => !/conclu|done/i.test(`${categoria.id} ${categoria.nome}`))
    .flatMap((categoria) => (categoria.itens ?? []).map((item, indice) => {
      const tarefa = typeof item === 'string' ? { titulo: item } : item
      return {
        ...tarefa,
        id: String(tarefa.id ?? `${categoria.id}-${indice}`),
        titulo: tarefa.titulo ?? tarefa.texto ?? 'Atividade',
        categoria: categoria.nome,
      }
    }))
}

function paraMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number)
  return horas * 60 + minutos
}

function formatarHora(minutos) {
  return `${String(Math.floor(minutos / 60) % 24).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

function ordenarTarefas(tarefas) {
  return [...tarefas].sort((a, b) => {
    if (a.data && b.data && a.data !== b.data) return a.data.localeCompare(b.data)
    if (a.data) return -1
    if (b.data) return 1
    return a.titulo.localeCompare(b.titulo, 'pt-BR')
  })
}

function montarPlano(tarefas, minutosDisponiveis, minutosSessao, horaInicio) {
  const plano = []
  let tempoLivre = minutosDisponiveis
  let horario = paraMinutos(horaInicio)
  let blocosDeFoco = 0

  tarefas.forEach((tarefa, indiceTarefa) => {
    let restanteTarefa = Number(tarefa.duracaoMinutos) || minutosSessao
    while (restanteTarefa > 0 && tempoLivre > 0) {
      const duracao = Math.min(minutosSessao, restanteTarefa, tempoLivre)
      const parcial = duracao < restanteTarefa
      plano.push({
        tipo: 'foco',
        titulo: tarefa.titulo,
        materia: tarefa.materiaNome,
        inicio: formatarHora(horario),
        fim: formatarHora(horario + duracao),
        duracao,
        parcial,
      })
      horario += duracao
      tempoLivre -= duracao
      restanteTarefa -= duracao
      blocosDeFoco += 1

      const haMaisEstudo = restanteTarefa > 0 || indiceTarefa < tarefas.length - 1
      if (haMaisEstudo && tempoLivre >= 5) {
        plano.push({ tipo: 'pausa', titulo: 'Pausa', inicio: formatarHora(horario), fim: formatarHora(horario + 5), duracao: 5 })
        horario += 5
        tempoLivre -= 5
      }
    }
    if (tempoLivre <= 0) return
  })

  if (tempoLivre > 0) {
    plano.push({ tipo: 'livre', titulo: 'Tempo livre ou revisão', inicio: formatarHora(horario), fim: formatarHora(horario + tempoLivre), duracao: tempoLivre })
  }

  return { plano, blocosDeFoco }
}

export default function StudySuggestionModal({ visible, onClose }) {
  const [tarefas, setTarefas] = useState([])
  const [selecionadas, setSelecionadas] = useState([])
  const [materias, setMaterias] = useState([])
  const [periodo, setPeriodo] = useState(PERIODOS[0])
  const [horaInicio, setHoraInicio] = useState(PERIODOS[0].horaPadrao)
  const [tempoDisponivel, setTempoDisponivel] = useState('')
  const [tempoSessao, setTempoSessao] = useState('')
  const [plano, setPlano] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!visible) return undefined
    let ativo = true
    setCarregando(true)
    Promise.all([buscarKanban(), listarMaterias().catch(() => [])])
      .then(([board, listaMaterias]) => {
        if (!ativo) return
        const lista = criarTarefas(board)
        setTarefas(lista)
        setSelecionadas(lista.map((tarefa) => tarefa.id))
        setMaterias(listaMaterias)
        setPlano(null)
        setErro('')
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar as tarefas do Kanban.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [visible])

  function gerarSugestao() {
    const disponivel = Number(tempoDisponivel)
    const sessao = Number(tempoSessao)
    const inicio = paraMinutos(horaInicio)
    const tarefaSelecionada = ordenarTarefas(tarefas.filter((tarefa) => selecionadas.includes(tarefa.id)))

    if (!Number.isInteger(disponivel) || disponivel < 1 || !Number.isInteger(sessao) || sessao < 1) {
      setErro('Informe o tempo disponível e a duração de cada sessão em minutos.')
      return
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaInicio) || inicio < periodo.inicio || inicio >= periodo.fim || inicio + disponivel > periodo.fim) {
      setErro(`O horário e o tempo disponível precisam caber no período da ${periodo.nome.toLocaleLowerCase('pt-BR')}.`)
      return
    }
    if (tarefaSelecionada.length === 0) {
      setErro('Selecione ao menos uma tarefa ativa do Kanban.')
      return
    }

    const tarefasComMateria = tarefaSelecionada.map((tarefa) => ({
      ...tarefa,
      materiaNome: materias.find((materia) => String(materia.id ?? materia.materiaId) === String(tarefa.materiaId))?.nome,
    }))
    setPlano(montarPlano(tarefasComMateria, disponivel, sessao, horaInicio))
    setErro('')
  }

  function alternarTarefa(id) {
    setSelecionadas((lista) => lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id])
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{plano ? 'Sugestão de estudo' : 'Montar sugestão de horário'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Fechar sugestão">
              <Ionicons name="close" size={22} color={colors.dark} />
            </TouchableOpacity>
          </View>

          {!plano ? (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Período disponível</Text>
              <View style={styles.periodRow}>
                {PERIODOS.map((opcao) => (
                  <TouchableOpacity
                    key={opcao.nome}
                    style={[styles.periodButton, periodo.nome === opcao.nome && styles.periodActive]}
                    onPress={() => { setPeriodo(opcao); setHoraInicio(opcao.horaPadrao) }}
                  >
                    <Text style={[styles.periodText, periodo.nome === opcao.nome && styles.periodTextActive]}>{opcao.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputColumn}>
                  <Text style={styles.label}>Início</Text>
                  <TextInput style={styles.input} value={horaInicio} onChangeText={setHoraInicio} placeholder="08:00" keyboardType="numbers-and-punctuation" />
                </View>
                <View style={styles.inputColumn}>
                  <Text style={styles.label}>Tempo disponível (min)</Text>
                  <TextInput style={styles.input} value={tempoDisponivel} onChangeText={setTempoDisponivel} placeholder="Ex.: 120" keyboardType="number-pad" />
                </View>
              </View>

              <Text style={styles.label}>Duração por sessão (min)</Text>
              <TextInput style={styles.input} value={tempoSessao} onChangeText={setTempoSessao} placeholder="Ex.: 25" keyboardType="number-pad" />

              <Text style={styles.label}>Tarefas ativas</Text>
              {carregando && <Text style={styles.hint}>Carregando tarefas...</Text>}
              {!carregando && tarefas.length === 0 && <Text style={styles.hint}>Adicione tarefas no Kanban para montar uma sugestão.</Text>}
              {tarefas.map((tarefa) => (
                <TouchableOpacity key={tarefa.id} style={styles.taskRow} onPress={() => alternarTarefa(tarefa.id)}>
                  <Ionicons
                    name={selecionadas.includes(tarefa.id) ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={colors.dark2}
                  />
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
                    <Text style={styles.hint}>
                      {[tarefa.categoria, tarefa.data, tarefa.duracaoMinutos ? `${tarefa.duracaoMinutos} min` : 'estimativa por sessão'].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {!!erro && <Text style={styles.error}>{erro}</Text>}
              <TouchableOpacity style={styles.primaryButton} onPress={gerarSugestao} disabled={carregando}>
                <Text style={styles.primaryText}>Gerar sugestão</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <>
              <Text style={styles.summary}>{periodo.nome} · {horaInicio} · {tempoDisponivel} minutos disponíveis</Text>
              <ScrollView style={styles.planList} showsVerticalScrollIndicator={false}>
                {plano.plano.map((item, indice) => (
                  <View key={`${item.tipo}-${indice}`} style={styles.planRow}>
                    <Text style={styles.planTime}>{item.inicio}–{item.fim}</Text>
                    <View style={styles.planDetails}>
                      <Text style={styles.planTitle}>{item.titulo}{item.parcial ? ' · continuar depois' : ''}</Text>
                      <Text style={styles.hint}>
                        {item.tipo === 'foco' ? [item.materia, `${item.duracao} min`].filter(Boolean).join(' · ') : `${item.duracao} min`}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.summary}>{plano.blocosDeFoco} blocos de foco, com pausas quando há tempo entre as tarefas.</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setPlano(null)}>
                  <Text style={styles.secondaryText}>Editar critérios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
                  <Text style={styles.primaryText}>Concluir</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  card: { maxHeight: '92%', backgroundColor: colors.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, paddingBottom: 30 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: colors.text, fontWeight: '700', fontSize: 18, flex: 1 },
  label: { color: colors.text, fontSize: 13, fontWeight: '600', marginBottom: 7, marginTop: 10 },
  periodRow: { flexDirection: 'row', gap: 8 },
  periodButton: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: colors.dark2, backgroundColor: '#fff' },
  periodActive: { backgroundColor: colors.dark2 },
  periodText: { color: colors.dark2, fontSize: 12, fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 10 },
  inputColumn: { flex: 1 },
  input: { minHeight: 42, borderRadius: 7, borderWidth: 1, borderColor: '#d4ddcc', backgroundColor: '#fff', paddingHorizontal: 11, color: colors.text },
  taskRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d4ddcc' },
  taskDetails: { flex: 1 },
  taskTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 11, marginTop: 2 },
  error: { color: '#a33', fontSize: 12, marginTop: 10 },
  primaryButton: { minHeight: 42, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.dark2, paddingHorizontal: 14, marginTop: 16 },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryButton: { minHeight: 42, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: colors.dark2, paddingHorizontal: 14, marginTop: 16 },
  secondaryText: { color: colors.dark2, fontSize: 13, fontWeight: '700' },
  summary: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  planList: { maxHeight: 430 },
  planRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d4ddcc', gap: 12 },
  planTime: { width: 88, color: colors.dark2, fontSize: 12, fontWeight: '700' },
  planDetails: { flex: 1 },
  planTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
})
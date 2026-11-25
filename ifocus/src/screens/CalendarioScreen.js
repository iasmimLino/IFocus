import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Header from '../components/Header'
import { colors } from '../theme/colors'
import {
  listarEventos,
  listarDiasComEventos,
  listarEventosTurma,
  listarDiasComEventosTurma,
  buscarTurma,
} from '../api/eventsApi'

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
function paraDataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

/**
 * Calendário mensal com duas visões:
 *  - "Estudante": eventos pessoais (src/api/eventsApi.js -> listarEventos)
 *  - "Turma": eventos da turma/classe, iguais para todos os alunos
 *    (src/api/eventsApi.js -> listarEventosTurma)
 * Dias com evento aparecem marcados com um pontinho; tocar num dia mostra
 * a lista de eventos daquele dia embaixo do calendário.
 */
export default function CalendarioScreen({ navigation }) {
  const [visao, setVisao] = useState('estudante') // 'estudante' | 'turma'
  const [diaSelecionado, setDiaSelecionado] = useState(() => new Date())
  const [diasComEvento, setDiasComEvento] = useState([])
  const [eventosDoDia, setEventosDoDia] = useState([])
  const [nomeTurma, setNomeTurma] = useState('')
  const ano = diaSelecionado.getFullYear()
  const mes = diaSelecionado.getMonth()
  const prefixoMes = `${ano}-${String(mes + 1).padStart(2, '0')}`
  const dataSelecionadaISO = paraDataISO(diaSelecionado)
  const inicioGrade = new Date(ano, mes, 1 - new Date(ano, mes, 1).getDay())
  const diasGrade = Array.from({ length: 42 }, (_, indice) => {
    const data = new Date(inicioGrade.getFullYear(), inicioGrade.getMonth(), inicioGrade.getDate() + indice)
    return { data, chave: paraDataISO(data), foraDoMes: data.getMonth() !== mes }
  })

  const carregarDiasDoMes = useCallback(async () => {
    try {
      const dias = visao === 'estudante'
        ? await listarDiasComEventos(prefixoMes)
        : await listarDiasComEventosTurma(prefixoMes)
      setDiasComEvento(dias)
    } catch {
      setDiasComEvento([])
    }
  }, [visao, prefixoMes])

  const carregarEventosDoDia = useCallback(async () => {
    try {
      const eventos = visao === 'estudante'
        ? await listarEventos(dataSelecionadaISO)
        : await listarEventosTurma(dataSelecionadaISO)
      setEventosDoDia(eventos)
    } catch {
      setEventosDoDia([])
    }
  }, [visao, dataSelecionadaISO])

  useEffect(() => { carregarDiasDoMes() }, [carregarDiasDoMes])
  useEffect(() => { carregarEventosDoDia() }, [carregarEventosDoDia])
  useEffect(() => { buscarTurma().then((t) => setNomeTurma(t?.nome || '')).catch(() => setNomeTurma('')) }, [])

  function mudarMes(direcao) {
    setDiaSelecionado((data) => new Date(data.getFullYear(), data.getMonth() + direcao, 1))
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => mudarMes(-1)} accessibilityLabel="Mês anterior">
            <Ionicons name="chevron-back" size={22} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {diaSelecionado.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => mudarMes(1)} accessibilityLabel="Próximo mês">
            <Ionicons name="chevron-forward" size={22} color={colors.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, visao === 'estudante' && styles.tabActive]}
            onPress={() => setVisao('estudante')}
          >
            <Text style={[styles.tabText, visao === 'estudante' && styles.tabTextActive]}>Estudante</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, visao === 'turma' && styles.tabActive]}
            onPress={() => setVisao('turma')}
          >
            <Text style={[styles.tabText, visao === 'turma' && styles.tabTextActive]}>Turma</Text>
          </TouchableOpacity>
        </View>
        {visao === 'turma' && !!nomeTurma && <Text style={styles.turmaLabel}>{nomeTurma}</Text>}

        <View style={styles.table}>
          <View style={styles.row}>
            {DIAS_SEMANA.map((d) => (
              <Text key={d} style={styles.headCell}>{d}</Text>
            ))}
          </View>
          {Array.from({ length: 6 }, (_, semana) => (
            <View style={styles.row} key={semana}>
              {diasGrade.slice(semana * 7, semana * 7 + 7).map(({ data, chave, foraDoMes }) => {
                const hoje = chave === paraDataISO(new Date())
                const selecionado = chave === dataSelecionadaISO
                const temEvento = diasComEvento.includes(chave)
                return (
                  <TouchableOpacity
                    key={chave}
                    style={[styles.dayCell, hoje && styles.dayToday, selecionado && styles.daySelecionado]}
                    onPress={() => setDiaSelecionado(data)}
                  >
                    <Text style={[
                      styles.dayText,
                      foraDoMes && styles.dayOut,
                      hoje && styles.dayTodayText,
                      selecionado && styles.daySelecionadoText,
                    ]}>
                      {data.getDate()}
                    </Text>
                    {temEvento && <View style={styles.eventDot} />}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        <View style={styles.dayPanel}>
          <Text style={styles.dayPanelTitle}>
            {diaSelecionado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} · {visao === 'estudante' ? 'seus eventos' : 'eventos da turma'}
          </Text>
          {eventosDoDia.length === 0 && <Text style={styles.muted}>Nenhum evento neste dia.</Text>}
          {eventosDoDia.map((ev) => (
            <View key={ev.id} style={styles.eventRow}>
              <Text style={styles.eventTitle}>{ev.titulo}</Text>
              <Text style={styles.eventTime}>🕐 {ev.inicio} - {ev.fim}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthTitle: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 4, justifyContent: 'center' },
  tab: { borderWidth: 1, borderColor: colors.dark, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 18 },
  tabActive: { backgroundColor: colors.dark2, borderColor: colors.dark2 },
  tabText: { color: colors.dark, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  turmaLabel: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 6 },
  table: { marginTop: 14, marginBottom: 10 },
  row: { flexDirection: 'row' },
  headCell: { flex: 1, textAlign: 'center', color: colors.muted, fontSize: 12, paddingVertical: 6 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  dayToday: { backgroundColor: colors.light, borderRadius: 999 },
  daySelecionado: { backgroundColor: colors.dark2, borderRadius: 999 },
  dayText: { fontSize: 13, color: colors.text },
  dayOut: { color: '#b7c2ae' },
  dayTodayText: { fontWeight: '700' },
  daySelecionadoText: { fontWeight: '700', color: '#fff' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.dark2, marginTop: 2 },
  dayPanel: { backgroundColor: colors.light, borderRadius: 14, padding: 14, marginTop: 10 },
  dayPanelTitle: { fontWeight: '700', marginBottom: 8, color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  eventRow: { borderLeftWidth: 3, borderLeftColor: colors.dark2, paddingVertical: 6, paddingLeft: 10, marginBottom: 6 },
  eventTitle: { fontWeight: '700', color: colors.text },
  eventTime: { fontSize: 12, marginTop: 2, color: colors.text },
})

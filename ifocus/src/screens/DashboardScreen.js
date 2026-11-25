import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { listarEventos } from '../api/eventsApi'
import { buscarKanban } from '../api/kanbanApi'
import Header from '../components/Header'
import StudySuggestionModal from '../components/StudySuggestionModal'
import { colors } from '../theme/colors'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export default function DashboardScreen({ navigation }) {
  const [resumo, setResumo] = useState({ ativos: 0, provas: 0, proximos: 0, feitos: 0, semana: [] })
  const [sugestaoAberta, setSugestaoAberta] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const datas = Array.from({ length: 7 }, (_, indice) => {
        const dia = new Date()
        dia.setDate(dia.getDate() + indice)
        return dia
      })
      const [eventosPorDia, kanban] = await Promise.all([
        Promise.all(datas.map((dia) => listarEventos(dataISO(dia)))),
        buscarKanban(),
      ])
      const eventos = eventosPorDia.flat()
      const categorias = kanban?.categorias ?? []
      const feitos = categorias.find((categoria) => /conclu|done/i.test(`${categoria.id} ${categoria.nome}`))
      const ativos = categorias
        .filter((categoria) => !/conclu|done/i.test(`${categoria.id} ${categoria.nome}`))
        .reduce((total, categoria) => total + (categoria.itens?.length ?? 0), 0)

      setResumo({
        ativos,
        provas: eventos.filter((evento) => /prova/i.test(`${evento.tipo ?? ''} ${evento.titulo ?? ''}`)).length,
        proximos: eventos.length,
        feitos: feitos?.itens?.length ?? 0,
        semana: eventosPorDia.map((itens) => itens.length),
      })
    } catch {
      setResumo({ ativos: 0, provas: 0, proximos: 0, feitos: 0, semana: [] })
    }
  }, [])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const metricas = [
    { label: 'Trabalhos ativos', value: resumo.ativos, icon: 'document-text-outline' },
    { label: 'Provas próximas', value: resumo.provas, icon: 'reader-outline' },
    { label: 'Trabalhos próximos', value: resumo.proximos, icon: 'calendar-outline' },
    { label: 'Trabalhos feitos', value: resumo.feitos, icon: 'flag-outline' },
  ]
  const maximo = Math.max(1, ...resumo.semana)

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Dashboard</Text>
        <View style={styles.metrics}>
          {metricas.map((metrica) => (
            <View style={styles.metric} key={metrica.label}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>{metrica.label}</Text>
                <Ionicons name={metrica.icon} size={19} color={colors.dark} />
              </View>
              <Text style={styles.metricValue}>{metrica.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chart}>
          <Ionicons name="image-outline" size={18} color={colors.dark} style={styles.chartIcon} />
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              {[20, 16, 12, 8, 4, 0].map((valor) => <Text style={styles.axisLabel} key={valor}>{valor}</Text>)}
            </View>
            <View style={styles.plot}>
              {DIAS.map((dia, indice) => {
                const quantidade = resumo.semana[indice] ?? 0
                return (
                  <View style={styles.barColumn} key={`${dia}-${indice}`}>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: `${quantidade === 0 ? 0 : Math.max(3, (quantidade / maximo) * 100)}%`, minHeight: quantidade ? 3 : 0 }]} />
                    </View>
                    <Text style={styles.dayLabel}>{dia}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.suggest} onPress={() => setSugestaoAberta(true)}>
          <Text style={styles.suggestText}>Sugerir horário</Text>
        </TouchableOpacity>
      </ScrollView>
      <StudySuggestionModal visible={sugestaoAberta} onClose={() => setSugestaoAberta(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  eyebrow: { color: colors.dark, fontSize: 12, fontWeight: '600', marginBottom: 14 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  metric: { width: '48.5%', minHeight: 74, padding: 10, backgroundColor: colors.light, borderRadius: 5, elevation: 2 },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  metricLabel: { color: colors.muted, fontSize: 12 },
  metricValue: { color: colors.text, fontSize: 19, marginTop: 1 },
  chart: { height: 300, marginTop: 10, padding: 14, backgroundColor: colors.light, borderRadius: 5, elevation: 2 },
  chartIcon: { alignSelf: 'flex-end' },
  chartBody: { flex: 1, flexDirection: 'row', paddingTop: 18, paddingBottom: 12 },
  yAxis: { width: 26, justifyContent: 'space-between', alignItems: 'center' },
  axisLabel: { fontSize: 9, color: colors.text },
  plot: { flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.muted, paddingHorizontal: 2 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { width: 1, flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31,56,23,0.16)' },
  bar: { width: 16, alignSelf: 'center', backgroundColor: colors.dark, minHeight: 3 },
  dayLabel: { position: 'absolute', bottom: -16, fontSize: 9, color: colors.text, transform: [{ rotate: '-35deg' }] },
  suggest: { minHeight: 56, marginTop: 10, borderRadius: 5, backgroundColor: colors.light, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  suggestText: { color: colors.text, fontSize: 16, fontWeight: '600' },
})
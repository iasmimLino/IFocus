import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'
import { buscarEstatisticas } from '../api/statsApi'
import Header from '../components/Header'
import { colors } from '../theme/colors'

const PERIODOS = [
  { id: '1d', label: '1 dia' },
  { id: '1s', label: '1 semana' },
  { id: '2s', label: '2 semana' },
  { id: '3s', label: '3 semana' },
  { id: '1m', label: '1 mês' },
]

const CHART_W = 320
const CHART_H = 110

// Converte uma série de números em pontos "x,y" dentro do viewBox do gráfico.
function paraPontos(serie, min, max) {
  return serie
    .map((v, i) => {
      const x = serie.length === 1 ? CHART_W / 2 : (i / (serie.length - 1)) * CHART_W
      const y = CHART_H - 10 - ((v - min) / (max - min || 1)) * (CHART_H - 20)
      return `${x},${y}`
    })
    .join(' ')
}

export default function EstatisticasScreen({ navigation }) {
  const [dados, setDados] = useState(null)
  const [periodo, setPeriodo] = useState('1d')

  useFocusEffect(useCallback(() => {
    let ativo = true
    setDados(null)
    buscarEstatisticas(periodo).then((resultado) => { if (ativo) setDados(resultado) })
    return () => { ativo = false }
  }, [periodo]))

  if (!dados) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={{ padding: 20 }}>Carregando...</Text>
      </View>
    )
  }

  const todosValores = dados.materias.flatMap((m) => m.serie)
  const max = Math.max(1, ...todosValores)
  const min = Math.min(0, ...todosValores)

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Estatísticas</Text>
          <Text style={styles.muted}>Painel de Análises</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {PERIODOS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, periodo === p.id && styles.chipActive]}
              onPress={() => setPeriodo(p.id)}
            >
              <Text style={[styles.chipText, periodo === p.id && styles.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow}>
          {dados.materias.map((m) => (
            <View style={styles.card} key={m.id ?? m.nome}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.dot, { backgroundColor: m.cor }]} />
                <Text style={styles.cardTitle}>{m.nome}</Text>
              </View>
              <View style={styles.cardRow}><Text style={styles.cardLabel}>Para Fazer</Text><Text>{m.paraFazer}</Text></View>
              <View style={styles.cardRow}><Text style={styles.cardLabel}>Total Hr.</Text><Text>{m.totalHr}</Text></View>
              <View style={styles.cardRow}><Text style={styles.cardLabel}>Feitas</Text><Text>{m.feitas}</Text></View>
            </View>
          ))}
        </ScrollView>

        {dados.materias.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Cadastre uma matéria e associe atividades a ela para acompanhar seus estudos.</Text>
          </View>
        ) : (
          <View style={styles.chartCard}>
            <View style={styles.legendRow}>
              {dados.materias.map((m) => (
                <View style={styles.legendItem} key={m.id ?? m.nome}>
                  <View style={[styles.dot, { backgroundColor: m.cor }]} />
                  <Text style={styles.legendText}>{m.nome}</Text>
                </View>
              ))}
            </View>

            <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
              {dados.materias.map((m) => (
                <Polyline
                  key={m.id ?? m.nome}
                  points={paraPontos(m.serie, min, max)}
                  fill="none"
                  stroke={m.cor}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </Svg>

            <View style={styles.axisRow}>
              {dados.datas.map((d, indice) => (
                <Text key={`${d}-${indice}`} style={styles.axisLabel}>{d}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 12 },
  chipRow: { marginVertical: 12 },
  chip: { borderWidth: 1, borderColor: colors.dark, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  chipActive: { backgroundColor: colors.dark2, borderColor: colors.dark2 },
  chipText: { color: colors.dark, fontSize: 13 },
  chipTextActive: { color: '#fff' },
  cardsRow: { marginBottom: 16 },
  card: { backgroundColor: colors.light, borderRadius: 12, padding: 12, minWidth: 150, marginRight: 10 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardTitle: { fontWeight: '700' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  cardLabel: { fontSize: 12, color: colors.muted },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chartCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, color: colors.text },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 9, color: colors.muted },
  emptyState: { padding: 18, borderRadius: 12, backgroundColor: '#fff' },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
})

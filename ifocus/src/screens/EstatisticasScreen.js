import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import Svg, { Defs, Path, Pattern, Polyline, Rect } from 'react-native-svg'
import { buscarEstatisticas } from '../api/statsApi'
import Header from '../components/Header'
import { colors } from '../theme/colors'

const PERIODOS = [
  { id: '1d', label: '1 dia' },
  { id: '1s', label: '1 semana' },
  { id: '2s', label: '2 semanas' },
  { id: '3s', label: '3 semanas' },
  { id: '1m', label: '1 mês' },
]

const CHART_W = 320
const CHART_H = 100
const VERDE = '#1C3F1E'
const VERDE_CLARO = '#B5D99A'
const FUNDO = '#F4F8EB'
const CORES_SERIE = ['#1C3F1E', '#7CAD63', '#315D34', '#9BC783', '#547A4B']

function paraPontos(serie, min, max) {
  if (!serie.length) return ''
  return serie
    .map((valor, indice) => {
      const x = serie.length === 1 ? CHART_W / 2 : (indice / (serie.length - 1)) * CHART_W
      const y = CHART_H - 8 - ((valor - min) / (max - min || 1)) * (CHART_H - 16)
      return `${x},${y}`
    })
    .join(' ')
}

function segundosDeDuracao(valor) {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  if (typeof valor !== 'string') return null

  const padraoHora = valor.trim().match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
  if (padraoHora) {
    const horas = Number(padraoHora[1])
    const minutos = Number(padraoHora[2])
    const segundos = Number(padraoHora[3] ?? 0)
    return horas * 3600 + minutos * 60 + segundos
  }

  const padraoHoraCompacta = valor.trim().match(/^(\d+)h(\d+)$/i)
  if (padraoHoraCompacta) return Number(padraoHoraCompacta[1]) * 3600 + Number(padraoHoraCompacta[2]) * 60

  const padraoTexto = valor.trim().match(/^(?:(\d+)h)?(?:(\d+)min)?$/i)
  if (padraoTexto && (padraoTexto[1] || padraoTexto[2])) {
    return Number(padraoTexto[1] ?? 0) * 3600 + Number(padraoTexto[2] ?? 0) * 60
  }
  return null
}

function segundosMateria(materia) {
  const total = segundosDeDuracao(materia.totalHr)
  if (total !== null) return Math.max(0, total)
  if (!Array.isArray(materia.serie)) return 0
  return materia.serie.reduce((soma, valor) => soma + (Number(valor) || 0) * 60, 0)
}

function formatarDuracao(materia) {
  const total = segundosDeDuracao(materia.totalHr)
  const segundos = total !== null
    ? Math.max(0, Math.floor(total))
    : Array.isArray(materia.serie)
      ? Math.max(0, Math.floor(materia.serie.reduce((soma, valor) => soma + (Number(valor) || 0) * 60, 0)))
      : null
  if (segundos === null) return '—'
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const resto = segundos % 60
  return `${horas}:${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

function BarraTempo({ cor, progresso, id }) {
  const largura = progresso > 0 ? Math.max(2, Math.min(100, progresso)) : 0
  return (
    <Svg width="100%" height={12} viewBox="0 0 100 12" preserveAspectRatio="none">
      <Defs>
        <Pattern id={`hachura-${id}`} width={6} height={10} patternUnits="userSpaceOnUse">
          <Path d="M-2 10 L8 0 M4 14 L14 4" stroke="#90B978" strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={100} height={12} rx={6} fill="#E4EED9" />
      {largura > 0 && <Rect x={0} y={0} width={largura} height={12} rx={6} fill={cor} />}
      {largura < 100 && (
        <Rect x={largura} y={0} width={100 - largura} height={12} fill={`url(#hachura-${id})`} />
      )}
    </Svg>
  )
}

export default function EstatisticasScreen({ navigation }) {
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [periodo, setPeriodo] = useState('1d')
  const [tentativa, setTentativa] = useState(0)
  const { width } = useWindowDimensions()

  useFocusEffect(useCallback(() => {
    let ativo = true
    setCarregando(true)
    setErro('')
    setDados(null)
    buscarEstatisticas(periodo)
      .then((resultado) => {
        if (!Array.isArray(resultado?.materias) || !Array.isArray(resultado?.datas)) {
          throw new Error('O serviço de estatísticas retornou dados inválidos.')
        }
        if (ativo) setDados(resultado)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar as estatísticas. Verifique a conexão e tente novamente.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => { ativo = false }
  }, [periodo, tentativa]))

  const materias = Array.isArray(dados?.materias) ? dados.materias : []
  const datas = Array.isArray(dados?.datas) ? dados.datas : []
  const series = materias.map((materia) => Array.isArray(materia.serie) ? materia.serie.map(Number).filter(Number.isFinite) : [])
  const todosValores = series.flat()
  const maximoSerie = Math.max(1, ...todosValores)
  const minimoSerie = Math.min(0, ...todosValores)
  const duracoes = materias.map(segundosMateria)
  const maiorDuracao = Math.max(0, ...duracoes)
  const periodoSelecionado = PERIODOS.find((item) => item.id === periodo)?.label ?? 'período selecionado'
  const larguraCartao = Math.min(220, Math.max(172, width * 0.53))
  const descricaoPeriodo = periodo === '1d' ? 'Hoje' : `Últimos ${periodoSelecionado}`

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Estatísticas" compact backgroundColor={FUNDO} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>DESEMPENHO</Text>
        <Text style={styles.title}>Tempo por matéria</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
          {PERIODOS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.chip, periodo === item.id && styles.chipActive]}
              onPress={() => setPeriodo(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: periodo === item.id }}
            >
              <Text style={[styles.chipText, periodo === item.id && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {carregando ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color={VERDE} />
            <Text style={styles.stateText}>Carregando estatísticas...</Text>
          </View>
        ) : erro ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>{erro}</Text>
            <TouchableOpacity onPress={() => setTentativa((valor) => valor + 1)} accessibilityRole="button">
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsRow} contentContainerStyle={styles.cardContent}>
              {materias.length > 0 ? materias.map((materia, indice) => {
                const cor = materia.cor || CORES_SERIE[indice % CORES_SERIE.length]
                const contagens = [
                  { label: 'Para fazer', valor: materia.paraFazer },
                  { label: 'Fazendo', valor: materia.emAndamento ?? materia.fazendo },
                  { label: 'Feitas', valor: materia.feitas },
                ]
                return (
                  <View style={[styles.subjectCard, { width: larguraCartao }]} key={materia.id ?? materia.nome}>
                    <View style={styles.cardTitleRow}>
                      <View style={[styles.dot, { backgroundColor: cor }]} />
                      <Text style={styles.cardTitle} numberOfLines={1}>{materia.nome}</Text>
                    </View>
                    <Text style={styles.totalLabel}>Tempo total</Text>
                    <Text style={styles.totalTime}>{formatarDuracao(materia)}</Text>
                    <View style={styles.countRow}>
                      {contagens.map((contagem) => (
                        <View style={styles.countBox} key={contagem.label}>
                          <Text style={styles.countValue}>{contagem.valor ?? '—'}</Text>
                          <Text style={styles.countLabel} numberOfLines={1}>{contagem.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              }) : (
                <View style={[styles.subjectCard, styles.emptySubjectCard, { width: larguraCartao }]}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.dot, styles.emptyDot]} />
                    <Text style={styles.cardTitle}>Nenhuma matéria disponível</Text>
                  </View>
                  <Text style={styles.totalLabel}>Tempo total</Text>
                  <Text style={styles.totalTime}>—</Text>
                  <View style={styles.countRow}>
                    {['Para fazer', 'Fazendo', 'Feitas'].map((label) => (
                      <View style={styles.countBox} key={label}>
                        <Text style={styles.countValue}>—</Text>
                        <Text style={styles.countLabel} numberOfLines={1}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.timeChart}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Tempo de estudo</Text>
                  <Text style={styles.chartSubtitle}>{descricaoPeriodo} · {periodoSelecionado}</Text>
                </View>
              </View>
              {materias.length > 0 ? materias.map((materia, indice) => {
                const cor = materia.cor || CORES_SERIE[indice % CORES_SERIE.length]
                const progresso = maiorDuracao > 0 ? (duracoes[indice] / maiorDuracao) * 100 : 0
                return (
                  <View style={styles.subjectBar} key={materia.id ?? materia.nome}>
                    <View style={styles.subjectBarHeader}>
                      <View style={styles.subjectName}>
                        <View style={[styles.dot, { backgroundColor: cor }]} />
                        <Text style={styles.subjectBarLabel} numberOfLines={1}>{materia.nome}</Text>
                      </View>
                      <Text style={styles.subjectTime}>{formatarDuracao(materia)}</Text>
                    </View>
                    <BarraTempo cor={cor} progresso={progresso} id={indice} />
                  </View>
                )
              }) : (
                <View style={styles.emptyTimeRow}>
                  <View style={styles.subjectBarHeader}>
                    <Text style={styles.subjectBarLabel}>Sem matérias para exibir</Text>
                    <Text style={styles.subjectTime}>—</Text>
                  </View>
                  <BarraTempo cor="#A8B69E" progresso={0} id="vazio" />
                </View>
              )}
            </View>

            <View style={styles.trendCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Evolução do período</Text>
                  <Text style={styles.chartSubtitle}>Tempo de estudo por matéria</Text>
                </View>
              </View>
              {materias.length > 0 ? <View style={styles.legendRow}>
                {materias.map((materia, indice) => (
                  <View style={styles.legendItem} key={materia.id ?? materia.nome}>
                    <View style={[styles.dot, { backgroundColor: materia.cor || CORES_SERIE[indice % CORES_SERIE.length] }]} />
                    <Text style={styles.legendText} numberOfLines={1}>{materia.nome}</Text>
                  </View>
                ))}
              </View> : (
                <Text style={styles.emptyChartText}>Sem registros de estudo neste período.</Text>
              )}
              <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
                <Path d={`M0 25 H${CHART_W} M0 50 H${CHART_W} M0 75 H${CHART_W}`} stroke="#E4EED9" strokeWidth={1} />
                {materias.map((materia, indice) => (
                  <Polyline
                    key={materia.id ?? materia.nome}
                    points={paraPontos(series[indice], minimoSerie, maximoSerie)}
                    fill="none"
                    stroke={materia.cor || CORES_SERIE[indice % CORES_SERIE.length]}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </Svg>
              <View style={styles.axisRow}>
                {datas.map((data, indice) => (
                  <Text key={`${data}-${indice}`} style={styles.axisLabel}>{data}</Text>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  content: { paddingHorizontal: 14, paddingTop: 3, paddingBottom: 128 },
  eyebrow: { color: '#596653', fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  title: { color: VERDE, fontSize: 15, lineHeight: 20, fontWeight: '800', marginBottom: 2 },
  chipRow: { marginHorizontal: -14, marginBottom: 9 },
  chipContent: { paddingHorizontal: 14, gap: 6 },
  chip: { minHeight: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 13, backgroundColor: '#fff' },
  chipActive: { backgroundColor: VERDE, borderColor: VERDE },
  chipText: { color: VERDE, fontSize: 9, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  cardsRow: { marginHorizontal: -14, marginBottom: 9 },
  cardContent: { paddingHorizontal: 14, gap: 8 },
  subjectCard: { minHeight: 116, padding: 10, borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 15, backgroundColor: '#fff' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3 },
  cardTitle: { flex: 1, color: '#303530', fontSize: 10, fontWeight: '700' },
  totalLabel: { color: '#727A70', fontSize: 8, marginTop: 8 },
  totalTime: { color: VERDE, fontSize: 17, lineHeight: 20, fontWeight: '800', marginTop: 1 },
  countRow: { flexDirection: 'row', gap: 4, marginTop: 7 },
  countBox: { flex: 1, minWidth: 0, minHeight: 28, justifyContent: 'center', paddingHorizontal: 5, borderRadius: 7, backgroundColor: '#E4EED9' },
  countValue: { color: VERDE, fontSize: 9, fontWeight: '700' },
  countLabel: { color: '#52624E', fontSize: 7, lineHeight: 9 },
  timeChart: { padding: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 15 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { color: '#303530', fontSize: 11, fontWeight: '700' },
  chartSubtitle: { color: '#727A70', fontSize: 8, marginTop: 2 },
  subjectBar: { marginTop: 10 },
  subjectBarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  subjectName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  subjectBarLabel: { color: '#303530', fontSize: 9, fontWeight: '600' },
  subjectTime: { color: VERDE, fontSize: 9, fontWeight: '700', marginLeft: 8 },
  trendCard: { marginTop: 9, padding: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 15 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 9, marginBottom: 7 },
  legendItem: { maxWidth: '48%', flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { color: colors.text, fontSize: 8 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  axisLabel: { color: colors.muted, fontSize: 7 },
  stateCard: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 15 },
  stateText: { color: '#727A70', fontSize: 10 },
  errorText: { color: '#A33B35', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  retryText: { color: VERDE, fontSize: 10, fontWeight: '700' },
  emptySubjectCard: { justifyContent: 'center' },
  emptyDot: { backgroundColor: '#B9C9AF' },
  emptyTimeRow: { marginTop: 10 },
  emptyChartText: { color: '#727A70', fontSize: 9, marginTop: 8 },
})

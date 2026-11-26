import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { listarEventos } from '../api/eventsApi'
import { buscarKanban } from '../api/kanbanApi'
import Header from '../components/Header'
import StudySuggestionModal from '../components/StudySuggestionModal'
import { colors } from '../theme/colors'

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const VERDE = '#1C3F1E'
const VERDE_CLARO = '#B5D99A'
const FUNDO = '#F4F8EB'
const ICONE_FUNDO = '#E4EED9'

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function eventoConcluido(evento) {
  if (evento.concluido === true || evento.completed === true) return true
  return /conclu|done|feita|finaliz/i.test(`${evento.statusKanban ?? ''} ${evento.status ?? ''}`)
}

function contarEventos(eventos) {
  return eventos.reduce((contagem, evento) => {
    if (eventoConcluido(evento)) contagem.concluidas += 1
    else contagem.pendentes += 1
    return contagem
  }, { concluidas: 0, pendentes: 0 })
}

function Hachurado() {
  return (
    <View style={[styles.hatchWrap, { pointerEvents: 'none' }]}>
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={[styles.hatchLine, { left: index * 6 }]} />
      ))}
    </View>
  )
}

export default function DashboardScreen({ navigation }) {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [sugestaoAberta, setSugestaoAberta] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const primeiroDia = new Date(hoje)
      primeiroDia.setDate(primeiroDia.getDate() - primeiroDia.getDay())
      const datasSemana = Array.from({ length: 7 }, (_, indice) => {
        const dia = new Date(primeiroDia)
        dia.setDate(dia.getDate() + indice)
        return dia
      })
      const datasProximas = Array.from({ length: 7 }, (_, indice) => {
        const dia = new Date(hoje)
        dia.setDate(dia.getDate() + indice)
        return dia
      })
      const datasUnicas = [...new Map([...datasSemana, ...datasProximas].map((dia) => [dataISO(dia), dia])).values()]
      const [eventosUnicos, kanban] = await Promise.all([
        Promise.all(datasUnicas.map((dia) => listarEventos(dataISO(dia)))),
        buscarKanban(),
      ])
      const eventosPorData = new Map(datasUnicas.map((dia, indice) => [dataISO(dia), eventosUnicos[indice]]))
      const eventosPorDia = datasSemana.map((dia) => eventosPorData.get(dataISO(dia)) ?? [])
      const eventosFuturos = datasProximas.flatMap((dia) => eventosPorData.get(dataISO(dia)) ?? [])
      const categorias = kanban?.categorias ?? []
      const categoriaFeita = (categoria) => /conclu|done/i.test(`${categoria.id} ${categoria.nome}`)
      const feitos = categorias.find(categoriaFeita)
      const ativos = categorias
        .filter((categoria) => !categoriaFeita(categoria))
        .reduce((total, categoria) => total + (categoria.itens?.length ?? 0), 0)

      setResumo({
        ativos,
        provas: eventosFuturos.filter((evento) => /prova/i.test(`${evento.tipo ?? ''} ${evento.titulo ?? ''}`)).length,
        proximos: eventosFuturos.length,
        feitos: feitos?.itens?.length ?? 0,
        semana: eventosPorDia.map(contarEventos),
      })
    } catch {
      setErro('Não foi possível carregar os dados do Dashboard. Verifique a conexão e tente novamente.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { carregar() }, [carregar]))

  const metricas = [
    { label: 'Trabalhos ativos', value: resumo?.ativos, icon: 'document-text-outline' },
    { label: 'Provas próximas', value: resumo?.provas, icon: 'reader-outline' },
    { label: 'Trabalhos próximos', value: resumo?.proximos, icon: 'calendar-outline' },
    { label: 'Trabalhos feitos', value: resumo?.feitos, icon: 'flag-outline' },
  ]
  const maximo = Math.max(1, ...(resumo?.semana ?? []).map((dia) => dia.concluidas + dia.pendentes))

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Dashboard" compact backgroundColor={FUNDO} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>RESUMO</Text>
        <Text style={styles.heading}>Seus trabalhos e provas</Text>

        <View style={styles.metrics}>
          {metricas.map((metrica) => (
            <View style={styles.metric} key={metrica.label}>
              <View style={styles.metricTop}>
                <View style={styles.metricIcon}>
                  <Ionicons name={metrica.icon} size={15} color={VERDE} />
                </View>
                <Text style={styles.metricLabel} numberOfLines={2}>{metrica.label}</Text>
              </View>
              <Text style={styles.metricValue}>{metrica.value ?? '—'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chart}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Atividades da semana</Text>
              <Text style={styles.chartSubtitle}>Dom – Sáb</Text>
            </View>
            <TouchableOpacity
              style={styles.analysisButton}
              onPress={() => navigation.navigate('Análises')}
              accessibilityRole="button"
              accessibilityLabel="Abrir análises"
            >
              <Text style={styles.analysisButtonText}>Análises</Text>
              <Ionicons name="chevron-forward" size={15} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: VERDE }]} />
              <Text style={styles.legendText}>Concluídas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: VERDE_CLARO }]} />
              <Text style={styles.legendText}>Pendentes</Text>
            </View>
          </View>

          {carregando && !resumo ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="small" color={VERDE} />
              <Text style={styles.chartEmptyText}>Carregando atividades...</Text>
            </View>
          ) : erro ? (
            <View style={styles.chartLoading}>
              <Text style={styles.chartError}>{erro}</Text>
              <TouchableOpacity onPress={carregar} accessibilityRole="button">
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.chartBars}>
                {DIAS.map((dia, indice) => {
                  const contagem = resumo?.semana[indice] ?? { concluidas: 0, pendentes: 0 }
                  const total = contagem.concluidas + contagem.pendentes
                  const altura = total ? Math.max(12, (total / maximo) * 100) : 0
                  const alturaConcluidas = total ? `${(contagem.concluidas / total) * 100}%` : '0%'
                  const alturaPendentes = total ? `${(contagem.pendentes / total) * 100}%` : '0%'

                  return (
                    <View style={styles.barColumn} key={`${dia}-${indice}`}>
                      <Text style={styles.barValue}>{total ? `${contagem.concluidas}/${contagem.pendentes}` : '0'}</Text>
                      <View style={styles.barTrack}>
                        {!!total && (
                          <View style={[styles.barStack, { height: `${altura}%` }]}>
                            <View style={[styles.barPending, { height: alturaPendentes }]}>
                              <Hachurado />
                            </View>
                            <View style={[styles.barComplete, { height: alturaConcluidas }]} />
                          </View>
                        )}
                      </View>
                      <Text style={styles.dayLabel}>{dia}</Text>
                    </View>
                  )
                })}
              </View>
              {!!resumo && resumo.semana.every((dia) => dia.concluidas + dia.pendentes === 0) && (
                <Text style={styles.chartEmptyText}>Nenhuma atividade registrada nesta semana.</Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.suggest} onPress={() => setSugestaoAberta(true)} accessibilityRole="button">
          <Ionicons name="sparkles-outline" size={17} color={VERDE} />
          <Text style={styles.suggestText}>Sugerir horário de estudo</Text>
          <Ionicons name="chevron-forward" size={16} color={VERDE} />
        </TouchableOpacity>
      </ScrollView>
      <StudySuggestionModal visible={sugestaoAberta} onClose={() => setSugestaoAberta(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 128 },
  eyebrow: { color: '#596653', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  heading: { color: VERDE, fontSize: 16, lineHeight: 21, fontWeight: '800', marginBottom: 9 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  metric: { width: '48.7%', minHeight: 70, justifyContent: 'space-between', padding: 9, backgroundColor: '#fff', borderColor: '#E1EBD8', borderWidth: 1, borderRadius: 14, elevation: 1 },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metricIcon: { width: 22, height: 22, borderRadius: 7, backgroundColor: ICONE_FUNDO, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { flex: 1, color: '#606660', fontSize: 9, lineHeight: 12 },
  metricValue: { color: VERDE, fontSize: 18, lineHeight: 22, fontWeight: '800', marginTop: 2 },
  chart: { marginTop: 10, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E1EBD8', borderRadius: 16, elevation: 1 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { color: '#303530', fontSize: 12, fontWeight: '700' },
  chartSubtitle: { color: '#727A70', fontSize: 9, marginTop: 1 },
  analysisButton: { minHeight: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 9, borderRadius: 13, backgroundColor: VERDE },
  analysisButtonText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 8, height: 8, borderRadius: 3 },
  legendText: { color: '#606660', fontSize: 8 },
  chartBars: { height: 144, flexDirection: 'row', marginTop: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#D5E4C8' },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { color: VERDE, fontSize: 8, fontWeight: '600', marginBottom: 3 },
  barTrack: { width: '100%', height: 112, alignItems: 'center', justifyContent: 'flex-end' },
  barStack: { width: 22, maxHeight: 100, overflow: 'hidden', borderRadius: 12, backgroundColor: VERDE_CLARO },
  barPending: { position: 'relative', width: '100%', backgroundColor: '#D9EACD' },
  hatchWrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  hatchLine: { position: 'absolute', top: -8, width: 0, height: 120, borderRightWidth: 1, borderColor: 'rgba(49, 111, 47, 0.35)', transform: [{ rotate: '38deg' }] },
  barComplete: { width: '100%', backgroundColor: VERDE },
  dayLabel: { color: '#606660', fontSize: 8, marginTop: 4, marginBottom: 2 },
  chartLoading: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 10 },
  chartEmptyText: { color: '#727A70', fontSize: 10, textAlign: 'center', marginTop: 8 },
  chartError: { color: '#A33B35', fontSize: 10, lineHeight: 15, textAlign: 'center' },
  retryText: { color: VERDE, fontSize: 10, fontWeight: '700' },
  suggest: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: '#E4EED9' },
  suggestText: { flex: 1, color: VERDE, fontSize: 11, fontWeight: '700' },
})

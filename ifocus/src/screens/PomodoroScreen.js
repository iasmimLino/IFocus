import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { buscarConfig, salvarConfig, encerrarSessao, iniciarNovaSessao } from '../api/pomodoroApi'
import Header from '../components/Header'
import PomodoroConfigModal from '../components/PomodoroConfigModal'
import { colors } from '../theme/colors'

function formatar(segundos) {
  const s = Math.max(0, segundos)
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${m} : ${ss}`
}

const RAIO = 88
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

// A associação do Pomodoro a matérias está pausada; registrarEstudo permanece disponível para uma integração futura.

/**
 * Fluxo de uma sessão de estudo (Pomodoro):
 *   etapa 1: foco -> etapa 2: relaxamento -> etapa 3: foco -> ...
 *   até `etapas` no total.
 * Ao terminar a última etapa de uma sessão, a PRÓXIMA sessão começa
 * automaticamente (sessões "encadeadas"), sem precisar apertar Iniciar
 * de novo. O botão "Encerrar" continua disponível pra parar tudo na
 * hora, manualmente.
 */
export default function PomodoroScreen({ navigation }) {
  const [config, setConfig] = useState(null)
  const [status, setStatus] = useState('parado') // parado | rodando | encerrada
  const [etapaAtual, setEtapaAtual] = useState(1) // 1-indexed
  const [restante, setRestante] = useState(0)
  const [configAberta, setConfigAberta] = useState(false)
  const intervalRef = useRef(null)
  const avancandoEtapaRef = useRef(false)

  useEffect(() => {
    buscarConfig().then((c) => {
      setConfig(c)
      setRestante(c.tempoFoco)
    })
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (status !== 'rodando') return
    intervalRef.current = setInterval(() => {
      setRestante((r) => {
        if (r > 1) return r - 1
        if (!avancandoEtapaRef.current) {
          avancandoEtapaRef.current = true
          avancarEtapa()
            .catch(() => {})
            .finally(() => { avancandoEtapaRef.current = false })
        }
        return 0
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [status, etapaAtual, config])

  async function avancarEtapa() {
    clearInterval(intervalRef.current)
    const proxima = etapaAtual + 1

    if (config.etapas && proxima > config.etapas) {
      // sessão atual terminou -> encadeia direto na próxima sessão
      const novoConfig = await iniciarNovaSessao()
      setConfig(novoConfig)
      setEtapaAtual(1)
      setRestante(novoConfig.tempoFoco)
      return
    }

    const emFoco = proxima % 2 === 1
    setEtapaAtual(proxima)
    setRestante(emFoco ? config.tempoFoco : config.tempoRelaxamento)
  }

  async function handleEncerrar() {
    clearInterval(intervalRef.current)
    await encerrarSessao(config?.sessaoAtual)
    setStatus('encerrada')
  }

  function handleIniciar() {
    setEtapaAtual(1)
    setRestante(config.tempoFoco)
    setStatus('rodando')
  }

  async function handleNovaSessaoManual() {
    const novoConfig = await iniciarNovaSessao()
    setConfig(novoConfig)
    setEtapaAtual(1)
    setRestante(novoConfig.tempoFoco)
    setStatus('rodando')
  }

  async function handleSalvarConfig(novosValores) {
    const atualizado = await salvarConfig(novosValores)
    const duracaoAnterior = etapaAtual % 2 === 1 ? config.tempoFoco : config.tempoRelaxamento
    const duracaoNova = etapaAtual % 2 === 1 ? atualizado.tempoFoco : atualizado.tempoRelaxamento
    setConfig(atualizado)
    setRestante((valor) => status === 'rodando'
      ? Math.max(1, valor + duracaoNova - duracaoAnterior)
      : atualizado.tempoFoco)
    setConfigAberta(false)
  }

  if (!config) {
    return (
      <View style={styles.container}>
        <Header navigation={navigation} />
        <Text style={{ padding: 20 }}>Carregando...</Text>
      </View>
    )
  }

  const emFoco = etapaAtual % 2 === 1
  const duracaoEtapa = emFoco ? config.tempoFoco : config.tempoRelaxamento
  const progresso = duracaoEtapa ? restante / duracaoEtapa : 0
  const offset = status === 'encerrada' ? 0 : CIRCUNFERENCIA * progresso

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.sessionTitle}>Sessão de Estudos #{config.sessaoAtual}</Text>
          <TouchableOpacity onPress={() => setConfigAberta(true)} hitSlop={10} accessibilityLabel="Editar duração da sessão">
            <Ionicons name="pencil" size={16} color={colors.dark} />
          </TouchableOpacity>
        </View>
        {status === 'rodando' && (
          <Text style={styles.stepLabel}>
            Etapa {etapaAtual}{config.etapas ? `/${config.etapas}` : ''} · {emFoco ? 'foco' : 'relaxamento'}
          </Text>
        )}

        {status === 'rodando' && (
          <TouchableOpacity style={styles.pillSolid} onPress={handleEncerrar}>
            <Text style={styles.pillSolidText}>Encerrar</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.progressText}>
          {status !== 'encerrada'
            ? `${formatar(duracaoEtapa - restante)} / ${Math.round(duracaoEtapa / 60)}m 00s`
            : `${Math.round(config.tempoFoco / 60)}m 00s`}
        </Text>

        <View style={styles.ringWrap}>
          <Svg width={220} height={220} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r={RAIO} stroke={colors.light} strokeWidth={14} fill="none" />
            <Circle
              cx="100"
              cy="100"
              r={RAIO}
              stroke={emFoco ? colors.dark2 : colors.mid}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUNFERENCIA} ${CIRCUNFERENCIA}`}
              strokeDashoffset={offset}
              rotation="-90"
              origin="100, 100"
            />
          </Svg>
          <View style={styles.ringCenter}>
            {status === 'parado' && (
              <TouchableOpacity onPress={handleIniciar}>
                <Text style={styles.startText}>Iniciar</Text>
              </TouchableOpacity>
            )}
            {status === 'rodando' && (
              <Text style={styles.clockText}>
                {formatar(restante)}
                {'\n'}
                <Text style={styles.clockSub}>{emFoco ? 'estude' : 'relaxe'}</Text>
              </Text>
            )}
            {status === 'encerrada' && <Text style={styles.clockText}>Sessão{'\n'}Encerrada</Text>}
          </View>
        </View>

        {status === 'encerrada' && (
          <TouchableOpacity style={styles.novaSessaoBtn} onPress={handleNovaSessaoManual}>
            <Text style={styles.novaSessaoText}>Iniciar nova sessão</Text>
          </TouchableOpacity>
        )}

        <View style={styles.meta}>
          <View style={styles.metaRow}><Text>Tempo de Etapas de Foco</Text><Text style={styles.metaValue}>{formatar(config.tempoFoco)}</Text></View>
          <View style={styles.metaRow}><Text>Tempo de Etapas de Relaxamento</Text><Text style={styles.metaValue}>{formatar(config.tempoRelaxamento)}</Text></View>
          <View style={styles.metaRow}>
            <Text>Etapas da sessão</Text>
            <Text style={styles.metaValue}>
              {config.etapas ? `${config.etapas} configuradas` : `${status === 'rodando' ? etapaAtual : Math.max(0, etapaAtual - 1)} realizadas`}
            </Text>
          </View>
        </View>
      </View>

      <PomodoroConfigModal
        visible={configAberta}
        config={config}
        onCancel={() => setConfigAberta(false)}
        onSalvar={handleSalvarConfig}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionTitle: { fontSize: 16, color: colors.text },
  stepLabel: { fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 8 },
  pillSolid: { backgroundColor: colors.dark2, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18, marginTop: 10, marginBottom: 10 },
  pillSolidText: { color: '#fff', fontSize: 13 },
  progressText: { color: colors.muted, marginBottom: 20, marginTop: 6 },
  ringWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  startText: { fontSize: 20, color: colors.dark },
  clockText: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: colors.text },
  clockSub: { fontSize: 13, fontWeight: '400', color: colors.muted },
  novaSessaoBtn: { backgroundColor: colors.dark2, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 22, marginTop: 18 },
  novaSessaoText: { color: '#fff', fontWeight: '700' },
  meta: { width: '100%', marginTop: 26 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)' },
  metaValue: { fontWeight: '700' },
})

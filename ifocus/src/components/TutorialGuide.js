import { createContext } from 'react'
import { Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Rect } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'

export const TutorialContext = createContext(null)

export const ETAPAS_TUTORIAL = [
  {
    rota: 'Painel',
    titulo: 'Dashboard',
    texto: 'Acompanhe atividades e trabalhos próximos, ativos ou concluídos. Em “Sugerir horário”, organize um período de estudo com base nos dados disponíveis.',
    destaque: 'resumo',
  },
  {
    rota: 'Cronograma',
    titulo: 'Cronograma',
    texto: 'Veja compromissos e atividades organizados por dia. Eventos com data aparecem no dia correspondente para ajudar você a saber o que precisa fazer.',
    destaque: 'agenda',
  },
  {
    rota: 'Foco',
    titulo: 'Pomodoro',
    texto: 'Organize períodos de estudo e descanso. Use o ícone de edição para personalizar a duração dos blocos conforme sua preferência.',
    destaque: 'foco',
  },
  {
    rota: 'Tarefas',
    titulo: 'Kanban',
    texto: 'Organize eventos por etapa. A seta para a direita avança a tarefa; a seta para a esquerda retorna para a etapa anterior.',
    destaque: 'kanban',
  },
  {
    rota: 'Análises',
    titulo: 'Estatísticas',
    texto: 'Acompanhe o tempo de estudo, atividades e resultados por período e matéria. Cadastre suas próprias matérias para personalizar o acompanhamento.',
    destaque: 'estatisticas',
  },
]

function areaDestaque(tipo, largura, altura) {
  if (tipo === 'foco') {
    const tamanho = Math.min(248, largura - 48, altura * 0.38)
    return { x: (largura - tamanho) / 2, y: Math.max(150, altura * 0.28), width: tamanho, height: tamanho, raio: tamanho / 2 }
  }

  const posicoes = {
    resumo: { y: 116, height: 132 },
    agenda: { y: 140, height: 180 },
    kanban: { y: 125, height: 205 },
    estatisticas: { y: 124, height: 190 },
  }
  const posicao = posicoes[tipo]
  return { x: 14, y: Math.min(posicao.y, altura - 260), width: largura - 28, height: posicao.height, raio: 13 }
}

export default function TutorialGuide({ etapa, onMudarEtapa, onFechar }) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  if (etapa == null) return null

  const atual = ETAPAS_TUTORIAL[etapa]
  const destaque = areaDestaque(atual.destaque, width, height)
  const espacamento = 12
  const left = destaque.x - espacamento
  const top = destaque.y - espacamento
  const right = destaque.x + destaque.width + espacamento
  const bottom = destaque.y + destaque.height + espacamento
  const caminho = `M0 0H${width}V${height}H0Z M${left} ${top}H${right}V${bottom}H${left}Z`
  const centroPonteiro = Math.max(38, Math.min(width - 38, destaque.x + destaque.width / 2))

  return (
    <View style={styles.overlay}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={caminho} fill="#10180e" fillOpacity={0.68} fillRule="evenodd" />
        <Rect
          x={destaque.x}
          y={destaque.y}
          width={destaque.width}
          height={destaque.height}
          rx={destaque.raio}
          fill="rgba(201,224,184,0.08)"
          stroke={colors.light2}
          strokeWidth={3}
        />
      </Svg>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} accessibilityLabel="Tutorial guiado" />
      <View style={[styles.card, { bottom: insets.bottom + 76 }]}>
        <Ionicons
          name="arrow-up"
          size={23}
          color={colors.dark2}
          style={[styles.pointer, { left: centroPonteiro - 34 }]}
        />
        <View style={styles.cardHeading}>
          <Text style={styles.stepLabel}>GUIA DO APLICATIVO · {etapa + 1}/{ETAPAS_TUTORIAL.length}</Text>
          <TouchableOpacity onPress={onFechar} accessibilityRole="button" accessibilityLabel="Pular tutorial">
            <Ionicons name="close" size={21} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{atual.titulo}</Text>
        <Text style={styles.description}>{atual.texto}</Text>
        <View style={styles.progress}>
          {ETAPAS_TUTORIAL.map((item, indice) => (
            <View key={item.rota} style={[styles.progressDot, indice === etapa && styles.progressDotActive]} />
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onFechar} accessibilityRole="button">
            <Text style={styles.skip}>Pular tutorial</Text>
          </TouchableOpacity>
          <View style={styles.navActions}>
            {etapa > 0 && (
              <TouchableOpacity style={styles.previousButton} onPress={() => onMudarEtapa(etapa - 1)} accessibilityRole="button">
                <Text style={styles.previousText}>Anterior</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => etapa === ETAPAS_TUTORIAL.length - 1 ? onFechar() : onMudarEtapa(etapa + 1)}
              accessibilityRole="button"
            >
              <Text style={styles.nextText}>{etapa === ETAPAS_TUTORIAL.length - 1 ? 'Concluir' : 'Próximo'}</Text>
              <Ionicons name={etapa === ETAPAS_TUTORIAL.length - 1 ? 'checkmark' : 'arrow-forward'} size={17} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000 },
  card: { position: 'absolute', left: 16, right: 16, backgroundColor: colors.bg, borderRadius: 10, paddingHorizontal: 18, paddingTop: 17, paddingBottom: 15, borderWidth: 1, borderColor: colors.light },
  pointer: { position: 'absolute', top: -25 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  title: { color: colors.dark, fontSize: 20, fontWeight: '700', marginTop: 4 },
  description: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 7 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  progressDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.light },
  progressDotActive: { width: 20, backgroundColor: colors.dark2 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  skip: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previousButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 10 },
  previousText: { color: colors.dark2, fontSize: 13, fontWeight: '600' },
  nextButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 14, borderRadius: 7, backgroundColor: colors.dark },
  nextText: { color: colors.white, fontSize: 13, fontWeight: '700' },
})
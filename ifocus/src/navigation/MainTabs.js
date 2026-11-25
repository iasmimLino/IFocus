import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DashboardScreen from '../screens/DashboardScreen'
import CronogramaScreen from '../screens/CronogramaScreen'
import PomodoroScreen from '../screens/PomodoroScreen'
import KanbanScreen from '../screens/KanbanScreen'
import EstatisticasScreen from '../screens/EstatisticasScreen'
import TutorialGuide, { ETAPAS_TUTORIAL, TutorialContext } from '../components/TutorialGuide'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator()

// Ícones de cada aba (vetoriais, via @expo/vector-icons — antes eram
// emojis, que ficavam quebrados/desalinhados em alguns Android).
const ICONES = {
  Painel: { ativo: 'grid', inativo: 'grid-outline' },
  Cronograma: { ativo: 'calendar', inativo: 'calendar-outline' },
  Foco: { ativo: 'timer', inativo: 'timer-outline' },
  Tarefas: { ativo: 'clipboard', inativo: 'clipboard-outline' },
  Análises: { ativo: 'bar-chart', inativo: 'bar-chart-outline' },
}

/**
 * TABS (menu inferior) — é aqui que você adiciona uma aba nova:
 *   <Tab.Screen name="NomeDaAba" component={SuaTela} />
 * Para trocar o ícone de uma aba, edite o objeto ICONES acima com o
 * nome de qualquer ícone do Ionicons (https://icons.expo.fyi).
 * O Cronograma abre a tela de Calendário via navigation.navigate('Calendario'),
 * que fica registrada no RootNavigator (stack), não aqui.
 */
function sincronizarTelaTutorial(Componente) {
  return function TelaTutorial(props) {
    const tutorial = useContext(TutorialContext)

    useEffect(() => {
      tutorial?.registrarNavegacao(props.navigation)
    }, [props.navigation, tutorial?.registrarNavegacao])

    return <Componente {...props} />
  }
}

const PainelComTutorial = sincronizarTelaTutorial(DashboardScreen)
const CronogramaComTutorial = sincronizarTelaTutorial(CronogramaScreen)
const FocoComTutorial = sincronizarTelaTutorial(PomodoroScreen)
const TarefasComTutorial = sincronizarTelaTutorial(KanbanScreen)
const AnalisesComTutorial = sincronizarTelaTutorial(EstatisticasScreen)

export default function MainTabs({ navigation: navegacaoRaiz, route }) {
  const [etapaTutorial, setEtapaTutorial] = useState(null)
  const navegacaoAbas = useRef(null)
  const registrarNavegacao = useCallback((navigation) => { navegacaoAbas.current = navigation }, [])
  const iniciarTutorial = useCallback(() => {
    setEtapaTutorial(0)
    navegacaoAbas.current?.navigate(ETAPAS_TUTORIAL[0].rota)
  }, [])
  const mudarEtapaTutorial = useCallback((indice) => {
    setEtapaTutorial(indice)
    navegacaoAbas.current?.navigate(ETAPAS_TUTORIAL[indice].rota)
  }, [])
  const contexto = useMemo(() => ({ iniciarTutorial, registrarNavegacao }), [iniciarTutorial, registrarNavegacao])

  useEffect(() => {
    if (!route.params?.iniciarTutorial) return
    iniciarTutorial()
    navegacaoRaiz.setParams({ iniciarTutorial: false })
  }, [iniciarTutorial, navegacaoRaiz, route.params?.iniciarTutorial])

  return (
    <TutorialContext.Provider value={contexto}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { backgroundColor: colors.dark, borderTopWidth: 0 },
            tabBarIcon: ({ focused }) => {
              const nomeIcone = focused ? ICONES[route.name].ativo : ICONES[route.name].inativo
              return <Ionicons name={nomeIcone} size={27} color={focused ? '#fff' : 'rgba(255,255,255,0.55)'} />
            },
          })}
        >
          <Tab.Screen name="Painel" component={PainelComTutorial} />
          <Tab.Screen name="Cronograma" component={CronogramaComTutorial} />
          <Tab.Screen name="Foco" component={FocoComTutorial} />
          <Tab.Screen name="Tarefas" component={TarefasComTutorial} />
          <Tab.Screen name="Análises" component={AnalisesComTutorial} />
        </Tab.Navigator>
        <TutorialGuide
          etapa={etapaTutorial}
          onMudarEtapa={mudarEtapaTutorial}
          onFechar={() => setEtapaTutorial(null)}
        />
      </View>
    </TutorialContext.Provider>
  )
}

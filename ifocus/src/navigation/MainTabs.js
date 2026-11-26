import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DashboardScreen from '../screens/DashboardScreen'
import CronogramaScreen from '../screens/CronogramaScreen'
import PomodoroScreen from '../screens/PomodoroScreen'
import KanbanScreen from '../screens/KanbanScreen'
import EstatisticasScreen from '../screens/EstatisticasScreen'
import TutorialGuide, { ETAPAS_TUTORIAL, TutorialContext } from '../components/TutorialGuide'
import TabBarArtwork from '../../TabBar.svg'

const Tab = createBottomTabNavigator()
const BAR_VIEWBOX_WIDTH = 424
const BAR_VIEWBOX_HEIGHT = 132
const TAB_ITEMS = [
  { route: 'Painel', label: 'Dashboard', x: 65, icon: 'home-outline' },
  { route: 'Cronograma', label: 'Cronograma', x: 139.5, icon: 'calendar-outline' },
  { route: 'Foco', label: 'Foco', x: 306.5, icon: 'timer-outline' },
  { route: 'Tarefas', label: 'Tarefas', x: 370, icon: 'list-outline' },
]

function IFocusTabBar({ state, navigation }) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const larguraArte = Math.max(280, width - 24)
  const escala = larguraArte / BAR_VIEWBOX_WIDTH
  const deslocamentoX = (width - larguraArte) / 2
  const deslocamentoY = insets.bottom
  const telaAtual = state.routes[state.index]?.name
  const itemAtivo = TAB_ITEMS.find((item) => item.route === telaAtual)

  function navegar(rota) {
    navigation.navigate(rota)
  }

  return (
    <View style={{ height: 96 + insets.bottom, position: 'relative', backgroundColor: 'transparent' }}>
      <TabBarArtwork
        width={larguraArte}
        height={larguraArte * BAR_VIEWBOX_HEIGHT / BAR_VIEWBOX_WIDTH}
        style={{ position: 'absolute', top: deslocamentoY, left: deslocamentoX }}
        pointerEvents="none"
      />

      {telaAtual !== 'Painel' && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: deslocamentoX + 42 * escala,
              top: deslocamentoY + 35 * escala,
              width: 46 * escala,
              height: 46 * escala,
              borderRadius: 23 * escala,
              backgroundColor: '#1C3E1A',
            }}
          />
          <Ionicons
            name="home-outline"
            size={18 * escala}
            color="#fff"
            style={{
              position: 'absolute',
              left: deslocamentoX + 65 * escala - 9 * escala,
              top: deslocamentoY + 58 * escala - 9 * escala,
            }}
            pointerEvents="none"
          />
        </>
      )}

      {itemAtivo && itemAtivo.route !== 'Painel' && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: deslocamentoX + (itemAtivo.x - 23) * escala,
              top: deslocamentoY + 35 * escala,
              width: 46 * escala,
              height: 46 * escala,
              borderRadius: 23 * escala,
              backgroundColor: '#ACD095',
              shadowColor: '#1C3F1E',
              shadowOpacity: 0.18,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          />
          <Ionicons
            name={itemAtivo.icon}
            size={18 * escala}
            color="#1C3E1A"
            style={{
              position: 'absolute',
              left: deslocamentoX + itemAtivo.x * escala - 9 * escala,
              top: deslocamentoY + 58 * escala - 9 * escala,
            }}
            pointerEvents="none"
          />
        </>
      )}

      {TAB_ITEMS.map((item) => (
        <Pressable
          key={item.route}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.route === telaAtual }}
          onPress={() => navegar(item.route)}
          style={{
            position: 'absolute',
            left: deslocamentoX + (item.x - 30) * escala,
            top: deslocamentoY + 31 * escala,
            width: 60 * escala,
            height: 54 * escala,
          }}
        />
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Novo compromisso"
        onPress={() => navigation.navigate('Cronograma', { abrirNovo: true })}
        style={{
          position: 'absolute',
          left: deslocamentoX + 180 * escala,
          top: deslocamentoY + 4 * escala,
          width: 64 * escala,
          height: 64 * escala,
        }}
      />
    </View>
  )
}

// A barra de arte tem quatro destinos e a ação central de criar compromisso.
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
  const insets = useSafeAreaInsets()
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
          tabBar={(props) => <IFocusTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: { height: 96 + insets.bottom, backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
          }}
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

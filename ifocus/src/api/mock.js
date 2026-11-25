import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * MODO DEMO (sem back-end)
 * ------------------------------------------------------------------
 * Simula o banco de dados usando AsyncStorage, só para o protótipo
 * rodar sozinho no celular/emulador, sem precisar do Spring no ar.
 *
 * Quando o back-end Spring estiver pronto, mude USE_MOCK para false
 * (arquivo src/api/config.js) que as chamadas passam a ir de verdade
 * para o Spring, através de client.js.
 * ------------------------------------------------------------------
 */
const KEY = 'study_app_db_v3'
const MATERIAS_DEMO = new Set(['matematica', 'portugues'])
const TAREFAS_DEMO = new Set([
  'Ler cap. 3', 'Resumo de História', 'Exercícios de Matemática', 'Revisar Inglês',
  'Ler artigo', 'Fichamento', 'Slides', 'Trabalho de Sociologia', 'Redação',
  'Projeto de Física', 'Prova de Química', 'Lista 1', 'Lista 2', 'Seminário', 'Resumo', 'Exercícios',
])
const EVENTOS_DEMO = [
  { id: 1, categoria: 'Pessoal', titulo: 'Estudar', data: '2024-02-20' },
  { id: 2, categoria: 'Escola', titulo: 'Tarefa', data: '2024-02-20' },
]

const seed = {
  user: {
    nomeCompleto: 'Usuário da Silva',
    email: 'unknow2478@gmail.com',
    senha: 'estudos123',
    cpf: '00000000000',
    pais: 'Brasil',
    cidade: 'Rondonópolis',
    anoSerie: '',
    curso: '',
  },
  users: [],
  materias: [],
  eventos: [],
  // Eventos da TURMA (visíveis a todos os alunos da turma, diferente dos
  // eventos pessoais acima). Usados na aba "Turma" do Calendário.
  turma: { nome: '3º Ano B — Matutino' },
  eventosTurma: [
    { id: 101, titulo: 'Prova de Matemática', data: '2024-02-15', inicio: '08:00', fim: '09:30' },
    { id: 102, titulo: 'Entrega do trabalho de História', data: '2024-02-20', inicio: '00:00', fim: '23:59' },
    { id: 103, titulo: 'Aula de reforço — Física', data: '2024-02-22', inicio: '14:00', fim: '15:00' },
  ],
  kanban: {
    categorias: [
      { id: 'todo', nome: 'A Fazer', itens: [] },
      { id: 'doing', nome: 'Em Progresso', itens: [] },
      { id: 'done', nome: 'Concluído', itens: [] },
    ],
  },
  pomodoro: {
    sessaoAtual: 1,
    tempoFoco: 25 * 60,
    tempoRelaxamento: 15 * 60,
    etapas: null,
  },
  estudos: [],
  notificacoes: [
    { id: 1, titulo: 'Tarefa de Português está atrasada', quando: 'Agora' },
    { id: 2, titulo: 'Novo evento marcado', quando: '1min atrás' },
    { id: 3, titulo: 'Nova Atividade de Inglês adicionada', quando: '5min atrás' },
    { id: 4, titulo: 'Sessão de Estudos Concluída', quando: '12min atrás' },
  ],
  preferenciasNotificacao: {},
}

export async function loadDb() {
  const raw = await AsyncStorage.getItem(KEY)
  if (!raw) {
    const inicial = JSON.parse(JSON.stringify(seed))
    inicial.users = [inicial.user]
    await AsyncStorage.setItem(KEY, JSON.stringify(inicial))
    return inicial
  }
  const db = JSON.parse(raw)
  let alterado = false
  const materiasAnteriores = Array.isArray(db.materias) ? db.materias : []
  const titulosKanbanAnteriores = (db.kanban?.categorias ?? []).flatMap((categoria) => categoria.itens ?? []).map((item) => (
    typeof item === 'string' ? item : item.titulo ?? item.texto
  ))
  const dadosDePrototipo = materiasAnteriores.length === 2
    && materiasAnteriores.every((materia) => MATERIAS_DEMO.has(String(materia.id)))
    && titulosKanbanAnteriores.length === TAREFAS_DEMO.size
    && titulosKanbanAnteriores.every((titulo) => TAREFAS_DEMO.has(titulo))

  if (!Array.isArray(db.users)) {
    db.users = db.user ? [db.user] : []
    alterado = true
  }
  if (!Array.isArray(db.materias)) {
    db.materias = []
    alterado = true
  } else {
    const materiasUsuario = db.materias.filter((materia) => !MATERIAS_DEMO.has(String(materia.id)))
    if (materiasUsuario.length !== db.materias.length) {
      db.materias = materiasUsuario
      alterado = true
    }
  }
  if (!Array.isArray(db.eventos)) {
    db.eventos = []
    alterado = true
  }
  if (Array.isArray(db.eventos)) {
    const eventosUsuario = db.eventos.filter((evento) => !EVENTOS_DEMO.some((demo) => (
      String(evento.id) === String(demo.id)
      && evento.categoria === demo.categoria
      && evento.titulo === demo.titulo
      && evento.data === demo.data
    )))
    if (eventosUsuario.length !== db.eventos.length) {
      db.eventos = eventosUsuario
      alterado = true
    }
  }
  if (Array.isArray(db.kanban?.categorias)) {
    db.kanban.categorias = db.kanban.categorias.map((categoria) => {
      const itensUsuario = (categoria.itens ?? []).filter((item) => {
        const titulo = typeof item === 'string' ? item : item.titulo ?? item.texto
        return !TAREFAS_DEMO.has(titulo)
      })
      if (itensUsuario.length !== (categoria.itens ?? []).length) alterado = true
      return { ...categoria, itens: itensUsuario }
    })
  }
  if (!Array.isArray(db.estudos)) {
    db.estudos = []
    alterado = true
  }
  if (!db.pomodoro) {
    db.pomodoro = seed.pomodoro
    alterado = true
  } else if (dadosDePrototipo && db.pomodoro.etapas === 6 && db.pomodoro.sessaoAtual === 23) {
    db.pomodoro = { ...db.pomodoro, etapas: null, sessaoAtual: 1 }
    alterado = true
  }
  if (db.estatisticas) {
    delete db.estatisticas
    alterado = true
  }
  if (!db.preferenciasNotificacao) {
    db.preferenciasNotificacao = {}
    alterado = true
  }
  if (alterado) await saveDb(db)
  return db
}

export async function saveDb(db) {
  await AsyncStorage.setItem(KEY, JSON.stringify(db))
}

export const delay = (v) => new Promise((res) => setTimeout(() => res(v), 150))
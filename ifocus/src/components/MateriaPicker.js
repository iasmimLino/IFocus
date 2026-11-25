import { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { criarMateria } from '../api/materiasApi'
import { colors } from '../theme/colors'

export default function MateriaPicker({ materias = [], onMateriasChange, selectedId = '', onSelect, disabled = false }) {
  const [aberto, setAberto] = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const selecionada = materias.find((materia) => String(materia.id ?? materia.materiaId) === String(selectedId))

  async function handleAdicionar() {
    if (!nome.trim()) {
      setErro('Informe o nome da matéria.')
      return
    }

    setSalvando(true)
    setErro('')
    try {
      const materia = await criarMateria(nome)
      const id = String(materia.id ?? materia.materiaId)
      onMateriasChange([...materias, materia])
      onSelect(id)
      setNome('')
      setAdicionando(false)
      setAberto(false)
    } catch (e) {
      setErro(e.message || 'Não foi possível cadastrar a matéria.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Matéria</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setAberto((valor) => !valor)}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Text style={styles.selectText} numberOfLines={1}>{selecionada?.nome ?? 'Selecionar'}</Text>
          <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      {aberto && !disabled && (
        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={() => { onSelect(''); setAberto(false) }}>
            <Text style={styles.optionText}>Sem matéria</Text>
          </TouchableOpacity>
          {materias.map((materia) => {
            const id = String(materia.id ?? materia.materiaId)
            return (
              <TouchableOpacity key={id} style={styles.option} onPress={() => { onSelect(id); setAberto(false) }}>
                <Text style={[styles.optionText, String(selectedId) === id && styles.selectedText]}>{materia.nome}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {!disabled && (
        <TouchableOpacity style={styles.addButton} onPress={() => { setAdicionando((valor) => !valor); setErro('') }}>
          <Ionicons name="add" size={16} color={colors.dark2} />
          <Text style={styles.addText}>Adicionar matéria</Text>
        </TouchableOpacity>
      )}

      {adicionando && !disabled && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="Nome da matéria"
            placeholderTextColor={colors.muted}
            value={nome}
            onChangeText={setNome}
            maxLength={160}
            onSubmitEditing={handleAdicionar}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAdicionar} disabled={salvando}>
            <Ionicons name={salvando ? 'time-outline' : 'checkmark'} size={19} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
      {!!erro && <Text style={styles.error}>{erro}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: colors.text, fontWeight: '600' },
  selectButton: { minWidth: 120, maxWidth: '68%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: colors.dark2, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  selectText: { color: colors.white, fontWeight: '600', flexShrink: 1 },
  options: { maxHeight: 144, borderWidth: 1, borderColor: '#d4ddcc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 6 },
  option: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d4ddcc' },
  optionText: { color: colors.text, fontSize: 13 },
  selectedText: { fontWeight: '700', color: colors.dark2 },
  addButton: { minHeight: 32, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  addText: { color: colors.dark2, fontSize: 12, fontWeight: '600' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 40, borderWidth: 1, borderColor: '#d4ddcc', borderRadius: 7, paddingHorizontal: 10, color: colors.text, backgroundColor: '#fff' },
  saveButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: colors.dark2 },
  error: { color: '#a33', fontSize: 12, marginTop: 5 },
})
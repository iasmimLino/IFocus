import { useEffect, useState } from 'react'
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

/**
 * Edição das configurações do Pomodoro: tempo de foco, tempo de
 * relaxamento (em minutos) e quantidade de etapas. Salva via
 * src/api/pomodoroApi.js -> salvarConfig().
 */
export default function PomodoroConfigModal({ visible, config, onCancel, onSalvar }) {
  const [foco, setFoco] = useState('25')
  const [relax, setRelax] = useState('15')
  const [etapas, setEtapas] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (visible && config) {
      setFoco(String(Math.round(config.tempoFoco / 60)))
      setRelax(String(Math.round(config.tempoRelaxamento / 60)))
      setEtapas(config.etapas == null ? '' : String(config.etapas))
      setErro('')
    }
  }, [visible, config])

  function handleSalvar() {
    const focoMin = parseInt(foco, 10)
    const relaxMin = parseInt(relax, 10)
    const etapasNum = etapas.trim() ? parseInt(etapas, 10) : null

    if (!focoMin || !relaxMin || focoMin < 1 || relaxMin < 1 || (etapasNum !== null && (!Number.isInteger(etapasNum) || etapasNum < 1))) {
      setErro('Informe durações válidas e, se desejar, uma quantidade de etapas maior que zero.')
      return
    }

    onSalvar({
      tempoFoco: focoMin * 60,
      tempoRelaxamento: relaxMin * 60,
      etapas: etapasNum,
    })
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Configurar sessão</Text>

          <Text style={styles.label}>Tempo de foco (minutos)</Text>
          <TextInput style={styles.input} value={foco} onChangeText={setFoco} keyboardType="number-pad" />

          <Text style={styles.label}>Tempo de relaxamento (minutos)</Text>
          <TextInput style={styles.input} value={relax} onChangeText={setRelax} keyboardType="number-pad" />

          <Text style={styles.label}>Etapas por sessão (opcional)</Text>
          <TextInput
            style={styles.input}
            value={etapas}
            onChangeText={setEtapas}
            keyboardType="number-pad"
            placeholder="Sem limite configurado"
          />

          {!!erro && <Text style={styles.error}>{erro}</Text>}

          <View style={styles.row}>
            <TouchableOpacity style={styles.btn} onPress={onCancel}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSalvar}>
              <Text style={[styles.btnText, styles.btnPrimaryText]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 30 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  title: { fontWeight: '700', fontSize: 15, marginBottom: 14, color: colors.text },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  error: { color: '#a33', fontSize: 13, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 18 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  btnPrimary: { backgroundColor: colors.dark2 },
  btnText: { color: colors.dark, fontWeight: '600' },
  btnPrimaryText: { color: '#fff' },
})

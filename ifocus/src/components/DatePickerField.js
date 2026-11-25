import { useState } from 'react'
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors } from '../theme/colors'

function dataISO(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function dataDoValor(valor) {
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export default function DatePickerField({ value, onChange }) {
  const [visivel, setVisivel] = useState(false)
  const [temporaria, setTemporaria] = useState(() => dataDoValor(value))

  function abrir() {
    setTemporaria(dataDoValor(value))
    setVisivel(true)
  }

  function handleAndroidChange(evento, dataSelecionada) {
    setVisivel(false)
    if (evento.type !== 'dismissed' && dataSelecionada) onChange(dataISO(dataSelecionada))
  }

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={abrir} accessibilityRole="button" accessibilityLabel="Selecionar data">
        <Text style={styles.fieldText}>{dataDoValor(value).toLocaleDateString('pt-BR')}</Text>
        <Text style={styles.fieldHint}>Data</Text>
      </TouchableOpacity>
      {visivel && Platform.OS === 'android' && (
        <DateTimePicker value={temporaria} mode="date" display="default" onChange={handleAndroidChange} />
      )}
      {visivel && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setVisivel(false)}>
          <View style={styles.backdrop}>
            <View style={styles.pickerCard}>
              <DateTimePicker value={temporaria} mode="date" display="spinner" onChange={(_, dataSelecionada) => dataSelecionada && setTemporaria(dataSelecionada)} />
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => setVisivel(false)}><Text style={styles.cancel}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { onChange(dataISO(temporaria)); setVisivel(false) }}><Text style={styles.confirm}>Confirmar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  field: { backgroundColor: colors.light2, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldText: { color: colors.text, fontSize: 14 },
  fieldHint: { color: colors.muted, fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  pickerCard: { backgroundColor: colors.bg, borderRadius: 10, padding: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 22, paddingTop: 8 },
  cancel: { color: colors.muted, fontWeight: '600' },
  confirm: { color: colors.dark2, fontWeight: '700' },
})
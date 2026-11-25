import { Platform } from 'react-native'
import * as Calendar from 'expo-calendar'

function criarDataHora(data, hora, horaPadrao) {
  const [ano, mes, dia] = data.split('-').map(Number)
  const [horas, minutos] = (hora || horaPadrao).split(':').map(Number)
  return new Date(ano, mes - 1, dia, horas, minutos)
}

export async function adicionarAoCalendario(evento) {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    throw new Error('A integração com o calendário está disponível no app para iOS e Android.')
  }
  if (!(await Calendar.isAvailableAsync())) {
    throw new Error('O calendário do dispositivo não está disponível.')
  }

  const inicio = criarDataHora(evento.data, evento.inicio, '09:00')
  const fim = criarDataHora(evento.data, evento.fim, '10:00')
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) {
    throw new Error('Confira a data e os horários antes de enviar ao calendário.')
  }

  return Calendar.createEventInCalendarAsync({
    title: evento.titulo,
    startDate: inicio,
    endDate: fim,
    notes: evento.descricao || '',
  })
}
/**
 * ======================================================================
 *  LIGAR/DESLIGAR O SPRING BOOT
 * ======================================================================
 * Sem EXPO_PUBLIC_API_URL -> usa AsyncStorage (modo demo).
 * Com EXPO_PUBLIC_API_URL -> usa o back-end Spring por padrão.
 * EXPO_PUBLIC_USE_MOCK=true força o modo demo; false força o back-end.
 * ======================================================================
 */
const modoExplicito = process.env.EXPO_PUBLIC_USE_MOCK
export const USE_MOCK = modoExplicito
	? modoExplicito === 'true'
	: !process.env.EXPO_PUBLIC_API_URL

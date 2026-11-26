/**
 * ======================================================================
 *  LIGAR/DESLIGAR O SPRING BOOT
 * ======================================================================
 * O Spring é usado por padrão. Defina EXPO_PUBLIC_API_URL para apontar
 * para outro host ou EXPO_PUBLIC_USE_MOCK=true para habilitar o demo local.
 * ======================================================================
 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true'

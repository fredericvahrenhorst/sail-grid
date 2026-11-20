/**
 * Liest die Fehlermeldung aus einer $fetch-Antwort.
 * overlap/conflicts kommen bei einer doppelten Buchung (HTTP 409).
 */
export function readError(error) {
    const source = (error && typeof error === 'object' ? error : {});
    const body = source.data;
    const detailed = body?.message || source.message;
    const status = body?.statusMessage || source.statusMessage;
    const generic = /bad request|unauthorized|forbidden|not found|conflict|internal server/i;
    return {
        message: detailed && !generic.test(detailed) ? detailed : (status || detailed || useNuxtApp().$i18n.t('errors.failed')),
        overlap: Boolean(body?.data?.overlap),
        conflicts: body?.data?.conflicts || [],
    };
}

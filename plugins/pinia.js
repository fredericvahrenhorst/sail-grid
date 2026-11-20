/**
 * Pinia für den Kalender-Store. Nach dem serverseitigen Rendern wird die
 * aktive Instanz geleert, damit Anfragen sich keinen Zustand teilen.
 */
import { createPinia, setActivePinia } from 'pinia';

export default defineNuxtPlugin({
    name: 'pinia',
    setup(nuxtApp) {
        const pinia = createPinia();
        nuxtApp.vueApp.use(pinia);
        setActivePinia(pinia);
        return { provide: { pinia } };
    },
    hooks: {
        'app:rendered': function clearPinia() {
            setActivePinia(undefined);
        },
    },
});

// Nuxt-Konfiguration. Geheimnisse kommen aus der Umgebung, nicht aus dieser Datei.
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxt/icon', '@nuxt/ui', 'nuxt-auth-utils'],
    css: ['~/assets/css/main.css'],
    // Keine Google-Fonts. Die Schriften kommen aus @fontsource in assets/css/main.css.
    ui: {
        fonts: false,
    },
    // Icons nur aus dem lokalen Lucide-Paket. Kein Aufruf von api.iconify.design.
    icon: {
        provider: 'server',
        fallbackToApi: false,
        serverBundle: {
            collections: ['lucide'],
        },
    },
    colorMode: {
        preference: 'light',
        fallback: 'light',
    },
    runtimeConfig: {
        mongodbUri: '',
        mongodbDb: '',
        adminPassword: '',
        allowedFrameAncestors: '',
        session: {
            maxAge: 60 * 60 * 12,
            password: '',
        },
        public: {
            baseUrl: 'http://localhost:3000',
            lang: 'de',
        },
    },
    app: {
        head: {
            title: 'SailGrid',
            link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        },
    },
});

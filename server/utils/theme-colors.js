// Same list as lib/theme-colors.js and the defaults in assets/css/main.css.
export const THEME_COLORS = [
    { key: 'ink', fallback: '#12373a' },
    { key: 'body', fallback: '#1c2b2e' },
    { key: 'mist', fallback: '#3d5558' },
    { key: 'faint', fallback: '#5d7376' },
    { key: 'wash', fallback: '#8aa0a3' },
    { key: 'tide', fallback: '#0f766e' },
    { key: 'line', fallback: '#d5e1e3' },
    { key: 'foam', fallback: '#f7fbfb' },
    { key: 'sea', fallback: '#e7eef0' },
    { key: 'dot', fallback: '#d3e0e2' },
    { key: 'danger', fallback: '#9f1239' },
    { key: 'warn', fallback: '#9a3412' },
];

export function emptyThemeColors() {
    return Object.fromEntries(THEME_COLORS.map((color) => [color.key, '']));
}

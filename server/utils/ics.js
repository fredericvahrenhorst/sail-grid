import ical from 'ical-generator';

export function createCalendar(name) {
    return ical({
        name,
        prodId: { company: 'SailGrid', product: 'SailGrid', language: appLang() === 'en' ? 'EN' : 'DE' },
    });
}
export function sendCalendar(event, calendar, filename) {
    setHeader(event, 'content-type', 'text/calendar; charset=utf-8');
    setHeader(event, 'content-disposition', `inline; filename="${filename}"`);
    setHeader(event, 'cache-control', 'public, max-age=300');
    return calendar.toString();
}

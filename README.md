# SailGrid

Kalenderansicht zur Buchungsdarstellung von Segelbooten eines Vereins.
Soll per iFrame in die Vereinswebsite eingebettet werden. Mitglieder sehen,
welche Boote wann verfügbar sind – die komplette Verwaltung läuft über einen
Admin-Bereich.

## Tech Stack

- Nuxt 3 (Vue 3)
- Tailwind CSS + Nuxt UI
- MongoDB
- Hosting: Coolify (Docker)

## Features

### Öffentliche Kalenderansicht (iFrame-fähig)

- Google Calendar ähnliche Optik, zwei Monate gleichzeitig im Desktop-View
- Navigation zwischen Monaten und Jahren
- Filter nach Segelboot
- Responsive: mobile Ansicht zeigt einen Monat
- Klick auf Buchung öffnet Detail-Modal (Wer hat gebucht, Notizen, Route)
- Keine Schreibrechte für Besucher, reine Anzeige

### Admin-Bereich

- Login per Passwort
- Buchungen anlegen, bearbeiten, löschen
- Segelboote verwalten (hinzufügen, bearbeiten, löschen, Bild, Beschreibung)
- Buchungsfelder: Name des Verantwortlichen, Notizen, Route, Zeitraum
- Editor-Feld für den Infotext "Wie kann ich ein Boot buchen?"
- Einstellungen (z.B. iFrame-Ziel-URLs, Buchungsregeln)

## Setup

### Lokale Entwicklung

```bash
pnpm install
cp .env.example .env   # MONGODB_URI und ADMIN_PASSWORD setzen
pnpm dev
```

## Environment Variablen

| Variable | Beschreibung |
| --- | --- |
| `MONGODB_URI` | Verbindungsstring zu MongoDB |
| `MONGODB_DB` | Datenbankname (Default: sailgrid) |
| `ADMIN_PASSWORD` | Passwort für den Admin-Bereich |
| `NUXT_PUBLIC_BASE_URL` | Basis-URL der App, für iFrame-Einbindung |

## Deployment (Coolify)

Die App wird über die beiliegende docker-compose.yaml bzw. ein
Multi-Stage Dockerfile deployt. Coolify stellt MongoDB in derselben
Docker-Network bereit. Nach dem Deployment die Env-Variablen in Coolify
hinterlegen und die App als iFrame-Quelle in der Vereinsseite einbinden:

```html
<iframe
  src="https://sailgrid.example.com/?embed=true"
  width="100%" height="900" style="border:0;border-radius:12px"
  title="SailGrid Kalender">
</iframe>
```

Das `embed=true` Query-Param blendet Header und Navigation aus und zeigt
nur die Kalenderansicht.

## Datenmodell (MongoDB)

| Collection | Felder |
| --- | --- |
| `boats` | `name`, `description`, `imageUrl`, `active` |
| `bookings` | `boatId`, `memberName`, `notes`, `route`, `start`, `end` |
| `settings` | `bookingInfoText` (HTML), ... |

## Lizenz

Private Nutzung durch den Verein.

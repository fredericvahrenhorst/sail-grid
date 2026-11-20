# SailGrid

Kalender für die Belegung der Boote eines Segelvereins. Besucher sehen zwei Monate, filtern nach Boot und öffnen eine Buchung. Schreiben kann nur der passwortgeschützte Admin-Bereich. Die Kalenderseite lässt sich per iFrame in die Vereinswebsite einbetten.

Gebaut mit Nuxt 3, Vue 3, JavaScript, Tailwind CSS, Nuxt UI und MongoDB. Gedacht für Docker-Hosting über Coolify.

Die Oberfläche gibt es auf Deutsch und Englisch. Die Sprache gilt für die ganze Instanz, es gibt keinen Umschalter. Ohne `NUXT_PUBLIC_LANG` bleibt es Deutsch.

## Vor dem ersten Push

Das Repository kann öffentlich liegen. Echte Geheimnisse dürfen nicht mit.

- `.env` ist in `.gitignore` und gehört nicht ins Git. `git status` darf sie nicht als neue Datei zeigen.
- `.env.example` enthält nur Platzhalter. Dieselben Werte lehnt die Produktion ab.
- `node_modules`, `.nuxt`, `.output` und `.data` bleiben lokal.
- Seed-Namen wie Mara Holm sind erfunden.

## Voraussetzungen

- Node.js 20.12 oder neuer (`node --env-file` für `pnpm seed`)
- pnpm 9.5, zum Beispiel über Corepack
- MongoDB 7, erreichbar unter `mongodb://localhost:27017`

Docker Compose startet App und Mongo zusammen. Für die tägliche Entwicklung mit `pnpm dev` läuft Mongo getrennt.

```bash
corepack enable
corepack prepare pnpm@9.5.0 --activate
```

## MongoDB für die Entwicklung

Wenn lokal noch kein Mongo läuft, reicht ein einzelner Container. Der veröffentlicht nur den Datenbank-Port, nicht die App.

```bash
docker run -d --name sailgrid-mongo -p 27017:27017 mongo:7
```

Die Datenbank heißt `sailgrid`. Sie entsteht beim ersten Verbindungsaufbau.

## Lokal starten

```bash
pnpm install
cp .env.example .env
```

In der `.env` danach mindestens die Session setzen, bevor die App irgendwo öffentlich erreichbar ist:

- `NUXT_SESSION_PASSWORD`: mindestens 32 Zeichen, zum Beispiel die Ausgabe von `openssl rand -base64 32`
- `ADMIN_PASSWORD`: für `pnpm dev` beliebig. Für Docker und Produktion mindestens 12 Zeichen und weder `change-me` noch `root`

```bash
pnpm seed
pnpm dev
```

`pnpm seed` legt drei Beispielboote und erfundene Buchungen im aktuellen Zeitraum an. Ein zweiter Lauf ersetzt nur die Buchungen dieser drei Boote. Unter `NODE_ENV=production` bricht das Skript ab. Der Hinweistext im Seed ist Deutsch, auch wenn die Oberfläche auf Englisch steht.

Die App liegt unter [http://localhost:3000](http://localhost:3000). Die Verwaltung liegt unter `/admin`, das Login unter `/login`. Das Passwort ist `ADMIN_PASSWORD` aus der `.env`.

Nach einer Änderung an der `.env` den Dev-Server neu starten. Die Sprache liest die App beim Start.

`pnpm lint` prüft den Quelltext.

## Docker Compose

Im Container gilt `NODE_ENV=production`. Platzhalter aus `.env.example` und der Build-Platzhalter im Dockerfile beenden den Prozess. Vorher in der `.env` ein eigenes Admin-Passwort mit mindestens 12 Zeichen und ein eigenes Session-Passwort mit mindestens 32 Zeichen setzen.

```bash
docker compose up --build
```

Die App hört auf Port `3000`. Mongo bleibt im Compose-Netz (`mongo:27017`), hat keinen veröffentlichten Port und speichert in das Volume `sailgrid-mongo`. Der Seed läuft hier nicht. Boote und Buchungen legt der Admin in der Oberfläche an.

## Umgebungsvariablen

Nuxt übernimmt eigene Werte nur, wenn der Name mit `NUXT_` beginnt. Compose setzt denselben Inhalt deshalb unter beiden Namen. Eine bestehende `.env` liest Compose für die `${...}`-Einträge von selbst. `NODE_ENV` steht nicht in der `.env`: `pnpm dev` setzt Entwicklung, das Docker-Image setzt `NODE_ENV=production`.

| Variable | Beschreibung |
| --- | --- |
| `MONGODB_URI` | Mongo-Verbindung. In Coolify zusätzlich `NUXT_MONGODB_URI`. Lokal `mongodb://localhost:27017`, in Compose `mongodb://mongo:27017`. |
| `MONGODB_DB` | Datenbankname, Default `sailgrid`. Zusätzlich `NUXT_MONGODB_DB`. |
| `ADMIN_PASSWORD` | Passwort für `/login`. Zusätzlich `NUXT_ADMIN_PASSWORD`. Produktion: mindestens 12 Zeichen, nicht `change-me` und nicht `root`. |
| `NUXT_SESSION_PASSWORD` | Signiert das HttpOnly-Session-Cookie. Mindestens 32 Zeichen. Der Platzhalter aus `.env.example` und der Build-Platzhalter sind gesperrt. |
| `NUXT_PUBLIC_BASE_URL` | Öffentliche Basis-URL für Teilen-Links und ICS. Ohne abschließenden Schrägstrich. |
| `NUXT_PUBLIC_LANG` | `de` oder `en`. Default `de`. Gilt für Oberfläche, API-Meldungen und Datumsformat. |
| `ALLOWED_FRAME_ANCESTORS` | Wer die Kalenderseite einbetten darf. Zusätzlich `NUXT_ALLOWED_FRAME_ANCESTORS`. |

Beispiel, damit nur die Vereinswebsite einbetten darf:

```bash
ALLOWED_FRAME_ANCESTORS=self https://verein.example
```

`/admin` und `/login` senden `frame-ancestors 'none'` und lassen sich nicht einbetten.

## Was die Oberfläche kann

### Kalender

- Zwei Monate nebeneinander, auf dem Handy ein Monat
- Navigation über Monate und Sprungfelder für Monat und Jahr
- Filter nach Boot über `?boatId=`, damit ein iFrame mit einem Boot starten kann
- Balken zeigen Boot und eingebuchte Person. Laufende Buchungen sind markiert
- Klick öffnet Details: Boot, Zeitraum, eingebucht von, Notizen, Route, Eintragszeit
- Leere Felder stehen als „keine Angaben“, auf Englisch als „no details“
- Hinweistext „Wie kann ich ein Boot buchen?“
- ICS-Download pro Buchung und Kalender-Abo pro Boot
- Teilen-Link pro Boot, nur wenn ein Boot gefiltert ist
- Besucher können nichts ändern

### Admin

„Verwaltung“ ist immer sichtbar. Die Seiten darunter verlangen das Login. Eingeloggt kommen daneben „Buchung hinzufügen“ und „Abmelden“. Abmelden bleibt auf dem Kalender.

- Login mit dem Passwort aus der Umgebung. Darunter führt ein Link zurück zum Kalender
- Buchung im Kalender-Popup anlegen, bearbeiten und löschen. Löschen fragt vorher „Bist du dir sicher?“
- Boote anlegen, bearbeiten, sortieren, archivieren (löschen nur ohne Buchungen)
- Buchungsliste mit Zeitraum, ganztägig oder mit Uhrzeit
- Überlappung auf demselben Boot wird gemeldet und kann bestätigt werden
- HTML-Hinweistext, serverseitig auf eine Allowlist gekürzt
- Schalter für Benachrichtigungen speichert nur den Wunsch. Es geht keine Mail raus

## Deployment (Coolify)

1. Repository in Coolify als Docker Compose aus `docker-compose.yaml` anlegen.
2. Umgebungsvariablen neu setzen. `ADMIN_PASSWORD` und `NUXT_SESSION_PASSWORD` nicht aus einer lokalen `.env` oder aus `.env.example` übernehmen.
3. `NUXT_PUBLIC_BASE_URL` auf die öffentliche App-Domain setzen, zum Beispiel `https://sailgrid.example.com`.
4. `NUXT_PUBLIC_LANG` auf `de` oder `en` setzen.
5. `ALLOWED_FRAME_ANCESTORS` auf die Origin der Vereinswebsite beschränken.
6. Domain auf den App-Service zeigen, Port `3000`. Mongo bleibt intern und hat keinen öffentlichen Port.
7. Volume `sailgrid-mongo` behalten, sonst ist die Datenbank beim nächsten Deploy leer.

Die Produktion startet ohne Boote und ohne Buchungen. `pnpm seed` ist dafür nicht gedacht. Die ersten Daten kommen über `/admin`.

Compose startet nicht, solange `ADMIN_PASSWORD` oder `NUXT_SESSION_PASSWORD` fehlen. Stehen die Platzhalter trotzdem in der Umgebung, beendet sich die App beim Start.

iFrame auf der Vereinsseite:

```html
<iframe
  src="https://sailgrid.example.com/?embed=true"
  width="100%"
  height="900"
  style="border:0"
  title="SailGrid Kalender">
</iframe>
```

`embed=true` blendet Kopfzeile und Verwaltungslink aus. Ein Boot kann direkt offen sein: `?embed=true&boatId=BOOT_ID`.

Kalender-Abo eines Boots: `https://sailgrid.example.com/api/ics/boat/BOOT_ID.ics`

## Sicherheit

- Mutationen prüfen die Session auf dem Server. Die Admin-Seiten leiten nur zusätzlich um.
- Es gibt ein Admin-Passwort, keine Benutzerkonten.
- Session-Cookie ist HttpOnly, in Produktion `Secure`, `SameSite=Lax`, zwölf Stunden gültig.
- Login vergleicht das Passwort in konstanter Zeit und erlaubt fünf Versuche pro Minute und IP. Das Limit liegt im Prozessspeicher und gilt pro Instanz.
- Schreibende API-Aufrufe mit `Origin`-Header müssen von derselben Origin kommen.
- Hinweis-HTML lässt nur `p`, `br`, Listen, `strong`, `em`, `a`, `h2` und `h3` zu. Links werden auf `https`, `http` und `mailto` begrenzt.
- Buchungsfelder sind Text, keine HTML-Ausgabe.
- Bild-URLs müssen `https` sein. Es gibt keinen Upload.
- `/admin` und `/login` sind `noindex` und in `robots.txt` gesperrt.
- ICS enthält nur die öffentlichen Buchungsfelder.
- Produktion beendet sich, wenn Session- oder Admin-Passwort ein veröffentlichter Platzhalter ist.
- Schriften und Icons kommen aus dem Build. Die App ruft dafür keine externen Dienste auf.

## Datenmodell (MongoDB)

| Collection | Felder |
| --- | --- |
| `boats` | `name`, `description`, `imageUrl`, `color`, `active`, `sortOrder`, Zeitstempel |
| `bookings` | `boatId`, `memberName`, `notes`, `route`, `start`, `end`, `allDay`, Zeitstempel. Index auf `boatId` + `start` |
| `settings` | ein Dokument `key: default` mit `bookingInfoText` (HTML) und `notifyEnabled` |

## Projektstruktur

```text
locales/          de.json und en.json, eine Sprache pro Instanz
plugins/          vue-i18n und Pinia
stores/           Pinia für den öffentlichen Kalender
composables/      Datumsformat und Fehlermeldungen
components/       Kalender, Modals, Admin-Formulare
pages/            Kalender, Login, Admin
server/api/       REST für Boote, Buchungen, Settings, Auth
server/routes/    ICS-Downloads
server/models/    Mongoose-Schemas
server/utils/     Auth, Validierung, Übersetzung der API
scripts/seed.js   Beispieldaten, nur außerhalb der Produktion
```

## API

| Methode | Pfad | Zugriff |
| --- | --- | --- |
| GET | `/api/boats` | öffentlich, nur aktive Boote |
| GET | `/api/boats/all` | Admin |
| POST | `/api/boats/reorder` | Admin |
| POST, PUT, DELETE | `/api/boats` | Admin. DELETE löscht nur ohne Buchungen, sonst Archiv |
| GET | `/api/bookings?boatId=&from=&to=` | öffentlich, höchstens 560 Tage und 1000 Einträge |
| POST, PUT, DELETE | `/api/bookings` | Admin. Überlappung antwortet mit 409, `force: true` speichert trotzdem |
| GET | `/api/settings` | öffentlich |
| PUT | `/api/settings` | Admin |
| POST | `/api/auth/login`, `/api/auth/logout` | Login öffentlich, sonst Session |
| GET | `/api/ics/booking/:id.ics`, `/api/ics/boat/:id.ics` | öffentlich |

## Lizenz

Öffentliches Repository. Mit dieser Anleitung lässt sich eine eigene Instanz aufsetzen. Eine Open-Source-Lizenz liegt nicht bei.

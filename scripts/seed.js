import mongoose from 'mongoose';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { Boat } from '../server/models/Boat.js';
import { Booking } from '../server/models/Booking.js';
import { Setting } from '../server/models/Setting.js';

if (process.env.NODE_ENV === 'production') {
    console.error('Seed is disabled in production.');
    process.exit(1);
}
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'sailgrid';
const boats = [
    {
        name: 'Pusteblume',
        description: 'Offene Jolle für Tagesausflüge und Ausbildung.',
        color: '#0f766e',
        sortOrder: 1,
        imageUrl: '',
    },
    {
        name: 'Albatros',
        description: 'Kielboot für Mehrtagesfahrten auf der Förde.',
        color: '#1d4ed8',
        sortOrder: 2,
        imageUrl: '',
    },
    {
        name: 'Möwe',
        description: 'Katamaran, schnell bei wenig Wind.',
        color: '#b45309',
        sortOrder: 3,
        imageUrl: '',
    },
];
await mongoose.connect(uri, { dbName });
const today = startOfDay(new Date());
for (const entry of boats) {
    const boat = await Boat.findOneAndUpdate({ name: entry.name }, { ...entry, active: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await Booking.deleteMany({ boatId: boat._id });
}
const pusteblume = await Boat.findOne({ name: 'Pusteblume' });
const albatros = await Boat.findOne({ name: 'Albatros' });
const moewe = await Boat.findOne({ name: 'Möwe' });
if (!pusteblume || !albatros || !moewe) {
    throw new Error('Seed boats missing');
}
await Booking.insertMany([
    {
        boatId: pusteblume._id,
        memberName: 'Mara Holm',
        notes: '',
        route: 'Hafenrunde',
        start: startOfDay(addDays(today, -1)),
        end: endOfDay(addDays(today, 1)),
        allDay: true,
    },
    {
        boatId: albatros._id,
        memberName: 'Jonas Kruse',
        notes: 'Skipperwache am Abend, tagsüber frei für Mitsegler.',
        route: 'Kieler Förde',
        start: startOfDay(addDays(today, 4)),
        end: endOfDay(addDays(today, 6)),
        allDay: true,
    },
    {
        boatId: moewe._id,
        memberName: 'Lea Petersen',
        notes: 'Training Jugendgruppe.',
        route: '',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0, 0),
        allDay: false,
    },
]);
await Setting.findOneAndUpdate({ key: 'default' }, {
    key: 'default',
    notifyEnabled: false,
    bookingInfoText: '<h2>Wie kann ich ein Boot buchen?</h2><p>Die Boote werden vom Verein vergeben. Schreib dem Bootswart mit Wunschboot und Zeitraum. Einträge hier sind nur zur Ansicht.</p><ul><li>Mitglieder zuerst</li><li>Mehrtagesfahrten früh anmelden</li></ul>',
}, { upsert: true, new: true });
console.log(`Seeded sailgrid in ${dbName}`);
await mongoose.disconnect();

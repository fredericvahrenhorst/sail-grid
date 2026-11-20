// Eine gemeinsame Mongo-Verbindung für alle API-Routen.
import mongoose from 'mongoose';

let connecting = null;
function mongoUri() {
    const config = useRuntimeConfig();
    return config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
}
function mongoDb() {
    const config = useRuntimeConfig();
    return process.env.MONGODB_DB || config.mongodbDb || 'sailgrid';
}
export async function ensureDb() {
    if (mongoose.connection.readyState === 1) return mongoose;
    if (!connecting) {
        connecting = mongoose.connect(mongoUri(), { dbName: mongoDb() }).catch((error) => {
            connecting = null;
            throw error;
        });
    }
    return connecting;
}

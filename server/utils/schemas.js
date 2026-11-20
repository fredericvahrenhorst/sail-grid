import { z } from 'zod';

const httpsUrl = z.string().trim().max(2000).refine((value) => value === '' || /^https:\/\/\S+$/i.test(value), 'Bild-URL muss leer sein oder mit https:// beginnen');
export const boatSchema = z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional()
        .default(''),
    imageUrl: httpsUrl.optional().default(''),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Farbe muss ein Hex-Wert sein'),
    active: z.boolean().optional().default(true),
    sortOrder: z.coerce.number().int().min(0).max(9999)
        .optional()
        .default(0),
});
export const bookingSchema = z.object({
    boatId: z.string().trim().min(1),
    memberName: z.string().trim().min(1).max(120),
    notes: z.string().trim().max(4000).optional()
        .default(''),
    route: z.string().trim().max(500).optional()
        .default(''),
    start: z.string().trim().min(1),
    end: z.string().trim().min(1),
    allDay: z.boolean().optional().default(false),
    force: z.boolean().optional().default(false),
});
export const settingsSchema = z.object({
    bookingInfoText: z.string().max(20000).optional().default(''),
    notifyEnabled: z.boolean().optional().default(false),
    siteName: z.string().trim().max(80).optional()
        .default(''),
    clubName: z.string().trim().max(120).optional()
        .default(''),
    metaTitle: z.string().trim().max(120).optional()
        .default(''),
    metaDescription: z.string().trim().max(300).optional()
        .default(''),
});
export const boatOrderSchema = z.object({
    ids: z.array(z.string().trim().min(1)).min(1).max(500),
});
export const loginSchema = z.object({
    password: z.string().min(1).max(200),
});
export const PALETTE = ['#0f766e', '#b45309', '#1d4ed8', '#be123c', '#0369a1', '#3f6212', '#9a3412'];

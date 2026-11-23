import {
    createHash, randomBytes, scryptSync, timingSafeEqual,
} from 'node:crypto';

const BLOCKED_PASSWORDS = new Set(['change-me', 'root']);

export function passwordsMatch(input, expected) {
    const left = createHash('sha256').update(input).digest();
    const right = createHash('sha256').update(expected).digest();
    return timingSafeEqual(left, right);
}

export function hashAdminPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 32).toString('hex');
    return `scrypt$${salt}$${hash}`;
}

export function verifyAdminPassword(password, stored) {
    const [scheme, salt, hash] = String(stored || '').split('$');
    if (scheme !== 'scrypt' || !salt || !/^[0-9a-f]+$/i.test(hash || '')) return false;
    const actual = scryptSync(password, salt, 32);
    const expected = Buffer.from(hash, 'hex');
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
}

export function passwordChangeError(password) {
    if (password.length < 12) return 'errors.passwordShort';
    if (BLOCKED_PASSWORDS.has(password)) return 'errors.passwordBlocked';
    return '';
}

import { createHash, timingSafeEqual } from 'node:crypto';

export function passwordsMatch(input, expected) {
    const left = createHash('sha256').update(input).digest();
    const right = createHash('sha256').update(expected).digest();
    return timingSafeEqual(left, right);
}

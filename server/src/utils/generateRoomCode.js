/**
 * Generates a room code in the format: abc-defg-hij
 * 3 lowercase letters, dash, 4 lowercase letters, dash, 3 lowercase letters
 */
export function generateRoomCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const pick = (n) =>
        Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

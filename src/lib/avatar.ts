/**
 * Ensures a Discord avatar hash or URL is returned as a full valid URL.
 * Safe for both server and client components.
 */
export function formatDiscordAvatar(discordUserId: string, avatarHandle: string | null): string | null {
    if (!avatarHandle) return null;
    if (avatarHandle.startsWith('http')) return avatarHandle;

    // If it's just a hash (no extension, just hex), construct the URL
    if (/^[0-9a-f]+$/i.test(avatarHandle)) {
        return `https://cdn.discordapp.com/avatars/${discordUserId}/${avatarHandle}.png`;
    }

    return avatarHandle;
}

export function getDefaultAvatarUrl(discordUserId: string): string {
    const index = Number(BigInt(discordUserId) >> BigInt(22)) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

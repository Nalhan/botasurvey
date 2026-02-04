import { REST } from '@discordjs/rest';
import { Routes, APIGuildMember } from 'discord-api-types/v10';
import { unstable_cache } from 'next/cache';
import { formatDiscordAvatar, getDefaultAvatarUrl } from './avatar';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const rest = DISCORD_BOT_TOKEN ? new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN) : null;

export interface DiscordMemberData {
    isInGuild: boolean;
    nickname: string | null;
    username: string | null;
    avatar: string | null;
    roles: string[];
}

export interface DiscordRole {
    id: string;
    name: string;
    color: number;
    position: number;
}

/**
 * Ensures a Discord avatar hash or URL is returned as a full valid URL.
 */
export { formatDiscordAvatar, getDefaultAvatarUrl };

export async function getGuildMember(discordUserId: string): Promise<DiscordMemberData | null> {
    if (!rest || !DISCORD_GUILD_ID) {
        console.warn("Discord credentials missing, skipping getGuildMember.");
        return null;
    }

    try {
        const member = await rest.get(
            Routes.guildMember(DISCORD_GUILD_ID, discordUserId)
        ) as APIGuildMember;

        const avatarHash = member.user?.avatar || member.avatar || null;
        const userId = member.user?.id || discordUserId;
        const avatarUrl = formatDiscordAvatar(userId, avatarHash) || getDefaultAvatarUrl(userId);

        return {
            isInGuild: true,
            nickname: member.nick || null,
            username: member.user?.username || null,
            avatar: avatarUrl,
            roles: member.roles,
        };
    } catch (error: any) {
        if (error.status === 404) {
            // User not in guild
            return {
                isInGuild: false,
                nickname: null,
                username: null,
                avatar: null,
                roles: [],
            };
        }
        console.error("Error fetching Discord member:", error);
        return null;
    }
}

export async function listGuildMembers(): Promise<Map<string, DiscordMemberData>> {
    if (!rest || !DISCORD_GUILD_ID) {
        return new Map();
    }

    try {
        const members = await rest.get(
            Routes.guildMembers(DISCORD_GUILD_ID),
            { query: new URLSearchParams({ limit: '1000' }) }
        ) as APIGuildMember[];

        const memberMap = new Map<string, DiscordMemberData>();
        members.forEach(member => {
            if (member.user) {
                const avatarHash = member.user.avatar || member.avatar || null;
                const avatarUrl = formatDiscordAvatar(member.user.id, avatarHash) || getDefaultAvatarUrl(member.user.id);

                memberMap.set(member.user.id, {
                    isInGuild: true,
                    nickname: member.nick || null,
                    username: member.user.username,
                    avatar: avatarUrl,
                    roles: member.roles,
                });
            }
        });
        return memberMap;
    } catch (error: any) {
        if (error.code === 50001) {
            console.warn("⚠️ Discord API Missing Access (50001). This happens if 'Server Members Intent' is not enabled in the Developer Portal. Falling back to individual member fetching.");
        } else {
            console.error("Error listing guild members:", error);
        }
        return new Map();
    }
}

// Caching wrappers
export const getCachedGuildMembers = unstable_cache(
    async () => {
        const map = await listGuildMembers();
        return Object.fromEntries(map);
    },
    ['discord-guild-members'],
    { revalidate: 300, tags: ['discord'] }
);

export const getCachedGuildMember = unstable_cache(
    async (userId: string) => {
        return await getGuildMember(userId);
    },
    ['discord-user'],
    { revalidate: 300, tags: ['discord'] }
);

/**
 * Optimized helper to get multiple members. 
 * Tries the batch cache first, then falls back to parallel individual fetches.
 */
export async function getGuildMembersData(userIds: string[]): Promise<Record<string, DiscordMemberData | null>> {
    const cachedMap = await getCachedGuildMembers();
    const results: Record<string, DiscordMemberData | null> = {};
    const missingIds: string[] = [];

    // 1. Check batch cache
    userIds.forEach(id => {
        if (cachedMap[id]) {
            results[id] = cachedMap[id];
        } else {
            missingIds.push(id);
        }
    });

    // 2. Fallback for missing ones (or if batch failed completely)
    if (missingIds.length > 0) {
        // Limit concurrency to avoid getting flagged by Discord
        const concurrencyLimit = 5;
        for (let i = 0; i < missingIds.length; i += concurrencyLimit) {
            const chunk = missingIds.slice(i, i + concurrencyLimit);
            const data = await Promise.all(chunk.map(id => getCachedGuildMember(id)));
            chunk.forEach((id, index) => {
                results[id] = data[index];
            });
        }
    }

    return results;
}

export const getCachedGuildRoles = unstable_cache(
    async () => {
        return await getGuildRoles();
    },
    ['discord-guild-roles'],
    { revalidate: 3600, tags: ['discord'] }
);

export async function updateGuildMemberRoles(discordUserId: string, roleIds: string[]): Promise<boolean> {
    if (!rest || !DISCORD_GUILD_ID) {
        return false;
    }

    try {
        await rest.patch(
            Routes.guildMember(DISCORD_GUILD_ID, discordUserId),
            {
                body: {
                    roles: roleIds
                }
            }
        );
        return true;
    } catch (error) {
        console.error("Error updating Discord member roles:", error);
        return false;
    }
}

export async function updateGuildMember(discordUserId: string, data: { nick?: string | null; roles?: string[] }): Promise<boolean> {
    if (!rest || !DISCORD_GUILD_ID) {
        return false;
    }

    try {
        const body: any = {};
        if (data.nick !== undefined) body.nick = data.nick;
        if (data.roles !== undefined) body.roles = data.roles;

        await rest.patch(
            Routes.guildMember(DISCORD_GUILD_ID, discordUserId),
            { body }
        );
        return true;
    } catch (error) {
        console.error("Error updating Discord member:", error);
        return false;
    }
}

export async function getGuildRoles(): Promise<DiscordRole[]> {
    if (!rest || !DISCORD_GUILD_ID) {
        return [];
    }
    try {
        const roles = await rest.get(Routes.guildRoles(DISCORD_GUILD_ID)) as any[];
        return roles.map(r => ({
            id: r.id,
            name: r.name,
            color: r.color,
            position: r.position
        }));
    } catch (error) {
        console.error("Error fetching guild roles:", error);
        return [];
    }
}

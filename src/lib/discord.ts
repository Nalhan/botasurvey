import { REST } from '@discordjs/rest';
import { Routes, APIGuildMember } from 'discord-api-types/v10';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// If we don't have tokens, we'll return mock data or nulls to avoid breaking dev
// unless we are in a production build where this is required.

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

export async function getGuildMember(discordUserId: string): Promise<DiscordMemberData | null> {
    if (!rest || !DISCORD_GUILD_ID) {
        console.warn("Discord credentials missing, skipping getGuildMember.");
        return null;
    }

    try {
        const member = await rest.get(
            Routes.guildMember(DISCORD_GUILD_ID, discordUserId)
        ) as APIGuildMember;

        return {
            isInGuild: true,
            nickname: member.nick || null,
            username: member.user?.username || null,
            avatar: member.user?.avatar || null,
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

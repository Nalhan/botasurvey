"use client";

import { useState } from "react";
import NextImage from "next/image";
import { formatDiscordAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DiscordRole } from "@/lib/discord";
import { bulkApplyDiscordChanges, removeRoleFromAllDiscordMembers } from "@/app/actions/admin";
import { Loader2, Save, Undo, Wand2, AlertTriangle, X, PlusCircle, ChevronDown, Check } from "lucide-react";
import { WOW_CLASSES } from "@/lib/wow-classes";
import { WOW_PROFESSIONS } from "@/lib/wow-professions";
import { ZamIcon } from "@/components/ui/zam-icon";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminUser {
    internalId: string;
    name: string | null;
    avatar: string | null;
    submission: any;
    discordId: string | null;
    discordData: {
        isInGuild: boolean;
        nickname: string | null;
        roles: string[];
        avatar: string | null;
    } | null;
}

interface DiscordRolesProps {
    data: AdminUser[];
    roles: DiscordRole[];
    roster: any[];
    initialRoleMappings: Record<string, string>;
}

export function DiscordRoles({ data, roles, roster, initialRoleMappings }: DiscordRolesProps) {
    const [activeTab, setActiveTab] = useState<'roles' | 'settings' | 'bulk'>('roles');
    const [stagedChanges, setStagedChanges] = useState<Record<string, { nick?: string, roles: Set<string> }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [warnings, setWarnings] = useState<string[]>([]);

    // Bulk Actions State
    const [isBulkRemoving, setIsBulkRemoving] = useState(false);
    const [bulkRemoveRole, setBulkRemoveRole] = useState<string>("");

    // Mappings State
    const [roleMappings, setRoleMappings] = useState<Record<string, string>>(initialRoleMappings);
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // --- Actions ---

    const handleStageRole = (userId: string, roleId: string, action: 'add' | 'remove') => {
        setStagedChanges(prev => {
            const current = prev[userId] || { roles: new Set<string>() };
            const existingRoles = data.find(u => u.discordId === userId)?.discordData?.roles || [];

            // Start with current distinct roles if not already staged
            if (!prev[userId]) {
                existingRoles.forEach(r => current.roles.add(r));
            }

            const newRoles = new Set(current.roles);
            if (action === 'add') newRoles.add(roleId);
            else newRoles.delete(roleId);

            // Check if final set matches live exactly. If so, drop the stage.
            const liveSet = new Set(existingRoles);
            let isSame = newRoles.size === liveSet.size;
            if (isSame) {
                for (const r of newRoles) {
                    if (!liveSet.has(r)) {
                        isSame = false;
                        break;
                    }
                }
            }

            if (isSame) {
                const { [userId]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [userId]: { ...current, roles: newRoles }
            };
        });
    };

    const handleAutoStage = () => {
        const changes: Record<string, { roles: Set<string> }> = {};
        const newWarnings: string[] = [];

        // 1. Identify all "Managed Roles" (roles we are controlling via mappings OR auto-match)
        const managedRoleIds = new Set<string>();

        // A. Add explicit mappings
        Object.values(roleMappings).forEach(id => {
            if (id) managedRoleIds.add(id);
        });

        // B. Add all possible exact matches (since they are "managed" by auto-logic)
        WOW_CLASSES.forEach(c => {
            const match = roles.find(r => r.name.toLowerCase() === c.name.toLowerCase());
            if (match) managedRoleIds.add(match.id);
        });
        WOW_PROFESSIONS.forEach(p => {
            const match = roles.find(r => r.name.toLowerCase() === p.name.toLowerCase());
            if (match) managedRoleIds.add(match.id);
        });

        const raiderMatch = roles.find(r => r.name.toLowerCase() === "raider");
        if (raiderMatch) managedRoleIds.add(raiderMatch.id);
        const casualMatch = roles.find(r => r.name.toLowerCase() === "casual");
        if (casualMatch) managedRoleIds.add(casualMatch.id);

        // 2. Process each user
        data.forEach(user => {
            if (!user.discordId || !user.discordData?.isInGuild) return;
            const dId = user.discordId;

            const targetRoleIds = new Set<string>();

            // Target Set A: Class
            const playerInRoster = roster.find(p => p.userId === user.internalId);
            if (playerInRoster) {
                const wowClass = WOW_CLASSES.find(c => c.id === playerInRoster.classId);
                if (wowClass) {
                    let rId = roleMappings[wowClass.id];
                    if (!rId) {
                        const match = roles.find(r => r.name.toLowerCase() === wowClass.name.toLowerCase());
                        if (match) rId = match.id;
                        else if (!newWarnings.includes(`No role for class '${wowClass.name}'`)) {
                            newWarnings.push(`No role for class '${wowClass.name}'`);
                        }
                    }
                    if (rId) targetRoleIds.add(rId);
                }
            }

            // Target Set B: Professions
            if (user.submission?.professions) {
                (user.submission.professions as any[]).forEach(p => {
                    const prof = WOW_PROFESSIONS.find(wp => wp.id === p.id);
                    if (prof) {
                        let rId = roleMappings[prof.id];
                        if (!rId) {
                            const match = roles.find(r => r.name.toLowerCase() === prof.name.toLowerCase());
                            if (match) rId = match.id;
                            else if (!newWarnings.includes(`No role for '${prof.name}'`)) {
                                newWarnings.push(`No role for '${prof.name}'`);
                            }
                        }
                        if (rId) targetRoleIds.add(rId);
                    }
                });
            }

            // Target Set C: Involvement
            const involvement = user.submission?.involvement;
            if (involvement === "core" || involvement === "fill") {
                const raiderMatch = roles.find(r => r.name.toLowerCase() === "raider");
                if (raiderMatch) targetRoleIds.add(raiderMatch.id);
                else if (!newWarnings.includes(`No role for 'Raider'`)) {
                    newWarnings.push(`No role for 'Raider'`);
                }
            } else if (involvement === "heroic") {
                const casualMatch = roles.find(r => r.name.toLowerCase() === "casual");
                if (casualMatch) targetRoleIds.add(casualMatch.id);
                else if (!newWarnings.includes(`No role for 'Casual'`)) {
                    newWarnings.push(`No role for 'Casual'`);
                }
            }

            // C. Sync Logic: Start with live, Add Targets, Remove unselected Managed
            const currentLiveRoles = new Set(user.discordData.roles);
            const finalRoles = new Set(currentLiveRoles);

            // Add targets
            targetRoleIds.forEach(id => finalRoles.add(id));

            // Remove managed roles that are NOT targets
            currentLiveRoles.forEach(rId => {
                if (managedRoleIds.has(rId) && !targetRoleIds.has(rId)) {
                    finalRoles.delete(rId);
                }
            });

            // Check if different from live
            let hasChanges = false;
            if (finalRoles.size !== currentLiveRoles.size) {
                hasChanges = true;
            } else {
                for (const r of finalRoles) {
                    if (!currentLiveRoles.has(r)) {
                        hasChanges = true;
                        break;
                    }
                }
            }

            if (hasChanges) {
                changes[dId] = { roles: finalRoles };
            }
        });

        setWarnings(newWarnings);
        setStagedChanges(prev => ({ ...prev, ...changes }));
    };

    const handleApply = async () => {
        setIsSaving(true);
        try {
            const payload = Object.entries(stagedChanges).map(([userId, change]) => ({
                userId,
                nick: change.nick,
                roles: Array.from(change.roles)
            }));

            const result = await bulkApplyDiscordChanges(payload);
            if (result.success) {
                alert("Changes applied successfully!");
                setStagedChanges({});
                window.location.reload();
            } else {
                alert("Failed to apply changes: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error applying changes");
        } finally {
            setIsSaving(false);
        }
    };

    const saveSettings = async () => {
        setIsSavingSettings(true);
        try {
            const res = await fetch('/api/raid-comp');
            const currentData = await res.json();

            await fetch('/api/raid-comp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roster: currentData.roster,
                    overrides: currentData.overrides,
                    roleMappings
                })
            });
            alert("Settings saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleBulkRemove = async () => {
        if (!bulkRemoveRole) return;
        const role = roles.find(r => r.id === bulkRemoveRole);
        if (!role) return;

        if (!confirm(`Are you absolutely sure you want to remove the role "@${role.name}" from EVERYONE who has it in the Discord server? This cannot be undone.`)) {
            return;
        }

        setIsBulkRemoving(true);
        try {
            const result = await removeRoleFromAllDiscordMembers(bulkRemoveRole);
            if (result.success) {
                alert(`Successfully removed role from ${result.count} members!`);
                window.location.reload();
            } else {
                alert(`Removed from ${result?.count || 0}, but failed for ${result?.failed || 0}. ${result?.error || ""}`);
            }
        } catch (e) {
            console.error(e);
            alert("Error executing bulk removal");
        } finally {
            setIsBulkRemoving(false);
            setBulkRemoveRole("");
        }
    };

    const hasChanges = Object.keys(stagedChanges).length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-secondary/20 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'roles' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        Role Management
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'settings' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        Mapping Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", activeTab === 'bulk' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                        Bulk Actions
                    </button>
                </div>
            </div>

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-lg border">
                        <div className="flex gap-4 items-center">
                            <Button size="sm" variant="outline" onClick={handleAutoStage} className="gap-2">
                                <Wand2 className="w-3 h-3 text-indigo-500" />
                                Auto-Stage Managed Roles
                            </Button>
                            {warnings.length > 0 && (
                                <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>{warnings.length} warnings (check Settings)</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {hasChanges && (
                                <Button variant="ghost" size="sm" onClick={() => setStagedChanges({})} disabled={isSaving}>
                                    <Undo className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            )}
                            <Button onClick={handleApply} disabled={!hasChanges || isSaving} className="bg-green-600 hover:bg-green-700">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Apply Changes ({Object.keys(stagedChanges).length})
                            </Button>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Current Roles</TableHead>
                                    <TableHead>Staged Roles</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.filter(u => u.discordId).map(user => {
                                    const staged = stagedChanges[user.discordId!];
                                    const currentRoles = user.discordData?.roles || [];
                                    const finalRoles = staged ? Array.from(staged.roles) : currentRoles;

                                    const addedRoles = finalRoles.filter(r => !currentRoles.includes(r));
                                    const removedRoles = currentRoles.filter(r => !finalRoles.includes(r));
                                    const keptRoles = currentRoles.filter(r => finalRoles.includes(r));

                                    return (
                                        <TableRow key={user.internalId}>
                                            <TableCell className="w-72">
                                                <div className="flex items-center gap-3">
                                                    {(user.discordData?.avatar || (user.discordId && user.avatar)) ? (
                                                        <NextImage
                                                            src={user.discordData?.avatar || formatDiscordAvatar(user.discordId!, user.avatar)!}
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-full bg-secondary"
                                                            alt={user.name || ""}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">{user.name?.[0]}</div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.discordData?.nickname || user.discordId}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {keptRoles.length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
                                                    {keptRoles.map(rid => {
                                                        const r = roles.find(role => role.id === rid);
                                                        return r ? (
                                                            <div
                                                                key={rid}
                                                                className="group relative flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all duration-300 hover:pr-4.5 cursor-default hover:bg-red-100 dark:hover:bg-red-900/30 overflow-hidden whitespace-nowrap"
                                                                style={{
                                                                    color: r.color ? `#${r.color.toString(16)}` : 'inherit',
                                                                    backgroundColor: 'transparent', // controlled by hover above or default style
                                                                    borderColor: 'currentColor' // basic border
                                                                }}
                                                            >
                                                                <span className="opacity-90">{r.name}</span>
                                                                <button onClick={() => handleStageRole(user.discordId!, rid, 'remove')} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-500 flex items-center justify-center">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-md">
                                                    {removedRoles.map(rid => {
                                                        const r = roles.find(role => role.id === rid);
                                                        return r ? (
                                                            <div
                                                                key={rid}
                                                                className="group relative flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all duration-300 hover:pr-5 cursor-default bg-red-500/10 text-red-500 border-red-500/20 overflow-hidden whitespace-nowrap opacity-70"
                                                            >
                                                                <span className="line-through">{r.name}</span>
                                                                <button onClick={() => handleStageRole(user.discordId!, rid, 'add')} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-400 flex items-center justify-center">
                                                                    <Undo className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                    {addedRoles.map(rid => {
                                                        const r = roles.find(role => role.id === rid);
                                                        return r ? (
                                                            <div
                                                                key={rid}
                                                                className="group relative flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all duration-300 hover:pr-5 cursor-default bg-green-500/10 text-green-500 border-green-500/20 overflow-hidden whitespace-nowrap"
                                                            >
                                                                <span>+ {r.name}</span>
                                                                <button onClick={() => handleStageRole(user.discordId!, rid, 'remove')} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-rose-500 flex items-center justify-center">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                    {!staged && <span className="text-xs text-muted-foreground italic opacity-50">No changes</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <RoleSelector
                                                    roles={roles.filter(r => !finalRoles.includes(r.id))}
                                                    onSelect={(rid) => handleStageRole(user.discordId!, rid, 'add')}
                                                    trigger={
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-secondary">
                                                            <PlusCircle className="w-4 h-4 text-muted-foreground" />
                                                        </Button>
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                            <h2 className="text-lg font-semibold">Role Mappings</h2>
                            <p className="text-sm text-muted-foreground">Map WoW Classes and Professions to Discord Roles. </p>
                        </div>
                        <Button onClick={saveSettings} disabled={isSavingSettings}>
                            {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Settings
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Classes</h3>
                            <div className="space-y-2 max-h-125 overflow-y-auto pr-2">
                                {WOW_CLASSES.map(c => {
                                    const match = roles.find(r => r.name.toLowerCase() === c.name.toLowerCase());
                                    return (
                                        <div key={c.id} className="flex items-center justify-between bg-card p-3 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <ZamIcon icon={c.icon} size={24} />
                                                <span style={{ color: c.color }} className="font-medium text-sm">{c.name}</span>
                                            </div>
                                            <div className="flex-1 ml-4">
                                                <RoleSelector
                                                    roles={roles}
                                                    value={roleMappings[c.id]}
                                                    placeholder={match ? `Matches: @${match.name}` : "Matches: None (Warning)"}
                                                    onSelect={(rid) => setRoleMappings(prev => ({ ...prev, [c.id]: rid }))}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Professions</h3>
                            <div className="space-y-2 max-h-125 overflow-y-auto pr-2">
                                {WOW_PROFESSIONS.map(p => {
                                    const match = roles.find(r => r.name.toLowerCase() === p.name.toLowerCase());
                                    return (
                                        <div key={p.id} className="flex items-center justify-between bg-card p-3 rounded-md border">
                                            <div className="flex items-center gap-2">
                                                <ZamIcon icon={p.icon} size={24} />
                                                <span className="font-medium text-sm">{p.name}</span>
                                            </div>
                                            <div className="flex-1 ml-4">
                                                <RoleSelector
                                                    roles={roles}
                                                    value={roleMappings[p.id]}
                                                    placeholder={match ? `Matches: @${match.name}` : "Matches: None (Warning)"}
                                                    onSelect={(rid) => setRoleMappings(prev => ({ ...prev, [p.id]: rid }))}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BULK ACTIONS TAB */}
            {activeTab === 'bulk' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center pb-4 border-b">
                        <div>
                            <h2 className="text-lg font-semibold text-rose-500">Danger Zone: Bulk Actions</h2>
                            <p className="text-sm text-muted-foreground">Perform actions on all members of the Discord server, including those not registered on this site.</p>
                        </div>
                    </div>

                    <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm border-rose-500/20">
                        <div>
                            <h3 className="font-medium text-base mb-1">Remove Role From Everyone</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select a role to remove it from <strong className="text-rose-500">every single member</strong> in the Discord server who currently has it. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 max-w-lg">
                            <div className="flex-1">
                                <RoleSelector
                                    roles={roles}
                                    value={bulkRemoveRole}
                                    onSelect={setBulkRemoveRole}
                                    placeholder="Select role to remove..."
                                />
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleBulkRemove}
                                disabled={!bulkRemoveRole || isBulkRemoving}
                            >
                                {isBulkRemoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                                Remove From All
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component for styled dropdown
function RoleSelector({
    roles,
    value,
    onSelect,
    trigger,
    placeholder = "Select Role..."
}: {
    roles: DiscordRole[],
    value?: string,
    onSelect: (id: string) => void,
    trigger?: React.ReactNode,
    placeholder?: string
}) {
    const selectedRole = roles.find(r => r.id === value);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8 w-full justify-between text-xs font-normal">
                        {selectedRole ? (
                            <span style={{ color: selectedRole.color ? `#${selectedRole.color.toString(16)}` : 'inherit' }}>@{selectedRole.name}</span>
                        ) : (
                            <span className="text-muted-foreground/70 italic truncate">{placeholder}</span>
                        )}
                        <ChevronDown className="w-3 h-3 opacity-50 ml-2" />
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-75 overflow-y-auto min-w-40">
                <DropdownMenuItem onClick={() => onSelect("")}>
                    <span className="text-muted-foreground text-xs italic">Reset to Auto</span>
                </DropdownMenuItem>
                {roles.map(r => (
                    <DropdownMenuItem
                        key={r.id}
                        onClick={() => onSelect(r.id)}
                        className="flex items-center justify-between gap-4"
                    >
                        <span style={{ color: r.color ? `#${r.color.toString(16)}` : 'inherit' }}>{r.name}</span>
                        {value === r.id && <Check className="w-3 h-3 opacity-50" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

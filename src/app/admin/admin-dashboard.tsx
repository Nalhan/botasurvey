"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DiscordRoles } from "./discord-roles";
import { AdminUserList } from "./admin-user-list";
import { cn } from "@/lib/utils";
import { Users, Shield, Settings } from "lucide-react";

interface AdminDashboardProps {
    adminData: any[];
    guildRoles: any[];
    roster: any[];
    initialRoleMappings: Record<string, string>;
}

export function AdminDashboard({ adminData, guildRoles, roster, initialRoleMappings }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

    return (
        <div className="bg-card border rounded-lg overflow-hidden">
            <div className="flex bg-secondary/20 p-1 border-b">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'roles'
                            ? "bg-card shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Shield className="w-4 h-4" />
                    Discord Roles
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeTab === 'users'
                            ? "bg-card shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Users className="w-4 h-4" />
                    User Management
                </button>
            </div>

            <div className="p-4">
                {activeTab === 'roles' && (
                    <DiscordRoles
                        data={adminData}
                        roles={guildRoles}
                        roster={roster}
                        initialRoleMappings={initialRoleMappings}
                    />
                )}

                {activeTab === 'users' && (
                    <AdminUserList data={adminData} />
                )}
            </div>
        </div>
    );
}

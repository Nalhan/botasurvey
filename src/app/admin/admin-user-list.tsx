"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser } from "@/app/actions/admin";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

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
    } | null;
}

interface AdminUserListProps {
    data: AdminUser[];
}

export function AdminUserList({ data }: AdminUserListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (userId: string, userName: string | null) => {
        if (!confirm(`Are you sure you want to completely delete ${userName || 'this user'} and their response? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(userId);
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                window.location.reload();
            } else {
                alert("Failed to delete user: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting user");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20 w-fit">
                <AlertTriangle className="w-3 h-3" />
                <span>Deleting a user will remove their account and all associated survey responses.</span>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Discord ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(user => (
                            <TableRow key={user.internalId}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <NextImage
                                                src={user.avatar}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full bg-secondary"
                                                alt={user.name || "User"}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">{user.name?.[0] || "?"}</div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{user.name || "Unknown"}</span>
                                            <span className="text-xs text-muted-foreground">{user.discordData?.nickname || user.discordId || "No Discord Linked"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">
                                    {user.discordId || "N/A"}
                                </TableCell>
                                <TableCell>
                                    {user.submission ? (
                                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">Has Response</span>
                                    ) : (
                                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded border">No Response</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(user.internalId, user.name)}
                                        disabled={isDeleting === user.internalId}
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 gap-2"
                                    >
                                        {isDeleting === user.internalId ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3" />
                                        )}
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

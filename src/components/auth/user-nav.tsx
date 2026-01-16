"use client";

import { useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function UserNav({ user }: { user: any }) {
    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4">
            <div className="flex items-center gap-3 bg-secondary/50 backdrop-blur-md pl-3 pr-2 py-1.5 rounded-full border border-white/5 shadow-lg">
                <div className="flex items-center gap-2">
                    {user.image ? (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20">
                            <Image
                                src={user.image}
                                alt={user.name || "User"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center ring-1 ring-white/10">
                            <User className="w-3 h-3 text-indigo-400" />
                        </div>
                    )}
                    <span className="text-xs font-medium text-foreground/80 max-w-[100px] truncate">
                        {user.name}
                    </span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 hover:bg-rose-500/20 hover:text-rose-400 rounded-full transition-colors"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    title="Sign Out"
                >
                    <LogOut className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}

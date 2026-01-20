import * as React from "react";
import { Shield, Sword, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleIconProps {
    role: string;
    className?: string;
    size?: number;
}

export function RoleIcon({ role, className, size = 10 }: RoleIconProps) {
    switch (role) {
        case 'Tank':
            return (
                <div className={cn("bg-blue-500/15 text-blue-400 rounded-sm shadow-sm border border-blue-500 p-0.75", className)}>
                    <Shield size={size} className="fill-blue-400/20" />
                </div>
            );
        case 'Healer':
            return (
                <div className={cn("bg-green-500/15 text-green-400 rounded-sm border border-green-500/25 shadow-sm p-0.75", className)}>
                    <Heart size={size} className="fill-green-400/20" />
                </div>
            );
        case 'Damage':
            return (
                <div className={cn("bg-red-500/15 text-red-400 rounded-sm shadow-sm border border-red-500/25 p-0.75", className)}>
                    <Sword size={size} className="fill-red-400/20" />
                </div>
            );
        default:
            return null;
    }
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block w-full" ref={containerRef}>
            {React.Children.map(children, child => {
                // @ts-ignore
                return React.cloneElement(child, { open, setOpen });
            })}
        </div>
    );
};

const DropdownMenuTrigger = ({ children, asChild, open, setOpen, ...props }: any) => {
    return (
        <div onClick={() => setOpen(!open)} {...props}>
            {children}
        </div>
    );
};

const DropdownMenuContent = ({ className, align = "center", children, open, ...props }: any) => {
    if (!open) return null;
    return (
        <div
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 absolute top-full mt-2",
                align === "start" && "left-0",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "end" && "right-0",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>
    );
};

const DropdownMenuItem = ({ className, inset, children, ...props }: any) => (
    <div
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            inset && "pl-8",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

const DropdownMenuLabel = ({ className, inset, ...props }: any) => (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
);

const DropdownMenuSeparator = ({ className, ...props }: any) => (
    <div className="-mx-1 my-1 h-px bg-muted" {...props} />
);

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
};

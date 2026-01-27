"use client";

import { createPortal } from "react-dom";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = React.createContext<DropdownContextProps | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                // Also check if click is inside the portal content (which is not a child of triggerRef)
                // We'll handle this by putting a data-attribute on the portal or ensuring event bubbling works? 
                // Portals bubble events to ancestors in React tree, so `onClick` on parent usually works, 
                // but `handleClickOutside` uses native DOM event.
                // The Portal content will be in `document.body`.
                const portalContent = document.getElementById("dropdown-portal-content");
                if (portalContent && portalContent.contains(event.target as Node)) {
                    return;
                }
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <DropdownContext.Provider value={{ open, setOpen, triggerRef: triggerRef as React.RefObject<HTMLDivElement> }}>
            {children}
        </DropdownContext.Provider>
    );
};

const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

    return (
        <div
            ref={context.triggerRef}
            onClick={() => context.setOpen(!context.open)}
            className="inline-block"
            {...props}
        >
            {children}
        </div>
    );
};

const DropdownMenuContent = ({ className, align = "center", children, ...props }: any) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

    React.useLayoutEffect(() => {
        if (context.open && context.triggerRef.current) {
            const rect = context.triggerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            setPosition({
                top: rect.bottom + scrollY + 5,
                left: rect.left + scrollX, // Simplify left align for now
                width: rect.width
            });
        }
    }, [context.open]);

    if (!context.open) return null;

    return createPortal(
        <div
            id="dropdown-portal-content"
            style={{
                position: "absolute",
                top: position.top,
                left: position.left,
                minWidth: position.width
            }}
            className={cn(
                "z-50 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>,
        document.body
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

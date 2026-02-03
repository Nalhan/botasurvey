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
            onClick={(e) => {
                e.stopPropagation();
                context.setOpen(!context.open);
            }}
            onPointerDown={(e) => e.stopPropagation()}
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
    const [side, setSide] = React.useState<"top" | "bottom">("bottom");

    React.useLayoutEffect(() => {
        if (context.open && context.triggerRef.current) {
            const updatePosition = () => {
                if (!context.triggerRef.current) return;
                const rect = context.triggerRef.current.getBoundingClientRect();
                const scrollY = window.scrollY;
                const scrollX = window.scrollX;
                const viewportHeight = window.innerHeight;

                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;

                // Flip to top if space below is less than 350px and there's more space above
                const shouldFlip = spaceBelow < 350 && spaceAbove > spaceBelow;

                setSide(shouldFlip ? "top" : "bottom");
                setPosition({
                    top: shouldFlip ? rect.top + scrollY - 5 : rect.bottom + scrollY + 5,
                    left: rect.left + scrollX,
                    width: rect.width
                });
            };

            updatePosition();
            // Use capture phase for scroll to catch internal container scrolling
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);

            return () => {
                window.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }
    }, [context.open, context.triggerRef]);

    if (!context.open) return null;

    return createPortal(
        <div
            id="dropdown-portal-content"
            style={{
                position: "absolute",
                top: position.top,
                left: position.left,
                minWidth: position.width,
                transform: side === "top" ? "translateY(-100%)" : "none",
                transformOrigin: side === "top" ? "bottom left" : "top left",
            }}
            className={cn(
                "z-50 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
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

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const Tooltip = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement>(null);

    return (
        <div
            className={cn("inline-block", className)}
            style={style}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    if (child.type === TooltipTrigger) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            ref: triggerRef
                        });
                    }
                    if (child.type === TooltipContent) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            open,
                            triggerRef
                        });
                    }
                }
                return child;
            })}
        </div>
    );
};

const TooltipTrigger = React.forwardRef<any, any>(({ children, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ref,
            ...props
        });
    }
    return <button ref={ref} {...props}>{children}</button>;
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = ({ className, side = "top", children, open, triggerRef, ...props }: any) => {
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0 });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (open && triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Simple positioning logic
            if (side === "top") {
                setCoords({
                    top: rect.top - 8,
                    left: rect.left + rect.width / 2
                });
            } else if (side === "right") {
                setCoords({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 8
                });
            }
        }
    }, [open, triggerRef, side]);

    if (!mounted || !open) return null;

    return createPortal(
        <div
            className={cn(
                "fixed z-[1000] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none",
                side === "top" && "-translate-x-1/2 -translate-y-full",
                side === "right" && "-translate-y-1/2",
                className
            )}
            style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
            }}
            {...props}
        >
            {children}
            {/* Optional arrow could go here */}
        </div>,
        document.body
    );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

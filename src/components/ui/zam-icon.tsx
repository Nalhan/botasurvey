import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface ZamIconProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'width' | 'height'> {
    icon: string
    size: number
}

export const ZamIcon = forwardRef<HTMLImageElement, ZamIconProps>(({ alt, size, icon, className, ...props }, ref) => (
    <img
        {...props}
        ref={ref}
        alt={alt || icon}
        width={size}
        height={size}
        src={`https://wow.zamimg.com/images/wow/icons/large/${icon}.jpg`}
        className={cn("flex-shrink-0 rounded shadow-sm border border-black/20", className)}
        style={{ ...props.style }}
    />
))

ZamIcon.displayName = 'ZamIcon'

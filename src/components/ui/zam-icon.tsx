import { forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ZamIconProps {
    icon: string
    size: number
    alt?: string
    className?: string
}

export const ZamIcon = forwardRef<HTMLImageElement, ZamIconProps>(({ alt, size, icon, className }, ref) => (
    <Image
        ref={ref}
        alt={alt || icon}
        width={size}
        height={size}
        src={`https://wow.zamimg.com/images/wow/icons/large/${icon}.jpg`}
        className={cn("flex-shrink-0 rounded shadow-sm border border-black/20", className)}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
))

ZamIcon.displayName = 'ZamIcon'

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
} | null>(null)

const useDialog = () => {
    const context = React.useContext(DialogContext)
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider")
    }
    return context
}

export const Dialog = ({
    children,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const isControlled = controlledOpen !== undefined

    const open = isControlled ? controlledOpen : uncontrolledOpen
    const onOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(newOpen)
        }
        controlledOnOpenChange?.(newOpen)
    }

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

export const DialogTrigger = ({
    asChild,
    children,
    onClick,
    ...props
}: React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => {
    const { onOpenChange } = useDialog()

    return (
        // @ts-ignore - Simple implementation skipping complex Slot logic for now, using cloneElement if asChild usually
        // For now, if asChild is true, we assume the child is a single React Element and clone it.
        asChild && React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement, {
                // @ts-ignore
                onClick: (e) => {
                    (children as any).props.onClick?.(e);
                    onOpenChange(true);
                }
            })
        ) : (
            <button
                onClick={(e) => {
                    onClick?.(e)
                    onOpenChange(true)
                }}
                {...props}
            >
                {children}
            </button>
        )
    )
}

export const DialogContent = ({
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const { open, onOpenChange } = useDialog()

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div className={cn(
                "relative z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                className
            )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>,
        document.body
    )
}

export const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
)

export const DialogTitle = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
)

export const DialogDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
)

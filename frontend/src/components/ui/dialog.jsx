import * as React from "react"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

const DialogContext = React.createContext({ open: false, onClose: () => {} })

const Dialog = ({ open, onClose, children }) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  React.useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ open, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-card border shadow-2xl animate-in fade-in zoom-in-95 mx-4">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

const DialogContent = ({ className, ...props }) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex justify-end space-x-2 p-6 pt-4 border-t", className)} {...props} />
)

const DialogClose = ({ className, ...props }) => {
  const { onClose } = React.useContext(DialogContext)
  return (
    <button
      onClick={onClose}
      className={cn("absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity", className)}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, DialogClose }

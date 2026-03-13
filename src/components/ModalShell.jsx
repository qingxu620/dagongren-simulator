import { useEffect } from 'react'
import { X } from 'lucide-react'

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

function ModalShell({
  isOpen,
  onClose,
  closeOnOverlay = Boolean(onClose),
  closeOnEscape = Boolean(onClose),
  zIndexClass = 'z-50',
  panelClassName = '',
  children,
}) {
  useEffect(() => {
    if (!isOpen || !onClose || !closeOnEscape) {
      return undefined
    }

    const onWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onWindowKeyDown)
    return () => window.removeEventListener('keydown', onWindowKeyDown)
  }, [closeOnEscape, isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={joinClasses('fixed inset-0 flex items-center justify-center bg-black/50 p-4 sm:p-6', zIndexClass)}
      onClick={closeOnOverlay && onClose ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={joinClasses(
          'flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ children, className = '' }) {
  return <header className={joinClasses('shrink-0 border-b border-slate-200 p-4', className)}>{children}</header>
}

function ModalBody({ children, className = '' }) {
  return (
    <div className={joinClasses('modal-scroll flex-1 overflow-y-auto overscroll-contain p-4 space-y-3', className)}>
      {children}
    </div>
  )
}

function ModalFooter({ children, className = '' }) {
  return <footer className={joinClasses('shrink-0 border-t border-slate-200 bg-gray-50 p-4', className)}>{children}</footer>
}

function ModalCloseButton({ onClick, label = '关闭' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
    >
      <X size={18} />
    </button>
  )
}

export { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, ModalShell }

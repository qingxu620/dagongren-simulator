function getToastClass(type) {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (type === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (type === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-sky-200 bg-sky-50 text-sky-700'
}

function ToastStack({ toasts }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-xl border px-3 py-2 text-sm shadow-lg ${getToastClass(toast.type)}`}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default ToastStack

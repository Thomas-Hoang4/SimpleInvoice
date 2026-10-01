import { FileText, CheckCircle2 } from 'lucide-react'

export function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">SimpleInvoice</h1>
            <p className="text-xs font-medium text-slate-500">101 Digital Technical Assessment</p>
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Frontend Scaffolded Successfully</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Vite + React + Tailwind CSS + TanStack Query ready for implementation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

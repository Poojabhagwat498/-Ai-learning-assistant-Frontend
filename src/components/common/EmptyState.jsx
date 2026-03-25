import React from 'react'
import {FileText, Plus} from 'lucide-react'

const EmptyState = ({onActionClick, title, description, buttonText}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-linear-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <FileText className="w-8 h-8 text-white" strokeWidth={2} />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">{description}</p>
      
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="group relative inline-flex items-center gap-2 px-6 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {buttonText}
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
        </button>
      )}
    </div>
  )
}

export default EmptyState
import React from 'react'

export function Button({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors cursor-pointer'
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    outline: 'border border-slate-600 text-slate-200 hover:bg-slate-800',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

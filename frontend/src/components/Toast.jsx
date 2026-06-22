import React from 'react'

export default function Toast({ toast }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  const isWarn  = toast.type === 'warning'

  const colors = {
    success: { bg: '#0a1a10', border: 'var(--green)', color: 'var(--green)', icon: '✓' },
    error:   { bg: '#1a0a0a', border: 'var(--red)',   color: 'var(--red)',   icon: '✕' },
    warning: { bg: '#1a140a', border: 'var(--yellow)', color: 'var(--yellow)', icon: '⚠' },
    info:    { bg: '#0a0f1a', border: 'var(--blue)',  color: 'var(--blue)',  icon: 'ℹ' },
  }
  const c = colors[toast.type] || colors.info

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 18px',
      borderRadius: 10,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      maxWidth: 400,
      animation: 'fadeInUp 0.2s ease',
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <span style={{ lineHeight: 1.5 }}>{toast.message}</span>
    </div>
  )
}

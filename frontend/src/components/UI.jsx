import React from 'react';

/* ── BADGE ─────────────────────────────────────────────────── */
const statusCfg = {
  Pending:   { color:'#D97706', bg:'rgba(217,119,6,0.08)',   border:'rgba(217,119,6,0.2)',   label:'Menunggu' },
  Verified:  { color:'#059669', bg:'rgba(5,150,105,0.08)',   border:'rgba(5,150,105,0.2)',   label:'Terverifikasi' },
  Disbursed: { color:'#7C3AED', bg:'rgba(124,58,237,0.08)', border:'rgba(124,58,237,0.2)', label:'Dicairkan' },
  Rejected:  { color:'#DC2626', bg:'rgba(220,38,38,0.08)',   border:'rgba(220,38,38,0.2)',   label:'Ditolak' },
  Suspended: { color:'#9CA3AF', bg:'rgba(156,163,175,0.08)', border:'rgba(156,163,175,0.2)', label:'Ditangguhkan' },
  active:    { color:'#059669', bg:'rgba(5,150,105,0.08)',   border:'rgba(5,150,105,0.2)',   label:'Aktif' },
  closed:    { color:'#9CA3AF', bg:'rgba(156,163,175,0.08)', border:'rgba(156,163,175,0.2)', label:'Ditutup' },
};

export function Badge({ status }) {
  const c = statusCfg[status] || { color:'#6B7280', bg:'#F3F4F6', border:'#E5E7EB', label: status };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20,
      fontSize:11, fontWeight:600,
      color:c.color, background:c.bg,
      border:`1px solid ${c.border}`,
      whiteSpace:'nowrap',
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:c.color, flexShrink:0 }} />
      {c.label}
    </span>
  );
}

/* ── BUTTON ────────────────────────────────────────────────── */
export function Button({ children, variant='primary', size='md', onClick, disabled, type='button', style }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    gap:6, border:'none', borderRadius:'var(--radius)',
    fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition:'all 0.15s',
    fontSize: size==='sm' ? 12 : 13,
    padding: size==='sm' ? '6px 12px' : size==='lg' ? '12px 24px' : '9px 18px',
    letterSpacing: '-0.1px',
    ...style,
  };
  const variants = {
    primary: { background:'var(--purple)', color:'#fff', boxShadow:'0 2px 8px rgba(124,58,237,0.3)' },
    secondary: { background:'var(--white)', color:'var(--black)', border:'1px solid var(--gray-200)', boxShadow:'var(--shadow-sm)' },
    ghost: { background:'transparent', color:'var(--gray-500)', border:'1px solid var(--gray-200)' },
    danger: { background:'var(--red-dim)', color:'var(--red)', border:'1px solid rgba(220,38,38,0.2)' },
    success: { background:'var(--green-dim)', color:'var(--green)', border:'1px solid rgba(5,150,105,0.2)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

/* ── INPUT ─────────────────────────────────────────────────── */
export function Input({ label, hint, error, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-700)', letterSpacing:'0.1px' }}>{label}</label>}
      <input
        style={{
          width:'100%', background:'var(--white)',
          border:`1px solid ${error ? 'var(--red)' : 'var(--gray-200)'}`,
          borderRadius:'var(--radius)', color:'var(--black)',
          padding:'9px 12px', fontSize:13, outline:'none',
          transition:'border-color 0.15s, box-shadow 0.15s',
          boxShadow:'var(--shadow-sm)',
        }}
        onFocus={e => { e.target.style.borderColor='var(--purple)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
        onBlur={e => { e.target.style.borderColor=error?'var(--red)':'var(--gray-200)'; e.target.style.boxShadow='var(--shadow-sm)'; }}
        {...props}
      />
      {hint && !error && <span style={{ fontSize:11, color:'var(--gray-400)' }}>{hint}</span>}
      {error && <span style={{ fontSize:11, color:'var(--red)' }}>{error}</span>}
    </div>
  );
}

/* ── SELECT ────────────────────────────────────────────────── */
export function Select({ label, hint, error, children, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'var(--gray-700)' }}>{label}</label>}
      <select style={{
        width:'100%', background:'var(--white)',
        border:`1px solid ${error?'var(--red)':'var(--gray-200)'}`,
        borderRadius:'var(--radius)', color:'var(--black)',
        padding:'9px 12px', fontSize:13, cursor:'pointer',
        boxShadow:'var(--shadow-sm)', outline:'none',
      }} {...props}>{children}</select>
      {hint && <span style={{ fontSize:11, color:'var(--gray-400)' }}>{hint}</span>}
      {error && <span style={{ fontSize:11, color:'var(--red)' }}>{error}</span>}
    </div>
  );
}

/* ── CARD ──────────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{
      background:'var(--white)',
      border:'1px solid var(--gray-200)',
      borderRadius:'var(--radius-lg)',
      boxShadow:'var(--shadow-sm)',
      overflow:'hidden',
      ...style,
    }}>{children}</div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 25px', borderBottom:'1px solid var(--gray-100)',
      flexWrap:'wrap', gap:'24px 40px',
    }}>
      <div>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--black)', letterSpacing:'-0.2px' }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── STAT CARD ─────────────────────────────────────────────── */
export function StatCard({ label, value, sub, accent='var(--purple)' }) {
  return (
    <div style={{
      background:'var(--white)',
      border:'1px solid var(--gray-200)',
      borderRadius:'var(--radius-lg)',
      padding:'20px 24px',
      boxShadow:'var(--shadow-sm)',
      transition:'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow='var(--shadow-md)'; e.currentTarget.style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--shadow-sm)'; e.currentTarget.style.transform='none'; }}
    >
      <div style={{ width:28, height:3, background:accent, borderRadius:2, marginBottom:14 }} />
      <div style={{ fontSize:11, fontWeight:600, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.8px', color:'var(--black)', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:5 }}>{sub}</div>}
    </div>
  );
}

/* ── PROGRESS BAR ──────────────────────────────────────────── */
export function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min((value/max)*100, 100) : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:4, background:'var(--gray-100)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'var(--grad)', borderRadius:2, transition:'width 0.4s' }} />
      </div>
      <span className="mono" style={{ color:'var(--gray-400)', minWidth:44, textAlign:'right', fontSize:11 }}>
        {value}/{max}
      </span>
    </div>
  );
}

/* ── ALERT ─────────────────────────────────────────────────── */
export function Alert({ type='info', children }) {
  const cfg = {
    info:    { bg:'rgba(37,99,235,0.06)',   border:'rgba(37,99,235,0.2)',   color:'#1D4ED8' },
    success: { bg:'rgba(5,150,105,0.06)',   border:'rgba(5,150,105,0.2)',   color:'#047857' },
    error:   { bg:'rgba(220,38,38,0.06)',   border:'rgba(220,38,38,0.2)',   color:'#B91C1C' },
    warning: { bg:'rgba(217,119,6,0.06)',   border:'rgba(217,119,6,0.2)',   color:'#B45309' },
    purple:  { bg:'rgba(124,58,237,0.06)', border:'rgba(124,58,237,0.2)', color:'var(--purple)' },
  }[type];
  return (
    <div style={{
      padding:'10px 14px', borderRadius:'var(--radius)',
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      color:cfg.color, fontSize:13, lineHeight:1.5,
    }}>{children}</div>
  );
}

/* ── EMPTY STATE ───────────────────────────────────────────── */
export function EmptyState({ title, description }) {
  return (
    <div style={{ textAlign:'center', padding:'52px 20px' }}>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--gray-500)', marginBottom:4 }}>{title}</div>
      {description && <div style={{ fontSize:12, color:'var(--gray-400)' }}>{description}</div>}
    </div>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--border-2)`,
      borderTop: `2px solid var(--blue)`,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}


import React from 'react';
import { NavLink } from 'react-router-dom';
import { useFreighter } from '../hooks/useFreighter';

const navItems = [
  { to: '/',            label: 'Overview',        end: true },
  { to: '/grants',      label: 'Program Beasiswa' },
  { to: '/recipients',  label: 'Penerima' },
  { to: '/register',    label: 'Daftar Beasiswa' },
  { to: '/verify',      label: 'Verifikasi' },
  { to: '/admin',       label: 'Admin' },
];

export default function Navbar({ contractId }) {
  const { publicKey, isConnected, isLoading, connect, disconnect } = useFreighter();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '64px',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: 16,
    }}>

      {/* Logo */}
      <div style={{ flexShrink: 0, marginRight: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--black)', letterSpacing: '-0.4px' }}>
          ScholarChain
        </div>
        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
          Blockchain Scholarship Platform
        </div>
      </div>

      {/* Nav pills — tengah */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex',
          gap: 2,
          background: 'var(--gray-100)',
          border: '1px solid var(--gray-200)',
          borderRadius: 40,
          padding: '4px',
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 32,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--black)' : 'var(--gray-500)',
                background: isActive ? 'var(--white)' : 'transparent',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Kanan — contract ID + wallet */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Contract ID */}
        {contractId && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px',
            background: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            borderRadius: 6,
          }}>
            <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500 }}>Contract</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gray-700)' }}>
              {contractId.slice(0, 8)}...
            </span>
          </div>
        )}

        {/* Wallet */}
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isLoading}
            style={{
              padding: '7px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--black)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              background: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              borderRadius: 8,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 6px rgba(16,185,129,0.5)',
              }} />
              <span className="mono" style={{ fontSize: 12, color: '#047857', fontWeight: 500 }}>
                {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
              </span>
            </div>
            <button
              onClick={disconnect}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--gray-200)',
                background: 'transparent',
                color: 'var(--gray-500)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

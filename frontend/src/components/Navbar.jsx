import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useFreighter } from '../hooks/useFreighter';

const navItems = [
  { to: '/',           label: 'Overview',        end: true },
  { to: '/grants',     label: 'Program Beasiswa' },
  { to: '/recipients', label: 'Penerima' },
  { to: '/register',   label: 'Daftar Beasiswa' },
  { to: '/verify',     label: 'Verifikasi' },
  { to: '/admin',      label: 'Admin' },
];

export default function Navbar({ contractId }) {
  const { publicKey, isConnected, isLoading, connect, disconnect } = useFreighter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-pills { display: none !important; }
          .nav-wallet-desktop { display: none !important; }
          .nav-mobile-right { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-right { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: '64px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12,
      }}>

        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--black)', letterSpacing: '-0.4px' }}>
            ScholarChain
          </div>
          <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 1 }}>
            Blockchain Scholarship Platform
          </div>
        </div>

        {/* Nav pills — desktop only */}
        <div className="nav-pills" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', gap: 2,
            background: 'var(--gray-100)',
            border: '1px solid var(--gray-200)',
            borderRadius: 40, padding: '4px',
          }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '6px 14px', borderRadius: 32,
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--black)' : 'var(--gray-500)',
                  background: isActive ? 'var(--white)' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s', whiteSpace: 'nowrap', textDecoration: 'none',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Wallet — desktop only */}
        <div className="nav-wallet-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {contractId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500 }}>Contract</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--gray-700)' }}>{contractId.slice(0, 8)}...</span>
            </div>
          )}
          {!isConnected ? (
            <button onClick={connect} disabled={isLoading} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--black)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} />
                <span className="mono" style={{ fontSize: 12, color: '#047857', fontWeight: 500 }}>
                  {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
                </span>
              </div>
              <button onClick={disconnect} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', background: 'transparent', color: 'var(--gray-500)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Mobile: wallet compact + hamburger */}
        <div className="nav-mobile-right" style={{ marginLeft: 'auto', alignItems: 'center', gap: 8 }}>
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              <span className="mono" style={{ fontSize: 11, color: '#047857', fontWeight: 500 }}>
                {publicKey.slice(0, 4)}...{publicKey.slice(-3)}
              </span>
            </div>
          ) : (
            <button onClick={connect} disabled={isLoading} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'var(--black)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {isLoading ? '...' : 'Connect'}
            </button>
          )}

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--gray-200)', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, flexShrink: 0 }}
          >
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--gray-700)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(2px, 7px)' : 'none' }} />
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--gray-700)', borderRadius: 2, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--gray-700)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(2px, -7px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown — vertikal */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
            zIndex: 99,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 16px 32px',
            overflowY: 'auto',
          }}
        >
          {/* Nav links vertikal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--gray-700)' : 'var(--gray-700)',
                  background: isActive ? 'var(--gray-200)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--gray-200)', margin: '16px 0' }} />

          {/* Wallet section */}
          {isConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>Wallet Terhubung</div>
                <div className="mono" style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>
                  {publicKey.slice(0, 12)}...{publicKey.slice(-6)}
                </div>
              </div>
              <button
                onClick={() => { disconnect(); setMenuOpen(false); }}
                style={{ padding: '12px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'transparent', color: 'var(--gray-500)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <button
              onClick={() => { connect(); setMenuOpen(false); }}
              disabled={isLoading}
              style={{ padding: '14px', borderRadius: 10, border: 'none', background: 'var(--black)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      )}
    </>
  );
}

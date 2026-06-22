import React, { useState, useEffect, useCallback } from 'react';
import { StatCard, Card, CardHeader, Alert, Spinner } from '../components/UI';
import { formatXLM, formatTime } from '../utils/constants';
import { getDashboardStats, CONTRACT_ID } from '../utils/soroban';
import { getContractTransactions, getTxUrl } from '../utils/horizon';

function timeAgo(ts) {
  const diff = Math.floor(Date.now() / 1000 - ts);
  if (diff < 60)    return `${diff}d lalu`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

const TX_TYPE = {
  disbursed:  { label: 'Dicairkan',   color: 'var(--green)' },
  registered: { label: 'Daftar',      color: 'var(--purple)' },
  rejected:   { label: 'Ditolak',     color: 'var(--red)' },
  grant:      { label: 'Grant',       color: 'var(--yellow)' },
  verifier:   { label: 'Verifikator', color: 'var(--orange)' },
};

function TxRow({ tx }) {
  const type = TX_TYPE[tx.type] || { label: 'Event', color: 'var(--text-3)' };
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '72px 100px 1fr auto',
        gap: 12, padding: '13px 24px',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center', transition: 'background 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span className="mono" style={{ color: 'var(--text-3)', fontSize: 11 }}>
        {timeAgo(tx.ts)}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 600, color: type.color,
        background: `${type.color}15`, padding: '2px 9px',
        borderRadius: 20, textAlign: 'center', whiteSpace: 'nowrap',
      }}>
        {type.label}
      </span>
      <div>
        <div style={{ color: 'var(--text-1)', fontWeight: 500, fontSize: 13 }}>{tx.msg}</div>
        <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 1 }}>{tx.detail || 'Soroban Contract Event'}</div>
      </div>
      {tx.tx_hash ? (
        <a
          href={getTxUrl(tx.tx_hash)}
          target="_blank"
          rel="noreferrer"
          className="mono"
          style={{ color: 'var(--blue)', fontSize: 11, textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.textDecoration = 'underline'}
          onMouseLeave={e => e.target.style.textDecoration = 'none'}
          title="Lihat di Stellar Expert"
        >
          {tx.hash} ↗
        </a>
      ) : (
        <span className="mono" style={{ color: 'var(--text-3)', fontSize: 11 }}>{tx.hash}</span>
      )}
    </div>
  );
}

export default function Overview({ connected, publicKey, showToast }) {
  const [stats, setStats]         = useState(null);
  const [txLog, setTxLog]         = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTxLog();
  }, []);

  async function fetchStats() {
    setLoadingStats(true); setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e.message);
      showToast?.('Gagal memuat statistik: ' + e.message, 'error');
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchTxLog() {
    setLoadingTx(true);
    try {
      const txs = await getContractTransactions(30);
      setTxLog(txs);
    } catch (e) {
      console.error('Horizon error:', e);
    } finally {
      setLoadingTx(false);
    }
  }

  const refresh = useCallback(() => {
    fetchStats();
    fetchTxLog();
  }, []);

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 48px 72px', borderBottom: '1px solid var(--border)' }}>

        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />

        {/* Purple glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480, height: 320,
          background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#c084fc 100%)',
          borderRadius: '50%', filter: 'blur(50px)', opacity: 0.15, zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 650 }}>
          {connected && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.2)',
              color: '#059669', fontSize: 12, fontWeight: 600, marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Terhubung ke Soroban Testnet
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 16,
          }}>
            Beasiswa Transparan
            <br />
            <span style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Tanpa Perantara
            </span>
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-3)', maxWidth: 500, marginBottom: 28 }}>
            Dana disalurkan langsung dari smart contract ke wallet mahasiswa.
            Setiap transaksi tercatat on-chain dan dapat diaudit secara publik.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['On-Chain Immutable', 'Direct-to-Wallet', 'Public Audit', 'Soroban Smart Contract'].map(t => (
              <span key={t} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                color: 'var(--text-2)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div style={{ padding: '40px 48px' }}>

        {!connected && (
          <div style={{ marginBottom: 24 }}>
            <Alert type="warning">Connect wallet Freighter untuk mengakses seluruh fitur ScholarChain.</Alert>
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 20 }}>
            <Alert type="error">
              {error} — <span onClick={fetchStats} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Coba lagi</span>
            </Alert>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          {loadingStats ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <Spinner />
              </div>
            ))
          ) : stats ? (
            <>
              <StatCard label="Total Dicairkan"     value={`${formatXLM(stats.total_disbursed)} XLM`} sub="dari semua program"  accent="#7C3AED" />
              <StatCard label="Total Penerima"      value={stats.total_recipients}                    sub="terdaftar on-chain"  accent="#7C3AED" />
              <StatCard label="Dana Tersalurkan"    value={stats.total_verified}                      sub="wallet penerima"     accent="#10B981" />
              <StatCard label="Menunggu Verifikasi" value={stats.total_pending}                       sub="perlu ditinjau"      accent="#F59E0B" />
              <StatCard label="Program Aktif"       value={stats.total_grants}                        sub="grant on-chain"      accent="#3B82F6" />
            </>
          ) : null}
        </div>

        {/* TX Log from Horizon */}
        <Card>
          <CardHeader
            title="Riwayat Transaksi On-Chain"
            subtitle={loadingTx ? 'Mengambil dari Horizon...' : `${txLog.length} transaksi terakhir · langsung dari blockchain`}
            action={
              <button
                onClick={refresh}
                disabled={loadingStats || loadingTx}
                style={{ padding: '5px 12px', borderRadius: 'var(--radius)', background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <span style={{ display: 'inline-block', animation: (loadingStats || loadingTx) ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
                Refresh
              </button>
            }
          />

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '72px 100px 1fr auto',
            gap: 12, padding: '8px 24px',
            fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span>Waktu</span><span>Tipe</span><span>Keterangan</span><span>Hash</span>
          </div>

          {loadingTx ? (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
              <Spinner size={20} />
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Mengambil data dari Horizon testnet...</span>
            </div>
          ) : txLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Belum ada transaksi on-chain</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Transaksi akan muncul setelah ada aksi di contract</div>
            </div>
          ) : (
            txLog.map(tx => <TxRow key={tx.id} tx={tx} />)
          )}
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, CardHeader, Badge, ProgressBar, Alert } from '../components/UI';
import { formatXLM, formatIPK, formatDate, shortenAddr } from '../utils/constants';
import { useGrants } from '../hooks/useGrants';

const RESPONSIVE = `
  @media (max-width: 768px) {
    .grants-table-header { display: none !important; }
    .grants-table-row    { display: none !important; }
    .grants-card-row     { display: flex !important; }
    .grants-page-pad     { padding: 20px 16px !important; }
  }
  @media (min-width: 769px) {
    .grants-card-row { display: none !important; }
  }
`;

export default function Grants({ publicKey }) {
  const { grants = [], loading, error } = useGrants(publicKey);

  return (
    <div className="grants-page-pad" style={{ padding: '40px 48px' }}>
      <style>{RESPONSIVE}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--black)', marginBottom: 6 }}>
          Program Beasiswa
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Dana dikunci dalam smart contract sejak sponsor melakukan deposit.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Semua Program"
          subtitle={loading ? 'Memuat...' : `${grants.length} program terdaftar`}
        />

        {error && (
          <div style={{ padding: '16px 24px' }}>
            <Alert type="error">Gagal memuat data: {error}</Alert>
          </div>
        )}

        {/* Header tabel — desktop only */}
        <div className="grants-table-header" style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 120px 200px 80px 110px 90px',
          gap: 16, padding: '8px 24px',
          fontSize: 11, fontWeight: 600,
          color: 'var(--gray-400)',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          borderBottom: '1px solid var(--gray-100)',
        }}>
          <span>ID</span><span>Nama</span><span>Dana</span>
          <span>Kuota</span><span>Min IPK</span><span>Deadline</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            Memuat data dari blockchain...
          </div>
        ) : grants.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
            Belum ada program beasiswa. Buat di halaman Admin.
          </div>
        ) : grants.map((g) => {
          const daysLeft = Math.ceil((Number(g.deadline) - Date.now() / 1000) / 86400);
          const expired  = daysLeft < 0;

          return (
            <React.Fragment key={g.id}>

              {/* ── Desktop row ── */}
              <div
                className="grants-table-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 120px 200px 80px 110px 90px',
                  gap: 16, padding: '16px 24px',
                  borderBottom: '1px solid var(--gray-100)',
                  alignItems: 'center', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="mono" style={{ color: 'var(--gray-400)' }}>#{String(g.id)}</span>

                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--black)' }}>{g.name}</div>
                  <div className="mono" style={{ color: 'var(--gray-400)', fontSize: 11, marginTop: 2 }}>{shortenAddr(g.sponsor)}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--purple)' }}>
                    {formatXLM(Number(g.amount_per_recipient))} XLM
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>per penerima</div>
                </div>

                <ProgressBar value={Number(g.current_recipients)} max={Number(g.max_recipients)} />

                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                  {formatIPK(Number(g.min_ipk))}
                </span>

                <div>
                  <div style={{ fontSize: 12, color: expired ? 'var(--red)' : 'var(--gray-700)' }}>
                    {formatDate(Number(g.deadline))}
                  </div>
                  {!expired && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{daysLeft} hari lagi</div>}
                </div>

                <Badge status={g.is_active && !expired ? 'active' : 'closed'} />
              </div>

              {/* ── Mobile card ── */}
              <div
                className="grants-card-row"
                style={{
                  flexDirection: 'column', gap: 12,
                  padding: '16px',
                  borderBottom: '1px solid var(--gray-100)',
                }}
              >
                {/* Top: nama + badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--black)', marginBottom: 2 }}>{g.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--gray-400)' }}>{shortenAddr(g.sponsor)}</div>
                  </div>
                  <Badge status={g.is_active && !expired ? 'active' : 'closed'} />
                </div>

                {/* Dana + IPK */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Dana</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--purple)' }}>{formatXLM(Number(g.amount_per_recipient))} XLM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Min IPK</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--black)' }}>{formatIPK(Number(g.min_ipk))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Deadline</div>
                    <div style={{ fontSize: 12, color: expired ? 'var(--red)' : 'var(--gray-700)', fontWeight: 500 }}>
                      {expired ? 'Berakhir' : `${daysLeft}h lagi`}
                    </div>
                  </div>
                </div>

                {/* Progress kuota */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kuota</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{Number(g.current_recipients)}/{Number(g.max_recipients)} penerima</span>
                  </div>
                  <ProgressBar value={Number(g.current_recipients)} max={Number(g.max_recipients)} />
                </div>
              </div>

            </React.Fragment>
          );
        })}
      </Card>
    </div>
  );
}

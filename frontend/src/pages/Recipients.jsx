import React, { useState } from 'react';
import { Card, CardHeader, Badge, Input, Button, Alert, Spinner, EmptyState } from '../components/UI';
import { formatIPK, formatDate, shortenAddr } from '../utils/constants';
import { getRecipient } from '../utils/soroban';

const RESPONSIVE = `
  @media (max-width: 768px) {
    .recipients-page-pad  { padding: 20px 16px !important; }
    .recipients-info-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 10px !important;
    }
    .recipients-search    { flex-direction: column !important; align-items: stretch !important; }
    .recipients-search-input { max-width: 100% !important; width: 100% !important; }
    .recipients-search-btn   { width: 100% !important; justify-content: center !important; }
    .recipients-card-content { padding: 16px !important; }
  }
`;

export default function Recipients() {
  const [search, setSearch]       = useState('');
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [searched, setSearched]   = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!search.trim()) return;
    setLoading(true); setError(null); setRecipient(null); setSearched(true);
    try {
      const data = await getRecipient(search.trim());
      setRecipient(data);
      if (!data) setError(`Penerima dengan NIM "${search.trim()}" tidak ditemukan.`);
    } catch (e) {
      setError('Gagal memuat data: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recipients-page-pad" style={{ padding: '40px 48px' }}>
      <style>{RESPONSIVE}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--black)', marginBottom: 6 }}>
          Penerima Beasiswa
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Data tersimpan on-chain. Cari berdasarkan NIM untuk melihat status penerima.
        </p>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px' }}>
          <form onSubmit={handleSearch}>
            <div className="recipients-search" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="recipients-search-input" style={{ flex: 1, maxWidth: 340 }}>
                <Input
                  label="Cari Penerima"
                  placeholder="Masukkan NIM / Student ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="recipients-search-btn"
                variant="primary"
                type="submit"
                disabled={loading || !search.trim()}
              >
                {loading ? <Spinner size={14} /> : 'Cari'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Error */}
      {error && !loading && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="warning">{error}</Alert>
        </div>
      )}

      {/* Result */}
      {recipient && (
        <Card>
          <CardHeader title="Data Penerima" subtitle={`NIM: ${recipient.student_id}`} />
          <div className='recipients-card-content' style={{ padding: '20px 24px' }}>

            {/* Info grid */}
            <div
              className="recipients-info-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20,
                marginBottom: 20,
              }}
            >
              {[
                { label: 'Nama Lengkap',   value: recipient.name },
                { label: 'NIM',            value: recipient.student_id },
                { label: 'IPK',            value: formatIPK(recipient.ipk) },
                { label: 'Program Grant',  value: `#${recipient.grant_id}` },
                { label: 'Wallet',         value: shortenAddr(recipient.wallet) },
                { label: 'Terdaftar',      value: formatDate(recipient.registered_at) },
                { label: 'Diverifikasi',   value: recipient.verified_at ? formatDate(recipient.verified_at) : '—' },
                { label: 'Dana Dicairkan', value: recipient.disbursed_at ? formatDate(recipient.disbursed_at) : '—' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--black)', fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Status:</span>
              <Badge status={recipient.status} size="md" />
            </div>

            {/* KRS Hash */}
            {recipient.krs_hash && (
              <div style={{ padding: '12px 14px', background: 'var(--gray-50)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Hash Dokumen KRS
                </div>
                <div className="mono" style={{ color: 'var(--gray-700)', wordBreak: 'break-all', fontSize: 12 }}>
                  {recipient.krs_hash}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {!searched && !loading && (
        <EmptyState
          title="Cari penerima beasiswa"
          description="Masukkan NIM mahasiswa untuk melihat status on-chain."
        />
      )}
    </div>
  );
}

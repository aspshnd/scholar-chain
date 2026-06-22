import React, { useState } from 'react';
import { Card, CardHeader, Badge, Input, Button, Alert, Spinner, EmptyState } from '../components/UI';
import { formatIPK, formatDate, shortenAddr } from '../utils/constants';
import { getRecipient } from '../utils/soroban';

export default function Recipients() {
  const [search, setSearch]     = useState('');
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searched, setSearched] = useState(false);

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
    <div>
      <div style={{ padding:'40px 48px' }}>
        <div style={{ marginBottom:1 }}>
          <h1 style={{
            fontSize:28,
            fontWeight:800,
            letterSpacing:'-0.8px',
            color:'var(--black)',
            marginBottom:6
          }}>
            Penerima Beasiswa
          </h1>

          <p style={{ fontSize:14, color:'var(--gray-500)' }}>
            Data tersimpan on-chain. Cari berdasarkan NIM untuk melihat status penerima.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card style={{ display:'flex', gap:10, padding:'1px 24px', borderBottom:'1px solid var(--gray-100)', alignItems:'center' }}>
        <div style={{ padding: '16px 20px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, maxWidth: 340 }}>
              <Input
                label="Cari Penerima"
                placeholder="Masukkan NIM / Student ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit" disabled={loading || !search.trim()}>
              {loading ? <Spinner size={14} /> : 'Cari'}
            </Button>
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
          <div style={{ padding: '16px 44px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))', gap: 20, marginBottom: 20 }}>
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
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Status:</span>
              <Badge status={recipient.status} size="md" />
            </div>

            {recipient.krs_hash && (
              <div style={{ marginTop: 16, padding: '10px 14px', background:'var(--gray-50)', border:'1px solid var(--gray-100)', borderRadius: 'var(--radius)', fontSize: 12 }}>
                <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>Hash Dokumen KRS</div>
                <div className="mono" style={{ color: 'var(--text-2)', wordBreak: 'break-all' }}>{recipient.krs_hash}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {!searched && !loading && (
        <EmptyState title="Cari penerima beasiswa" description="Masukkan NIM mahasiswa untuk melihat status on-chain." />
      )}
    </div>
  );
}

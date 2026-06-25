import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Input, Select, Button, Alert, Badge, Spinner } from '../components/UI';
import { formatIPK, formatDate } from '../utils/constants';
import { useSorobanEvents } from '../hooks/useSorobanEvents';
import { CONTRACT_ID, getRecipient, verifyAndDisburse, signAndSubmit } from '../utils/soroban';

export default function Verify({ publicKey, isConnected, showToast }) {
  const [nim, setNim]           = useState('');
  const [decision, setDecision] = useState('approve');
  const [reason, setReason]     = useState('');
  const [status, setStatus]     = useState(null);
  const [msg, setMsg]           = useState('');
  const [errors, setErrors]     = useState({});
  const [found, setFound]       = useState(null);
  const [searching, setSearching] = useState(false);

  const [pendingList, setPendingList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Ambil events dari blockchain
  const { events, loading: eventsLoading } = useSorobanEvents(CONTRACT_ID);

  // Setiap kali events berubah, extract NIM dari event register
  // lalu fetch status masing-masing dari contract
  useEffect(() => {
    if (!events.length || !publicKey) return;

    const nimList = [...new Set(
      events
        .filter(e => e.type === 'register' && e.studentId)
        .map(e => e.studentId)
    )];

    if (!nimList.length) {
      setPendingList([]);
      return;
    }

    setLoadingList(true);
    Promise.all(nimList.map(id => getRecipient(id, publicKey).catch(() => null)))
      .then(results => setPendingList(results.filter(r => r && r.status === 'Pending')))
      .catch(() => {})
      .finally(() => setLoadingList(false));

  }, [events, publicKey]);

  // Lookup NIM saat user mengetik
  async function lookupNim(val) {
    setNim(val);
    setFound(null);
    if (val.trim().length < 3) return;
    setSearching(true);
    try {
      const data = await getRecipient(val.trim(), publicKey);
      setFound(data || null);
    } catch (_) {}
    finally { setSearching(false); }
  }

  // Klik baris di panel kanan
  function selectFromList(recipient) {
    setNim(recipient.student_id);
    setFound(recipient);
    setErrors({});
    setStatus(null);
  }

  const submit = async () => {
    if (!isConnected) { showToast?.('Connect wallet Freighter terlebih dahulu', 'error'); return; }

    const e = {};
    if (!publicKey)                            e.verifier = 'Wallet belum terconnect';
    if (!nim.trim())                           e.nim = 'Masukkan NIM mahasiswa';
    if (nim.trim() && !found)                  e.nim = `Mahasiswa dengan NIM "${nim}" tidak ditemukan on-chain`;
    if (found && found.status !== 'Pending')   e.nim = `Status mahasiswa ini sudah: ${found.status}`;
    if (decision === 'reject' && !reason.trim()) e.reason = 'Alasan penolakan wajib diisi';
    if (Object.keys(e).length) { setErrors(e); return; }

    setStatus('loading'); setMsg('');
    try {
      const txData = await verifyAndDisburse({
        studentId:       nim.trim(),
        approved:        decision === 'approve',
        rejectionReason: decision === 'reject' ? reason.trim() : '',
      }, publicKey);

      await signAndSubmit(txData);

      setStatus('success');
      setMsg(decision === 'approve'
        ? `Dana berhasil dicairkan ke wallet ${found.name}. Transaksi tercatat on-chain.`
        : `Pendaftaran ${found.name} ditolak. Alasan disimpan on-chain.`
      );
      showToast?.(decision === 'approve' ? 'Dana berhasil dicairkan ✓' : 'Pendaftaran ditolak ✓');
      setNim(''); setReason(''); setFound(null);
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Terjadi kesalahan');
      showToast?.(err.message || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--black)', marginBottom: 4 }}>
          Verifikasi
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Hanya verifikator terdaftar yang dapat menyetujui pencairan. Dana langsung dikirim ke wallet penerima.
        </p>
      </div>

      {!isConnected && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="warning">Connect wallet Freighter untuk melakukan verifikasi.</Alert>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* ── Form verifikasi ── */}
        <Card>
          <CardHeader
            title="Proses Verifikasi"
            subtitle={isConnected ? `Verifikator: ${publicKey?.slice(0, 8)}...` : 'Wallet belum terconnect'}
          />
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Input
              label="NIM Mahasiswa"
              placeholder="cth: 2021001234"
              value={nim}
              onChange={e => { lookupNim(e.target.value); setErrors(er => ({ ...er, nim: '' })); }}
              error={errors.nim}
            />

            {searching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-400)' }}>
                <Spinner size={12} /> Mencari di blockchain...
              </div>
            )}

            {/* Preview data penerima */}
            {found && (
              <div style={{
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
              }}>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Data Penerima (On-Chain)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Nama',      value: found.name },
                    { label: 'IPK',       value: formatIPK(found.ipk) },
                    { label: 'Program',   value: `Grant #${found.grant_id}` },
                    { label: 'Terdaftar', value: formatDate(found.registered_at) },
                  ].map(i => (
                    <div key={i.label}>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{i.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)', marginTop: 1 }}>{i.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Status saat ini:</span>
                  <Badge status={found.status} />
                </div>
              </div>
            )}

            <Select label="Keputusan" value={decision} onChange={e => setDecision(e.target.value)}>
              <option value="approve">Setujui — cairkan dana sekarang</option>
              <option value="reject">Tolak</option>
            </Select>

            {decision === 'reject' && (
              <Input
                label="Alasan Penolakan"
                placeholder="Jelaskan alasan penolakan secara spesifik"
                value={reason}
                onChange={e => { setReason(e.target.value); setErrors(er => ({ ...er, reason: '' })); }}
                error={errors.reason}
              />
            )}
          </div>

          {status === 'success' && <div style={{ padding: '0 20px 16px' }}><Alert type="success">{msg}</Alert></div>}
          {status === 'error'   && <div style={{ padding: '0 20px 16px' }}><Alert type="error">{msg}</Alert></div>}

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button
              variant={decision === 'reject' ? 'danger' : 'primary'}
              onClick={submit}
              disabled={status === 'loading' || !isConnected}
            >
              {status === 'loading'
                ? <><Spinner size={13} /> Memproses...</>
                : decision === 'approve' ? 'Setujui & Cairkan Dana' : 'Tolak Pendaftaran'
              }
            </Button>
          </div>
        </Card>

        {/* ── Panel kanan — daftar pending ── */}
        <Card>
          <CardHeader
            title="Menunggu Verifikasi"
            subtitle={
              eventsLoading || loadingList
                ? 'Memuat dari blockchain...'
                : `${pendingList.length} penerima`
            }
          />

          <div style={{ padding: '8px' }}>
            {eventsLoading || loadingList ? (
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                <Spinner size={18} />
              </div>

            ) : pendingList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                  Tidak ada yang menunggu
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.6 }}>
                  Setelah mahasiswa mendaftar, nama mereka akan muncul di sini secara otomatis.
                  Atau cari manual lewat NIM di sebelah kiri.
                </div>
              </div>

            ) : pendingList.map(r => (
              <div
                key={r.student_id}
                onClick={() => selectFromList(r)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid var(--gray-100)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--black)', marginBottom: 2 }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', gap: 8 }}>
                  <span className="mono">NIM {r.student_id}</span>
                  <span>·</span>
                  <span>IPK {formatIPK(r.ipk)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Info panel */}
          <div style={{ borderTop: '1px solid var(--gray-100)', padding: '12px 14px' }}>
            {[
              { title: 'Auth Required', desc: 'Hanya wallet verifikator yang bisa memproses.' },
              { title: 'Otomatis',      desc: 'Dana transfer langsung dalam 1 transaksi.' },
              { title: 'Immutable',     desc: 'Keputusan tersimpan permanen on-chain.' },
            ].map((item, i, arr) => (
              <div key={item.title} style={{
                padding: '8px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--gray-100)' : 'none',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)', marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

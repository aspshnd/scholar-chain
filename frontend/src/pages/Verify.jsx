import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Input, Select, Button, Alert, Badge, Spinner } from '../components/UI';
import { formatIPK, formatDate, shortenAddr } from '../utils/constants';
import { getRecipient, verifyAndDisburse, signAndSubmit } from '../utils/soroban';

// ─── LocalStorage helpers untuk track student IDs yang pernah didaftarkan ───
// Karena kontrak tidak punya fungsi list-all, kita simpan ID lokal.

const LS_KEY = 'scholarchain_student_ids'

function getSavedStudentIds() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch { return [] }
}

export function saveStudentId(studentId) {
  try {
    const ids = getSavedStudentIds()
    if (!ids.includes(studentId)) {
      ids.push(studentId)
      localStorage.setItem(LS_KEY, JSON.stringify(ids))
    }
  } catch {}
}

export default function Verify({ publicKey, isConnected, showToast }) {
  const [nim, setNim]             = useState('');
  const [decision, setDecision]   = useState('approve');
  const [reason, setReason]       = useState('');
  const [status, setStatus]       = useState(null);
  const [msg, setMsg]             = useState('');
  const [errors, setErrors]       = useState({});
  const [found, setFound]         = useState(null);
  const [searching, setSearching] = useState(false);

  // Panel kanan — daftar pending dari localStorage
  const [pendingList, setPendingList]   = useState([]);
  const [loadingList, setLoadingList]   = useState(false);

  // Load semua student yang tersimpan dan cek status pending-nya
  useEffect(() => { fetchPendingList(); }, []);

  async function fetchPendingList() {
    const ids = getSavedStudentIds();
    if (ids.length === 0) return;
    setLoadingList(true);
    try {
      const results = await Promise.all(ids.map(id => getRecipient(id).catch(() => null)));
      setPendingList(results.filter(r => r && r.status === 'Pending'));
    } catch {}
    finally { setLoadingList(false); }
  }

  async function lookupNim(val) {
    setNim(val);
    setFound(null);
    if (val.trim().length < 3) return;
    setSearching(true);
    try {
      const data = await getRecipient(val.trim());
      setFound(data || null);
    } catch (_) {}
    finally { setSearching(false); }
  }

  // Klik baris di panel kanan → auto-fill NIM dan lookup
  function selectFromList(recipient) {
    setNim(recipient.student_id);
    setFound(recipient);
    setErrors({});
    setStatus(null);
  }

  const submit = async () => {
    if (!isConnected) { showToast?.('Connect wallet Freighter terlebih dahulu', 'error'); return; }

    const e = {};
    if (!publicKey)                                  e.verifier = 'Wallet belum terconnect';
    if (!nim.trim())                                 e.nim = 'Masukkan NIM mahasiswa';
    if (!found)                                      e.nim = `Mahasiswa dengan NIM "${nim}" tidak ditemukan on-chain`;
    if (found && found.status !== 'Pending')         e.nim = `Status mahasiswa ini sudah: ${found.status}`;
    if (decision === 'reject' && !reason.trim())     e.reason = 'Alasan penolakan wajib diisi';
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
      fetchPendingList(); // refresh panel kanan
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Terjadi kesalahan');
      showToast?.(err.message || 'Terjadi kesalahan', 'error');
    }
  };

  return (
    <div>
      <div style={{ padding:'40px 48px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-1)', marginBottom: 4 }}>
            Verifikasi
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            Hanya verifikator terdaftar yang dapat menyetujui pencairan. Dana langsung dikirim ke wallet penerima.
          </p>
        </div>
      </div>

      {!isConnected && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="warning">Connect wallet Freighter untuk melakukan verifikasi.</Alert>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

        {/* Form verifikasi */}
        <Card>
          <CardHeader
            title="Proses Verifikasi"
            subtitle={isConnected ? `Verifikator: ${publicKey?.slice(0,8)}...` : 'Wallet belum terconnect'}
          />
          <div style={{ padding: '16px 44px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Input
                label="NIM Mahasiswa"
                placeholder="cth: 2021001234"
                value={nim}
                onChange={e => { lookupNim(e.target.value); setErrors(er => ({ ...er, nim: '' })); }}
                error={errors.nim}
              />
              {searching && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
                  <Spinner size={12} /> Mencari di blockchain...
                </div>
              )}
            </div>

            {/* Preview data penerima */}
            {found && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
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
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{i.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', marginTop: 1 }}>{i.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Status saat ini:</span>
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

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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

        {/* Panel kanan — daftar pending */}
        <Card>
          <CardHeader
            title="Menunggu Verifikasi"
            subtitle={loadingList ? 'Memuat...' : `${pendingList.length} penerima`}
            action={
              <button
                onClick={fetchPendingList}
                disabled={loadingList}
                style={{ padding: '4px 10px', borderRadius: 'var(--radius)', background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer' }}
              >
                ↻
              </button>
            }
          />
          <div style={{ padding: '8px' }}>
            {loadingList ? (
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <Spinner size={18} />
              </div>
            ) : pendingList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>Tidak ada yang menunggu</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Setelah mahasiswa mendaftar, nama mereka akan muncul di sini.
                  <br/>Atau cari manual lewat NIM di sebelah kiri.
                </div>
              </div>
            ) : (
              pendingList.map(r => (
                <div
                  key={r.student_id}
                  onClick={() => selectFromList(r)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-1)', marginBottom: 2 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 8 }}>
                    <span className="mono">NIM {r.student_id}</span>
                    <span>·</span>
                    <span>IPK {formatIPK(r.ipk)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info panel */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 14px 10px' }}>
            {[
              { icon: '🔐', title: 'Auth Required', desc: 'Hanya wallet verifikator yang bisa memproses.' },
              { icon: '⚡', title: 'Otomatis', desc: 'Dana transfer langsung dalam 1 transaksi.' },
              { icon: '📝', title: 'Immutable', desc: 'Keputusan tersimpan permanen on-chain.' },
            ].map(item => (
              <div key={item.title} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

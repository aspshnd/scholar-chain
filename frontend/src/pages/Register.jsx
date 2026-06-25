import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Input, Select, Button, Alert, Spinner } from '../components/UI';
import { formatXLM, formatIPK } from '../utils/constants';
import { getAllGrants, registerRecipient, signAndSubmit } from '../utils/soroban';



export default function Register({ publicKey, isConnected, showToast }) {
  const [form, setForm]       = useState({ wallet: '', nim: '', name: '', grant_id: '', ipk: '', krs_hash: '' });
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState(null);
  const [msg, setMsg]         = useState('');
  const [grants, setGrants]   = useState([]);
  const [loadingGrants, setLoadingGrants] = useState(true);

  useEffect(() => {
    getAllGrants()
      .then(data => setGrants(data.filter(g => g.is_active)))
      .catch(e => showToast?.('Gagal memuat grants: ' + e.message, 'error'))
      .finally(() => setLoadingGrants(false));
  }, []);

  const selectedGrant = grants.find(g => g.id === parseInt(form.grant_id));

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.wallet.startsWith('G') || form.wallet.length < 56) e.wallet = 'Alamat Stellar tidak valid — harus diawali G dan 56 karakter';
    if (!form.nim.trim()) e.nim = 'NIM wajib diisi';
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.grant_id) e.grant_id = 'Pilih program beasiswa';
    const ipk = parseFloat(form.ipk);
    if (isNaN(ipk) || ipk < 0 || ipk > 4.0) e.ipk = 'IPK harus antara 0.00 - 4.00';
    else if (selectedGrant && Math.round(ipk * 100) < selectedGrant.min_ipk) e.ipk = `IPK minimum untuk program ini adalah ${formatIPK(selectedGrant.min_ipk)}`;
    if (!form.krs_hash.startsWith('sha256:')) e.krs_hash = 'Hash harus diawali sha256:';
    return e;
  };

  const submit = async () => {
    if (!isConnected) { showToast?.('Connect wallet Freighter terlebih dahulu', 'error'); return; }
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setStatus('loading'); setMsg('');
    try {
      const ipkInt = Math.round(parseFloat(form.ipk) * 100); // store as u32 (e.g. 3.75 → 375)
      const xdrTx  = await registerRecipient({
        wallet:    form.wallet,
        studentId: form.nim.trim(),
        name:      form.name.trim(),
        grantId:   parseInt(form.grant_id),
        ipk:       ipkInt,
        krsHash:   form.krs_hash.trim(),
      }, publicKey);

      await signAndSubmit(xdrTx);
      setStatus('success');
      setMsg(`Pendaftaran ${form.name} (${form.nim}) berhasil dicatat on-chain. Status: Menunggu verifikasi.`);
      showToast?.('Pendaftaran berhasil tersimpan di blockchain ✓');
      setForm({ wallet: publicKey || '', nim: '', name: '', grant_id: '', ipk: '', krs_hash: '' });
    } catch (err) {
      setStatus('error');
      const errMsg = err.message || 'Terjadi kesalahan';
      setMsg(errMsg.includes('AlreadyRegistered') ? 'NIM ini sudah terdaftar di blockchain.' :
             errMsg.includes('GrantExpired')       ? 'Program beasiswa sudah berakhir.'       :
             errMsg.includes('RequirementsNotMet') ? 'IPK tidak memenuhi syarat minimum.'     :
             errMsg.includes('User declined')      ? 'Transaksi dibatalkan dari Freighter.'   : errMsg);
      showToast?.(errMsg, 'error');
    }
  };

  return (
      <div style={{ padding:'40px 48px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--black)', marginBottom: 6 }}>
            Daftar Beasiswa
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
            Data yang dikirim akan tersimpan permanen di blockchain dan tidak dapat diubah.
          </p>
        </div>
      {/* </div> */}

      {!isConnected && (
        <div style={{ marginBottom: 20 }}>
          <Alert type="warning">Connect wallet Freighter untuk mendaftar beasiswa.</Alert>
        </div>
      )}

        <Card>
          <CardHeader title="Formulir Pendaftaran" subtitle="Semua field wajib diisi" />

          <div style={{ padding: '16px 20px', display: 'grid', gap: 14 }}>
            <Input
              label="Alamat Wallet Stellar"
              placeholder="G... (56 karakter)"
              value={form.wallet}
              onChange={e => set('wallet', e.target.value)}
              error={errors.wallet}
              hint="Dana akan dikirim langsung ke alamat ini"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="NIM / Student ID" placeholder="cth: 2021001234" value={form.nim} onChange={e => set('nim', e.target.value)} error={errors.nim} />
              <Input label="Nama Lengkap" placeholder="Sesuai KTP" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />
            </div>

            <Select label="Program Beasiswa" value={form.grant_id} onChange={e => set('grant_id', e.target.value)} error={errors.grant_id}>
              <option value="">{loadingGrants ? 'Memuat program...' : 'Pilih program...'}</option>
              {grants.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} — {formatXLM(g.amount_per_recipient)} XLM (Min IPK {formatIPK(g.min_ipk)})
                </option>
              ))}
            </Select>

            {selectedGrant && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Jumlah Dana',    value: `${formatXLM(selectedGrant.amount_per_recipient)} XLM` },
                  { label: 'Kuota Tersisa',  value: `${selectedGrant.max_recipients - selectedGrant.current_recipients} slot` },
                  { label: 'IPK Minimum',    value: formatIPK(selectedGrant.min_ipk) },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            <Input label="IPK (skala 4.00)" type="number" step="0.01" min="0" max="4.00" placeholder="cth: 3.75" value={form.ipk} onChange={e => set('ipk', e.target.value)} error={errors.ipk} />

            <Input label="Hash Dokumen KRS" placeholder="sha256:..." value={form.krs_hash} onChange={e => set('krs_hash', e.target.value)} error={errors.krs_hash} hint="SHA-256 dari file KRS semester terakhir" />
          </div>    

          {status === 'success' && <div style={{ padding: '0 20px 16px' }}><Alert type="success">{msg}</Alert></div>}
          {status === 'error'   && <div style={{ padding: '0 20px 16px' }}><Alert type="error">{msg}</Alert></div>}

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => { setForm({ wallet: publicKey || '', nim: '', name: '', grant_id: '', ipk: '', krs_hash: '' }); setErrors({}); setStatus(null); }}>
              Bersihkan
            </Button>
            <Button variant="primary" onClick={submit} disabled={status === 'loading' || !isConnected}>
              {status === 'loading' ? <><Spinner size={13} /> Mengirim ke Blockchain...</> : 'Kirim ke Blockchain'}
            </Button>
          </div>
        </Card>
      </div>
  );
}

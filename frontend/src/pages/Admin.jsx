import React, { useState } from 'react';
import { Card, CardHeader, Input, Button, Alert, Spinner } from '../components/UI';
import { NATIVE_TOKEN } from '../utils/constants';
import { createGrant, addVerifier, removeVerifier, signAndSubmit } from '../utils/soroban';

export default function Admin({ publicKey, isConnected, showToast }) {
  const [grant, setGrant] = useState({
    name: '',
    sponsor: '',
    amount: '',
    max: '',
    minIpk: '',
    deadline: '',
    token: NATIVE_TOKEN
  });

  const [grantStatus, setGrantStatus] = useState(null);
  const [grantMsg, setGrantMsg] = useState('');

  const [admin, setAdmin] = useState('');
  const [verifier, setVerifier] = useState('');
  const [verStatus, setVerStatus] = useState(null);
  const [verMsg, setVerMsg] = useState('');

  const setG = (k, v) => setGrant(f => ({ ...f, [k]: v }));

  // ───────── CREATE GRANT ─────────
  const handleCreateGrant = async () => {
    if (!isConnected) return;

    if (!grant.name || !grant.amount || !grant.max || !grant.minIpk || !grant.deadline) {
      setGrantStatus('error');
      setGrantMsg('Semua field wajib diisi.');
      return;
    }

    setGrantStatus('loading');

    try {
      const amountStroops = Math.round(parseFloat(grant.amount) * 10_000_000);
      const deadlineTs = Math.floor(new Date(grant.deadline).getTime() / 1000);
      const minIpkInt = Math.round(parseFloat(grant.minIpk) * 100);

      const xdr = await createGrant({
        name: grant.name,
        amountPerRecipient: amountStroops,
        maxRecipients: parseInt(grant.max),
        minIpk: minIpkInt,
        deadline: deadlineTs,
        tokenAddress: grant.token || NATIVE_TOKEN,
      }, publicKey);

      await signAndSubmit(xdr);

      setGrantStatus('success');
      setGrantMsg(`Grant "${grant.name}" berhasil dibuat.`);
      showToast?.('Grant berhasil dibuat ✓');

      setGrant({
        name: '',
        sponsor: '',
        amount: '',
        max: '',
        minIpk: '',
        deadline: '',
        token: NATIVE_TOKEN
      });

    } catch (err) {
      setGrantStatus('error');
      setGrantMsg(err.message || 'Error');
      showToast?.('Error membuat grant', 'error');
    }
  };

  // ───────── VERIFIER ─────────
  const handleVerifier = async (action) => {
    if (!isConnected) return;

    if (!verifier.startsWith('G')) {
      setVerStatus('error');
      setVerMsg('Wallet tidak valid');
      return;
    }

    setVerStatus('loading');

    try {
      const xdr =
        action === 'add'
          ? await addVerifier({ adminKey: publicKey, verifierKey: verifier })
          : await removeVerifier({ adminKey: publicKey, verifierKey: verifier });

      await signAndSubmit(xdr);

      setVerStatus('success');
      setVerMsg(`Verifikator berhasil ${action === 'add' ? 'ditambah' : 'dihapus'}`);
      setVerifier('');

      showToast?.('Verifikator update ✓');
    } catch (err) {
      setVerStatus('error');
      setVerMsg(err.message || 'Error');
    }
  };

  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Semua aksi tercatat on-chain di Soroban
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ───────── CREATE GRANT ───────── */}
        <Card>
          <CardHeader title="Buat Program Beasiswa" subtitle="Deploy ke smart contract Soroban" />
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

            <Input label="Nama Program" value={grant.name} onChange={e => setG('name', e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Dana per Penerima" type="number" value={grant.amount} onChange={e => setG('amount', e.target.value)} />
              <Input label="Max Penerima" type="number" value={grant.max} onChange={e => setG('max', e.target.value)} />
            </div>

            <Input label="Min IPK" type="number" step="0.01" value={grant.minIpk} onChange={e => setG('minIpk', e.target.value)} />
            <Input label="Deadline" type="date" value={grant.deadline} onChange={e => setG('deadline', e.target.value)} />

            {grant.amount && grant.max && (
              <div style={{
                padding: 12,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13
              }}>
                Total: <b>{(grant.amount * grant.max).toFixed(2)} XLM</b>
              </div>
            )}

            {grantStatus === 'error' && <Alert type="error">{grantMsg}</Alert>}
            {grantStatus === 'success' && <Alert type="success">{grantMsg}</Alert>}

            <Button onClick={handleCreateGrant} disabled={grantStatus === 'loading' || !isConnected}>
              {grantStatus === 'loading' ? <Spinner size={12} /> : 'Deploy Grant'}
            </Button>
          </div>
        </Card>

        {/* ───────── VERIFIER ───────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <Card>
            <CardHeader title="Kelola Verifikator" subtitle="Admin control panel" />
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>

              <Input label="Wallet Admin" value={admin} onChange={e => setAdmin(e.target.value)} />
              <Input label="Wallet Verifikator" value={verifier} onChange={e => setVerifier(e.target.value)} />

              {verStatus === 'error' && <Alert type="error">{verMsg}</Alert>}
              {verStatus === 'success' && <Alert type="success">{verMsg}</Alert>}

              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="success" style={{ flex: 1 }} onClick={() => handleVerifier('add')} disabled={verStatus === 'loading'}>
                  Tambah
                </Button>
                <Button variant="danger" style={{ flex: 1 }} onClick={() => handleVerifier('remove')} disabled={verStatus === 'loading'}>
                  Hapus
                </Button>
              </div>
            </div>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader title="Tautan" />
            <div style={{ padding: 12 }}>
              {[
                ['Stellar Expert', 'https://testnet.stellar.expert'],
                ['Laboratory', 'https://laboratory.stellar.org'],
                ['Faucet', 'https://friendbot.stellar.org'],
                ['Soroban Docs', 'https://developers.stellar.org/docs/smart-contracts'],
              ].map(([label, url]) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    padding: '10px 0',
                    fontSize: 13,
                    color: 'var(--gray-700)',
                    borderBottom: '1px solid var(--gray-100)'
                  }}
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
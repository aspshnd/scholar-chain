// Contract configuration
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';
export const NETWORK = 'testnet';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// Token (native XLM on testnet)
export const NATIVE_TOKEN = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// Stroops per XLM
export const STROOPS = 10_000_000;

export const formatXLM = (stroops) =>
  (stroops / STROOPS).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatIPK = (raw) => (raw / 100).toFixed(2);

export const shortenAddr = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—';

export const formatDate = (ts) =>
  ts ? new Date(ts * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatTime = (ts) =>
  ts ? new Date(ts * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

export const MOCK_STATS = {
  total_grants: 3,
  total_recipients: 127,
  total_disbursed: 4_750_000_000,
  total_pending: 14,
  total_verified: 113,
  last_updated: Math.floor(Date.now() / 1000),
};

export const MOCK_GRANTS = [
  {
    id: 1,
    name: 'Beasiswa Prestasi Akademik 2025',
    sponsor: 'GABC...1234',
    total_fund: 2_500_000_000,
    disbursed_amount: 2_250_000_000,
    amount_per_recipient: 50_000_000,
    max_recipients: 50,
    current_recipients: 45,
    min_ipk: 300,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 45,
    is_active: true,
  },
  {
    id: 2,
    name: 'Beasiswa Ekonomi Tidak Mampu',
    sponsor: 'GDEF...5678',
    total_fund: 2_250_000_000,
    disbursed_amount: 2_100_000_000,
    amount_per_recipient: 75_000_000,
    max_recipients: 30,
    current_recipients: 28,
    min_ipk: 250,
    deadline: Math.floor(Date.now() / 1000) + 86400 * 12,
    is_active: true,
  },
  {
    id: 3,
    name: 'Beasiswa Riset & Inovasi',
    sponsor: 'GHIJ...9012',
    total_fund: 1_000_000_000,
    disbursed_amount: 1_000_000_000,
    amount_per_recipient: 100_000_000,
    max_recipients: 10,
    current_recipients: 10,
    min_ipk: 375,
    deadline: Math.floor(Date.now() / 1000) - 86400 * 5,
    is_active: false,
  },
];

export const MOCK_RECIPIENTS = [
  { student_id: '2021001234', name: 'Budi Santoso', ipk: 375, grant_id: 1, wallet: 'GAKP...V7MQ', status: 'Disbursed', registered_at: 1720000000, disbursed_at: 1720086400 },
  { student_id: '2021005678', name: 'Siti Rahayu', ipk: 390, grant_id: 1, wallet: 'GCJN...X2PL', status: 'Disbursed', registered_at: 1720010000, disbursed_at: 1720096400 },
  { student_id: '2022003456', name: 'Ahmad Fauzi', ipk: 310, grant_id: 2, wallet: 'GDWQ...A8KN', status: 'Pending', registered_at: 1720100000, disbursed_at: 0 },
  { student_id: '2021009900', name: 'Dewi Lestari', ipk: 400, grant_id: 3, wallet: 'GBHN...Z3WT', status: 'Disbursed', registered_at: 1719900000, disbursed_at: 1720000000 },
  { student_id: '2022007890', name: 'Reza Pratama', ipk: 285, grant_id: 2, wallet: 'GCPQ...L9MK', status: 'Rejected', registered_at: 1720050000, disbursed_at: 0 },
  { student_id: '2021004321', name: 'Nurul Hidayah', ipk: 355, grant_id: 1, wallet: 'GDXY...B4NR', status: 'Pending', registered_at: 1720120000, disbursed_at: 0 },
  { student_id: '2020008800', name: 'Fajar Kurniawan', ipk: 340, grant_id: 2, wallet: 'GBCD...Q1RV', status: 'Disbursed', registered_at: 1719800000, disbursed_at: 1719900000 },
  { student_id: '2023001100', name: 'Laila Putri', ipk: 382, grant_id: 1, wallet: 'GCEF...M5NX', status: 'Pending', registered_at: 1720200000, disbursed_at: 0 },
];

export const MOCK_TX_LOG = [
  { id: 'tx1', ts: Date.now() / 1000 - 300,  type: 'disbursed', msg: 'Dana 5 XLM dikirim ke GAKP...V7MQ',      detail: 'Budi Santoso / 2021001234 · Grant #1', hash: 'a1b2c3d4' },
  { id: 'tx2', ts: Date.now() / 1000 - 900,  type: 'verified',  msg: 'Verifikasi disetujui: 2021001234',         detail: 'Oleh GVER...K2MN', hash: 'd5e6f7g8' },
  { id: 'tx3', ts: Date.now() / 1000 - 1800, type: 'registered',msg: 'Pendaftaran baru: Nurul Hidayah',          detail: '2021004321 · Grant #1', hash: 'h9i0j1k2' },
  { id: 'tx4', ts: Date.now() / 1000 - 3600, type: 'disbursed', msg: 'Dana 5 XLM dikirim ke GCJN...X2PL',      detail: 'Siti Rahayu / 2021005678 · Grant #1', hash: 'l3m4n5o6' },
  { id: 'tx5', ts: Date.now() / 1000 - 7200, type: 'rejected',  msg: 'Pendaftaran ditolak: 2022007890',          detail: 'IPK di bawah syarat minimum', hash: 'p7q8r9s0' },
  { id: 'tx6', ts: Date.now() / 1000 - 14400,type: 'grant',     msg: 'Program beasiswa dibuat: Grant #1',        detail: 'Sponsor GABC...1234 · 50 slot · 250 XLM total', hash: 't1u2v3w4' },
  { id: 'tx7', ts: Date.now() / 1000 - 28800,type: 'disbursed', msg: 'Dana 7.5 XLM dikirim ke GBCD...Q1RV',    detail: 'Fajar Kurniawan / 2020008800 · Grant #2', hash: 'x5y6z7a8' },
];

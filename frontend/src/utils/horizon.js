const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const CONTRACT_ID = 'GAHICSMD2MXGE2I3JWA6DEMX5RGHJBYZOT32OUIUMMXA5BUKDQJVA3X5'

// Mapping fungsi contract → tipe log
const FN_TYPE_MAP = {
  create_grant:        { type: 'grant',      label: 'Grant Baru' },
  register_recipient:  { type: 'registered', label: 'Daftar' },
  verify_and_disburse: { type: 'disbursed',  label: 'Dicairkan/Ditolak' },
  add_verifier:        { type: 'verifier',   label: 'Verifikator' },
  remove_verifier:     { type: 'verifier',   label: 'Verifikator' },
  initialize:          { type: 'grant',      label: 'Init' },
  close_grant:         { type: 'grant',      label: 'Grant Ditutup' },
}

export async function getContractTransactions(limit = 30) {
  try {
    const url = `${HORIZON_URL}/accounts/${CONTRACT_ID}/operations?limit=${limit}&order=desc&include_failed=false`
    const res  = await fetch(url)
    if (!res.ok) throw new Error('Horizon error: ' + res.status)
    const data = await res.json()

    const records = data._embedded?.records || []

    return records
      .filter(op => op.type === 'invoke_host_function')
      .map(op => {
        // Coba ambil nama fungsi dari parameters
        const fnName = op.parameters?.[0]?.value || ''
        const mapped = Object.entries(FN_TYPE_MAP).find(([key]) =>
          fnName.toLowerCase().includes(key.toLowerCase())
        )

        const typeInfo = mapped?.[1] || { type: 'grant', label: 'Transaksi' }

        return {
          id:     op.id,
          ts:     new Date(op.created_at).getTime() / 1000,
          type:   typeInfo.type,
          msg:    typeInfo.label + ' — ' + (op.source_account?.slice(0, 8) + '...' || ''),
          detail: `Ledger #${op.transaction?.ledger || op.ledger || ''}`,
          hash:   op.transaction_hash?.slice(0, 8) || op.id?.slice(0, 8),
          tx_hash: op.transaction_hash,
        }
      })
  } catch (e) {
    console.error('Horizon fetch error:', e)
    return []
  }
}

export function getTxUrl(txHash) {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`
}

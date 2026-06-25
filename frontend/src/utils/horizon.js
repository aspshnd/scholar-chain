const HORIZON_URL = 'https://horizon-testnet.stellar.org'

export async function getContractTransactions(walletAddress, limit = 30) {
  if (!walletAddress) return []

  try {
    const url = `${HORIZON_URL}/accounts/${walletAddress}/operations?limit=${limit}&order=desc&include_failed=false`
    const res  = await fetch(url)
    if (!res.ok) throw new Error('Horizon error: ' + res.status)
    const data = await res.json()
    const records = data._embedded?.records || []

    return records
      .filter(op => op.type === 'invoke_host_function')
      .map(op => {
        const fnParam  = op.parameters?.[1]
        const fnName   = fnParam?.type === 'Sym' ? decodeSymbol(fnParam.value) : 'unknown'
        const typeInfo = mapFnToType(fnName)

        return {
          id:      op.id,
          ts:      new Date(op.created_at).getTime() / 1000,
          type:    typeInfo.type,
          msg:     typeInfo.msg,
          detail:  `${walletAddress.slice(0, 8)}... · ${fnName}`,
          hash:    op.transaction_hash?.slice(0, 8),
          tx_hash: op.transaction_hash,
        }
      })
  } catch (e) {
    console.error('Horizon fetch error:', e)
    throw e
  }
}

function decodeSymbol(b64) {
  try {
    const bin      = atob(b64)
    const bytes    = Uint8Array.from(bin, c => c.charCodeAt(0))
    const len      = (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]
    const strBytes = bytes.slice(8, 8 + len)
    return new TextDecoder().decode(strBytes)
  } catch (_) {
    return 'unknown'
  }
}

function mapFnToType(fnName) {
  const map = {
    verify_and_disburse: { type: 'disbursed',  msg: 'Verifikasi & pencairan dana' },
    register_recipient:  { type: 'registered', msg: 'Pendaftaran penerima baru' },
    create_grant:        { type: 'grant',       msg: 'Program beasiswa dibuat' },
    add_verifier:        { type: 'verifier',    msg: 'Verifikator ditambahkan' },
    remove_verifier:     { type: 'verifier',    msg: 'Verifikator dihapus' },
    initialize:          { type: 'grant',       msg: 'Contract diinisialisasi' },
    close_grant:         { type: 'grant',       msg: 'Grant ditutup' },
  }
  return map[fnName] || { type: 'grant', msg: `Transaksi: ${fnName}` }
}

export function getTxUrl(txHash) {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`
}

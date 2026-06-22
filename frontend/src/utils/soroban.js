import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  nativeToScVal,
  scValToNative,
  Keypair,
  Account,
  Address,
} from '@stellar/stellar-sdk'
import * as SorobanRpc from '@stellar/stellar-sdk/rpc'

export const CONTRACT_ID        = 'CCDLJSBTUKEC6UA2IKY7R2DNFVNSKTPE7SPLBECSXZRYT6XZRZ673JKP'
export const NETWORK_PASSPHRASE = Networks.TESTNET
export const RPC_URL            = 'https://soroban-testnet.stellar.org'

const server   = new SorobanRpc.Server(RPC_URL)
const contract = new Contract(CONTRACT_ID)

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseRetval(retval) {
  if (!retval) return null
  if (typeof retval === 'object' && typeof retval.switch === 'function') return retval
  if (typeof retval === 'string') return xdr.ScVal.fromXDR(retval, 'base64')
  return retval
}

function makeFakeAccount() {
  return new Account(Keypair.random().publicKey(), '0')
}

function addr(publicKey) {
  return nativeToScVal(Address.fromString(publicKey), { type: 'address' })
}

// ─── Simulate (read-only) ────────────────────────────────────────────────────

async function simulate(operation) {
  const source = makeFakeAccount()
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(operation).setTimeout(30).build()

  const result = await server.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(result)) throw new Error(result.error)
  return result
}

// ─── Build tx ────────────────────────────────────────────────────────────────
// Menyimpan operation agar bisa di-rebuild fresh saat sign.
// Return { operation, publicKey } bukan XDR — simulasi ulang dilakukan
// di signAndSubmit tepat sebelum Freighter sign, supaya nonce tidak expired.

async function buildTx(publicKey, operation) {
  // Validasi dulu akun ada di chain
  await server.getAccount(publicKey)
  // Return operation + signer untuk dipakai signAndSubmit
  return { operation, publicKey }
}

// ─── Sign + submit via Freighter ─────────────────────────────────────────────

export async function signAndSubmit({ operation, publicKey }) {
  const { signTransaction } = await import('@stellar/freighter-api')

  // Ambil akun fresh (sequence number terbaru)
  const source = await server.getAccount(publicKey)

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build()

  // Simulasi FRESH — nonce dan auth entry baru di sini
  const sim = await server.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error('Simulasi gagal: ' + sim.error)
  }

  // assemble inject resource fee + auth entries dengan nonce yang masih fresh
  const assembled = SorobanRpc.assembleTransaction(tx, sim).build()

  // Set signatureExpirationLedger yang valid (bukan 0)
  const latestLedger = await server.getLatestLedger()
  const expLedger    = latestLedger.sequence + 100

  for (const op of assembled.operations) {
    if (!op.auth) continue
    for (const entry of op.auth) {
      try {
        const cred = entry.credentials()
        if (cred.switch().name === 'sorobanCredentialsAddress') {
          cred.address().signatureExpirationLedger(expLedger)
        }
      } catch (_) { /* entry tidak punya address cred, skip */ }
    }
  }

  const xdrToSign = assembled.toXDR()

  // Freighter sign — otomatis sign auth entries yang address-nya match wallet
  const signed    = await signTransaction(xdrToSign, { networkPassphrase: NETWORK_PASSPHRASE })
  const signedXdr = typeof signed === 'string' ? signed : signed.signedTxXdr

  if (!signedXdr) throw new Error('Freighter tidak mengembalikan transaksi yang ditandatangani.')

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  const result   = await server.sendTransaction(signedTx)

  if (result.status === 'ERROR') {
    const detail = typeof result.errorResult === 'object'
      ? JSON.stringify(result.errorResult)
      : String(result.errorResult ?? 'Unknown error')
    throw new Error('Submit error: ' + detail)
  }

  // Poll konfirmasi
  let res      = await server.getTransaction(result.hash)
  let attempts = 0

  while (res.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 20) {
    await new Promise(r => setTimeout(r, 1500))
    res = await server.getTransaction(result.hash)
    attempts++
  }

  if (attempts >= 20) {
    throw new Error(`Transaksi timeout. Cek di: https://testnet.stellar.expert/explorer/testnet/tx/${result.hash}`)
  }

  if (res.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    const errStr = JSON.stringify(res)
    const reason =
      errStr.includes('AlreadyRegistered')  ? 'NIM ini sudah terdaftar di blockchain.'              :
      errStr.includes('GrantExpired')        ? 'Program beasiswa sudah berakhir.'                    :
      errStr.includes('RequirementsNotMet')  ? 'IPK tidak memenuhi syarat minimum.'                  :
      errStr.includes('InsufficientFunds')   ? 'Dana grant tidak mencukupi.'                         :
      errStr.includes('NotAuthorized')       ? 'Akun tidak memiliki otorisasi.'                      :
      errStr.includes('AlreadyDisbursed')    ? 'Dana sudah pernah dicairkan.'                        :
      errStr.includes('InvalidAmount')       ? 'Jumlah tidak valid.'                                 :
      errStr.includes('RecipientNotFound')   ? 'Penerima tidak ditemukan.'                           :
      errStr.includes('GrantNotFound')       ? 'Program beasiswa tidak ditemukan.'                   :
      errStr.includes('scecInvalidAction')   ? 'Autentikasi gagal — pastikan wallet yang connect sama dengan wallet yang didaftarkan.' :
      res.resultXdr
        ? 'TX gagal: ' + String(res.resultXdr).slice(0, 120)
        : 'TX gagal on-chain (tidak ada detail)'

    throw new Error(reason)
  }

  return res
}

// ─── READ functions ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const sim    = await simulate(contract.call('get_dashboard_stats'))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return null
  const d = scValToNative(retval)
  return {
    total_grants:     Number(d.total_grants),
    total_recipients: Number(d.total_recipients),
    total_disbursed:  Number(d.total_disbursed),
    total_pending:    Number(d.total_pending),
    total_verified:   Number(d.total_verified),
    last_updated:     Number(d.last_updated),
  }
}

export async function getGrant(grantId) {
  const sim    = await simulate(contract.call('get_grant', nativeToScVal(BigInt(grantId), { type: 'u64' })))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return null
  const native = scValToNative(retval)
  if (!native) return null
  return parseGrant(native)
}

export async function getGrantCount() {
  const sim    = await simulate(contract.call('grant_count'))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return 0
  return Number(scValToNative(retval))
}

export async function getAllGrants() {
  const count  = await getGrantCount()
  const grants = []
  for (let i = 1; i <= count; i++) {
    const g = await getGrant(i)
    if (g) grants.push(g)
  }
  return grants
}

export async function getRecipient(studentId) {
  const sim    = await simulate(contract.call('get_recipient', nativeToScVal(studentId, { type: 'string' })))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return null
  const native = scValToNative(retval)
  if (!native) return null
  return parseRecipient(native)
}

export async function getAdmin() {
  const sim    = await simulate(contract.call('get_admin'))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return null
  return String(scValToNative(retval))
}

export async function isVerifier(publicKey) {
  const sim    = await simulate(contract.call('is_verifier', addr(publicKey)))
  const retval = parseRetval(sim.result?.retval)
  if (!retval) return false
  return Boolean(scValToNative(retval))
}

// ─── WRITE functions ──────────────────────────────────────────────────────────

export async function registerRecipient({ wallet, studentId, name, grantId, ipk, krsHash }, publicKey) {
  const op = contract.call(
    'register_recipient',
    addr(wallet),
    nativeToScVal(studentId,       { type: 'string' }),
    nativeToScVal(name,            { type: 'string' }),
    nativeToScVal(BigInt(grantId), { type: 'u64' }),
    nativeToScVal(ipk,             { type: 'u32' }),
    nativeToScVal(krsHash,         { type: 'string' }),
  )
  return buildTx(publicKey, op)
}

export async function verifyAndDisburse({ studentId, approved, rejectionReason }, publicKey) {
  const op = contract.call(
    'verify_and_disburse',
    addr(publicKey),
    nativeToScVal(studentId,       { type: 'string' }),
    nativeToScVal(approved,        { type: 'bool' }),
    nativeToScVal(rejectionReason, { type: 'string' }),
  )
  return buildTx(publicKey, op)
}

export async function createGrant({ name, amountPerRecipient, maxRecipients, minIpk, deadline, tokenAddress }, publicKey) {
  const op = contract.call(
    'create_grant',
    addr(publicKey),
    nativeToScVal(name,                      { type: 'string' }),
    nativeToScVal(BigInt(amountPerRecipient), { type: 'i128' }),
    nativeToScVal(maxRecipients,             { type: 'u32' }),
    nativeToScVal(minIpk,                    { type: 'u32' }),
    nativeToScVal(BigInt(deadline),          { type: 'u64' }),
    addr(tokenAddress),
  )
  return buildTx(publicKey, op)
}

export async function addVerifier({ adminKey, verifierKey }) {
  const op = contract.call('add_verifier', addr(adminKey), addr(verifierKey))
  return buildTx(adminKey, op)
}

export async function removeVerifier({ adminKey, verifierKey }) {
  const op = contract.call('remove_verifier', addr(adminKey), addr(verifierKey))
  return buildTx(adminKey, op)
}

export async function closeGrant({ grantId }, publicKey) {
  const op = contract.call('close_grant', addr(publicKey), nativeToScVal(BigInt(grantId), { type: 'u64' }))
  return buildTx(publicKey, op)
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseGrant(d) {
  return {
    id:                   Number(d.id),
    name:                 String(d.name),
    sponsor:              String(d.sponsor),
    total_fund:           Number(d.total_fund),
    disbursed_amount:     Number(d.disbursed_amount),
    amount_per_recipient: Number(d.amount_per_recipient),
    max_recipients:       Number(d.max_recipients),
    current_recipients:   Number(d.current_recipients),
    min_ipk:              Number(d.min_ipk),
    deadline:             Number(d.deadline),
    is_active:            Boolean(d.is_active),
    token_address:        String(d.token_address),
  }
}

function parseRecipient(d) {
  const statusMap = {
    Pending: 'Pending', Verified: 'Verified',
    Disbursed: 'Disbursed', Rejected: 'Rejected', Suspended: 'Suspended',
  }
  return {
    wallet:        String(d.wallet),
    student_id:    String(d.student_id),
    name:          String(d.name),
    status:        statusMap[String(d.status)] || 'Pending',
    registered_at: Number(d.registered_at),
    verified_at:   Number(d.verified_at),
    disbursed_at:  Number(d.disbursed_at),
    grant_id:      Number(d.grant_id),
    ipk:           Number(d.ipk),
    krs_hash:      String(d.krs_hash),
    verifier:      String(d.verifier),
  }
}
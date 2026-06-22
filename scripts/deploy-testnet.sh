#!/usr/bin/env bash
# =====================================================
# ScholarChain — Deploy & Test Script (Soroban Testnet)
# =====================================================
# Prasyarat:
#   1. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
#   2. Tambah target wasm: rustup target add wasm32-unknown-unknown
#   3. Install Stellar CLI: cargo install --locked stellar-cli --features opt
#   4. Buat akun testnet (lihat bagian SETUP di bawah)
# =====================================================

set -e

# ── KONFIGURASI ──────────────────────────────────────
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# File untuk menyimpan state deploy
STATE_FILE=".deploy_state.env"

echo "╔══════════════════════════════════════════════╗"
echo "║     ScholarChain — Soroban Testnet Deploy    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── STEP 1: BUAT AKUN TESTNET ─────────────────────
setup_accounts() {
    echo "📋 [1/6] Setup akun testnet..."

    # Generate keypair untuk admin
    stellar keys generate --global admin-scholarchain --network testnet 2>/dev/null || true
    stellar keys generate --global sponsor-scholarchain --network testnet 2>/dev/null || true
    stellar keys generate --global verifier-scholarchain --network testnet 2>/dev/null || true
    stellar keys generate --global student-scholarchain --network testnet 2>/dev/null || true

    ADMIN_ADDR=$(stellar keys address admin-scholarchain)
    SPONSOR_ADDR=$(stellar keys address sponsor-scholarchain)
    VERIFIER_ADDR=$(stellar keys address verifier-scholarchain)
    STUDENT_ADDR=$(stellar keys address student-scholarchain)

    echo "  Admin:     $ADMIN_ADDR"
    echo "  Sponsor:   $SPONSOR_ADDR"
    echo "  Verifier:  $VERIFIER_ADDR"
    echo "  Student:   $STUDENT_ADDR"

    # Fund dari Friendbot (testnet faucet)
    echo ""
    echo "💰 Funding akun dari Friendbot testnet..."
    for key in admin-scholarchain sponsor-scholarchain verifier-scholarchain student-scholarchain; do
        ADDR=$(stellar keys address $key)
        curl -s "https://friendbot.stellar.org?addr=$ADDR" > /dev/null
        echo "  ✅ $key funded"
    done

    # Simpan state
    cat > $STATE_FILE << EOF
ADMIN_ADDR=$ADMIN_ADDR
SPONSOR_ADDR=$SPONSOR_ADDR
VERIFIER_ADDR=$VERIFIER_ADDR
STUDENT_ADDR=$STUDENT_ADDR
EOF
    echo "  State disimpan ke $STATE_FILE"
}

# ── STEP 2: BUILD CONTRACT ─────────────────────────
build_contract() {
    echo ""
    echo "🔨 [2/6] Build smart contract..."
    stellar contract build
    echo "  ✅ Build berhasil: target/wasm32-unknown-unknown/release/scholarchain.wasm"
    ls -lh target/wasm32-unknown-unknown/release/scholarchain.wasm
}

# ── STEP 3: UPLOAD WASM KE NETWORK ────────────────
upload_contract() {
    echo ""
    echo "📤 [3/6] Upload WASM ke Soroban testnet..."
    source $STATE_FILE

    WASM_HASH=$(stellar contract upload \
        --network $NETWORK \
        --source admin-scholarchain \
        --wasm target/wasm32-unknown-unknown/release/scholarchain.wasm)

    echo "  ✅ WASM Hash: $WASM_HASH"
    echo "WASM_HASH=$WASM_HASH" >> $STATE_FILE
}

# ── STEP 4: DEPLOY CONTRACT INSTANCE ──────────────
deploy_contract() {
    echo ""
    echo "🚀 [4/6] Deploy contract instance..."
    source $STATE_FILE

    CONTRACT_ID=$(stellar contract deploy \
        --network $NETWORK \
        --source admin-scholarchain \
        --wasm-hash $WASM_HASH)

    echo "  ✅ Contract ID: $CONTRACT_ID"
    echo "CONTRACT_ID=$CONTRACT_ID" >> $STATE_FILE
    echo ""
    echo "  🔗 Lihat di Stellar Expert:"
    echo "     https://testnet.stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
}

# ── STEP 5: INISIALISASI CONTRACT ─────────────────
initialize_contract() {
    echo ""
    echo "⚙️  [5/6] Inisialisasi ScholarChain contract..."
    source $STATE_FILE

    stellar contract invoke \
        --network $NETWORK \
        --source admin-scholarchain \
        --id $CONTRACT_ID \
        -- \
        initialize \
        --admin $ADMIN_ADDR

    echo "  ✅ Contract initialized!"

    # Tambah verifier
    stellar contract invoke \
        --network $NETWORK \
        --source admin-scholarchain \
        --id $CONTRACT_ID \
        -- \
        add_verifier \
        --admin $ADMIN_ADDR \
        --verifier $VERIFIER_ADDR

    echo "  ✅ Verifier ditambahkan: $VERIFIER_ADDR"
}

# ── STEP 6: DEMO FLOW LENGKAP ─────────────────────
demo_flow() {
    echo ""
    echo "🎓 [6/6] Demo alur beasiswa lengkap..."
    source $STATE_FILE

    # Gunakan native XLM sebagai token (untuk testnet)
    # Di mainnet, bisa gunakan USDC atau token custom
    NATIVE_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

    echo ""
    echo "  📝 Buat program beasiswa Prestasi 2025..."
    DEADLINE=$(($(date +%s) + 2592000)) # 30 hari dari sekarang

    GRANT_ID=$(stellar contract invoke \
        --network $NETWORK \
        --source sponsor-scholarchain \
        --id $CONTRACT_ID \
        -- \
        create_grant \
        --sponsor $SPONSOR_ADDR \
        --name "Beasiswa Prestasi 2025" \
        --amount_per_recipient 50000000 \
        --max_recipients 10 \
        --min_ipk 300 \
        --deadline $DEADLINE \
        --token_address $NATIVE_TOKEN)

    echo "  ✅ Grant dibuat, ID: $GRANT_ID"

    echo ""
    echo "  🧑‍🎓 Mahasiswa mendaftar..."
    stellar contract invoke \
        --network $NETWORK \
        --source student-scholarchain \
        --id $CONTRACT_ID \
        -- \
        register_recipient \
        --wallet $STUDENT_ADDR \
        --student_id "2021001234" \
        --name "Budi Santoso" \
        --grant_id 1 \
        --ipk 375 \
        --krs_hash "sha256:a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"

    echo "  ✅ Mahasiswa terdaftar, status: PENDING"

    echo ""
    echo "  🔍 Cek status penerima..."
    stellar contract invoke \
        --network $NETWORK \
        --source admin-scholarchain \
        --id $CONTRACT_ID \
        -- \
        get_recipient \
        --student_id "2021001234"

    echo ""
    echo "  ✅ Verifikator memvalidasi dan dana otomatis cair..."
    stellar contract invoke \
        --network $NETWORK \
        --source verifier-scholarchain \
        --id $CONTRACT_ID \
        -- \
        verify_and_disburse \
        --verifier $VERIFIER_ADDR \
        --student_id "2021001234" \
        --approved true \
        --rejection_reason ""

    echo "  ✅ Dana berhasil dicairkan langsung ke wallet mahasiswa!"

    echo ""
    echo "  📊 Cek dashboard stats..."
    stellar contract invoke \
        --network $NETWORK \
        --source admin-scholarchain \
        --id $CONTRACT_ID \
        -- \
        get_dashboard_stats

    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║           ✅ DEPLOY & DEMO BERHASIL!                    ║"
    echo "╠══════════════════════════════════════════════════════════╣"
    source $STATE_FILE
    echo "║  Contract ID: $CONTRACT_ID"
    echo "║  Network: Soroban Testnet"
    echo "║  Explorer: https://testnet.stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
    echo "╚══════════════════════════════════════════════════════════╝"
}

# ── MAIN ──────────────────────────────────────────
case "${1:-all}" in
    accounts)   setup_accounts ;;
    build)      build_contract ;;
    upload)     upload_contract ;;
    deploy)     deploy_contract ;;
    init)       initialize_contract ;;
    demo)       demo_flow ;;
    all)
        setup_accounts
        build_contract
        upload_contract
        deploy_contract
        initialize_contract
        demo_flow
        ;;
    *)
        echo "Usage: $0 [all|accounts|build|upload|deploy|init|demo]"
        exit 1
        ;;
esac

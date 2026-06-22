# ScholarChain

### Decentralized Scholarship Management Platform on Stellar Soroban

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.org)

---

## 📖 Project Description

ScholarChain is a decentralized scholarship management platform built on the Stellar blockchain using Soroban Smart Contracts.

The platform enables sponsors, educational institutions, and scholarship administrators to manage scholarship programs transparently, securely, and efficiently without relying on centralized databases.

All critical activities—including scholarship creation, student registration, verification, and fund disbursement—are recorded on-chain, ensuring transparency, auditability, and trust among all participants.

By leveraging Stellar’s fast and low-cost blockchain infrastructure, ScholarChain provides a modern solution for educational funding and scholarship distribution.

---

## 🚀 Live Demo
Akses aplikasi web kami di sini: https://scholar-chain-8scsecxe8-muhammad-aseps-projects.vercel.app/

## 🎯 Project Vision

ScholarChain aims to transform scholarship management by creating a transparent and trustless ecosystem where educational funding can be distributed fairly and efficiently.

### Our Goals

* Eliminate manual and opaque scholarship processes
* Increase transparency in fund allocation
* Reduce administrative fraud and manipulation
* Create immutable scholarship records
* Empower students with verifiable on-chain achievements
* Build a global scholarship infrastructure accessible to everyone

---

## ✨ Key Features

### 1. Scholarship Grant Creation

Sponsors can create scholarship programs directly on-chain.

Features include:

* Program name
* Scholarship budget
* Amount per recipient
* Maximum recipients
* Minimum GPA requirement
* Registration deadline
* Token-based funding support

All scholarship funds are locked within the smart contract until distribution.

---

### 2. Student Registration

Students can apply directly through the platform by submitting:

* Student ID (NIM)
* Full name
* Wallet address
* GPA
* Academic document hash (KRS / Transcript)

The smart contract validates eligibility requirements automatically.

---

### 3. On-Chain Verification

Authorized verifiers can:

* Approve recipients
* Reject applicants
* Track verification history

Every action is permanently recorded on the blockchain.

---

### 4. Automated Scholarship Disbursement

When a student is approved:

* Funds are transferred automatically
* Disbursement status is updated
* Transaction history is recorded
* Dashboard statistics are updated

This removes manual payment processing and reduces operational risk.

---

### 5. Verifier Management

Administrators can:

* Add verifiers
* Remove verifiers
* Manage authorization roles

Only authorized accounts can verify applications.

---

### 6. Transparency & Auditability

ScholarChain records all critical activities on-chain:

* Grant creation
* Student registration
* Verification approval
* Verification rejection
* Fund disbursement

Anyone can independently verify transactions using Stellar blockchain explorers.

---

### 7. Dashboard Analytics

The platform provides real-time statistics including:

* Total grants
* Total applicants
* Pending verifications
* Verified recipients
* Total distributed funds

---

## 🏗️ Smart Contract Functions

### Administrative Functions

#### initialize()

Initialize the contract and assign administrator privileges.

#### add_verifier()

Authorize a verifier account.

#### remove_verifier()

Remove verifier authorization.

---

### Grant Management

#### create_grant()

Create a scholarship program and lock funding.

#### close_grant()

Close a scholarship program and return unused funds.

#### get_grant()

Retrieve grant information.

---

### Recipient Management

#### register_recipient()

Register a student for a scholarship.

#### verify_and_disburse()

Approve or reject recipients and automatically distribute funds.

#### get_recipient()

Retrieve recipient information.

---

### Analytics

#### get_dashboard_stats()

Retrieve contract statistics.

#### grant_count()

Retrieve total number of scholarship programs.

---

## 🏛️ System Architecture

### Administrator

Responsible for:

* Contract initialization
* Managing verifiers
* Closing grants

### Sponsor

Responsible for:

* Funding scholarship programs
* Creating grants

### Verifier

Responsible for:

* Reviewing applications
* Approving or rejecting recipients

### Student

Responsible for:

* Registering for scholarships
* Receiving scholarship funds

---

## 📢 Contract Events

| Event  | Description           |
| ------ | --------------------- |
| grant  | Scholarship created   |
| reg    | Student registered    |
| reject | Application rejected  |
| disb   | Scholarship disbursed |

---

## 🛠️ Technology Stack

### Blockchain

* Stellar Testnet
* Soroban Smart Contracts

### Smart Contract

* Rust
* Soroban SDK

### Frontend

* React.js
* Vite

### Wallet Integration

* Freighter Wallet

---

## 🚀 Getting Started

### Prerequisites

Install:

* Rust
* Soroban CLI
* Node.js
* npm

---

### Clone Repository

```bash
git clone https://github.com/aspshnd/scholar-chain.git
cd scholar-chain
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at:

```text
http://localhost:5173
```

---

### Smart Contract Build

```bash
cargo build --target wasm32v1-none --release
```

---

### Deploy Contract

```bash
stellar contract deploy \
  --network testnet \
  --source alice \
  --wasm target/wasm32v1-none/release/scholar_chain.wasm
```

---

## 🧪 Testing

Run smart contract tests:

```bash
cargo test
```

---

## 📄 Contract Information

### Network

Stellar Testnet

### Contract Address

```text
CCDLJSBTUKEC6UA2IKY7R2DNFVNSKTPE7SPLBECSXZRYT6XZRZ673JKP
```

---

## 🔮 Future Improvements

### Phase 1

* Scholarship categories
* Search and filtering
* Recipient pagination
* Enhanced analytics

### Phase 2

* NFT scholarship certificates
* Multi-university integration
* Academic verification
* Decentralized identity (DID)

### Phase 3

* DAO governance
* Cross-border scholarships
* AI-assisted eligibility screening
* Mobile application

---

## 📜 License

Distributed under the MIT License.

---

## Built with Stellar Soroban

**Empowering transparent educational funding through decentralized technology.**

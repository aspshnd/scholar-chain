# ScholarChain

### Decentralized Scholarship Management Platform on Stellar Soroban

ScholarChain is a decentralized scholarship management platform built on the Stellar blockchain using Soroban Smart Contracts. The platform enables scholarship sponsors, educational institutions, and administrators to transparently manage scholarship programs while ensuring trust, accountability, and auditability through blockchain technology.

---

## Live Features

* Scholarship Program Creation
* Student Registration
* On-Chain Verification
* Automated Fund Disbursement
* Verifier Management
* Dashboard Analytics
* Transaction History Tracking
* Freighter Wallet Integration

---

## Architecture

```text
ScholarChain
│
├── contracts/
│   └── scholarchain/
│       ├── Cargo.toml
│       └── src/lib.rs
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Smart Contract Information

### Network

Stellar Testnet

### Contract ID

```text
CCDLJSBTUKEC6UA2IKY7R2DNFVNSKTPE7SPLBECSXZRYT6XZRZ673JKP
```

### Explorer

https://stellar.expert/explorer/testnet/contract/CCDLJSBTUKEC6UA2IKY7R2DNFVNSKTPE7SPLBECSXZRYT6XZRZ673JKP

---

## Project Vision

ScholarChain aims to create a transparent, decentralized, and efficient scholarship ecosystem where educational funding can be distributed fairly and securely without reliance on centralized systems.

### Goals

* Improve transparency in scholarship allocation
* Prevent fraud and data manipulation
* Create immutable student records
* Enable automated scholarship distribution
* Provide public auditability of funding activities

---

## Key Features

### Scholarship Grant Creation

Sponsors can:

* Create scholarship programs
* Lock funds into smart contracts
* Define eligibility requirements
* Set registration deadlines

### Student Registration

Students can register by submitting:

* Student ID (NIM)
* Name
* Wallet Address
* GPA (IPK)
* Academic Document Hash

### Verification Process

Authorized verifiers can:

* Approve applications
* Reject applications
* Record verification results on-chain

### Automatic Disbursement

When approved:

* Funds are transferred automatically
* Recipient status is updated
* Blockchain events are emitted
* Dashboard statistics are updated

### Dashboard Analytics

Provides:

* Total Grants
* Total Applicants
* Pending Verifications
* Verified Recipients
* Total Funds Distributed

### Blockchain Transaction Tracking

All contract interactions can be tracked directly through Stellar Horizon and Stellar Expert.

---

## Smart Contract Functions

### Administration

* initialize()
* add_verifier()
* remove_verifier()
* close_grant()

### Grant Management

* create_grant()
* get_grant()
* grant_count()

### Recipient Management

* register_recipient()
* verify_and_disburse()
* get_recipient()

### Analytics

* get_dashboard_stats()

---

## Contract Events

| Event  | Description                 |
| ------ | --------------------------- |
| grant  | Scholarship program created |
| reg    | Student registration        |
| reject | Application rejected        |
| disb   | Scholarship disbursement    |

---

## Technology Stack

### Blockchain Layer

* Stellar Testnet
* Soroban Smart Contracts
* Horizon API

### Smart Contract

* Rust
* Soroban SDK

### Frontend

* React
* Vite
* JavaScript

### Wallet

* Freighter Wallet

---

## Running Frontend

```bash
cd frontend
npm install
npm run dev
```

Application:

```text
http://localhost:5173
```

---

## Building Frontend

```bash
npm run build
```

---

## Deploying Smart Contract

Build Contract:

```bash
stellar contract build
```

Deploy:

```bash
stellar contract deploy \
  --source alice \
  --network testnet
```

---

## Future Roadmap

### Phase 1

* Scholarship Categories
* Search & Filtering
* Advanced Analytics
* Pagination

### Phase 2

* NFT Scholarship Certificates
* Academic Achievement Verification
* Multi-University Integration
* Decentralized Identity (DID)

### Phase 3

* DAO Governance
* Mobile Application
* Cross-Border Scholarships
* AI-Assisted Verification

---

## Why ScholarChain?

Traditional scholarship systems often suffer from:

* Centralized control
* Lack of transparency
* Slow verification
* Manual disbursement
* Difficult auditing

ScholarChain solves these issues through decentralized infrastructure powered by Stellar Soroban.

---

## Built with Stellar Soroban

Empowering transparent educational funding through decentralized technology.

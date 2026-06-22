# ScholarChain

### Decentralized Scholarship Management Platform on Stellar Soroban

## Project Description

ScholarChain is a decentralized scholarship management platform built on the Stellar blockchain using Soroban Smart Contracts.

The platform enables sponsors, educational institutions, and scholarship administrators to manage scholarship programs transparently and securely without relying on centralized databases.

All critical activities—including scholarship creation, student registration, verification, and fund disbursement—are recorded on-chain, ensuring transparency, auditability, and trust among all participants.

By leveraging Stellar's fast and low-cost blockchain infrastructure, ScholarChain provides a reliable solution for modern scholarship distribution and educational funding management.

---

## Project Vision

ScholarChain aims to transform scholarship distribution by creating a transparent, trustless, and decentralized ecosystem where educational funding can be managed fairly and efficiently.

Our vision includes:

* Eliminating manual and opaque scholarship processes
* Increasing transparency in fund allocation
* Reducing administrative fraud and manipulation
* Creating immutable scholarship records
* Empowering students with verifiable on-chain achievements
* Building a global scholarship infrastructure accessible to anyone

---

## Key Features

### 1. Scholarship Grant Creation

Sponsors can create scholarship programs directly on-chain.

Features include:

* Program name
* Scholarship budget
* Amount per recipient
* Maximum number of recipients
* Minimum GPA requirement
* Registration deadline
* Token-based funding support

All scholarship funds are locked within the smart contract until disbursement.

---

### 2. Student Registration

Students can apply directly through the platform by submitting:

* Student ID
* Full name
* Wallet address
* GPA
* Academic document hash (KRS/Transcript)

The smart contract automatically validates eligibility requirements before accepting registrations.

---

### 3. On-Chain Verification

Authorized verifiers can review student applications and:

* Approve recipients
* Reject recipients
* Track verification history

Every verification action is permanently recorded on the blockchain.

---

### 4. Automated Scholarship Disbursement

When a student is approved:

* Funds are transferred automatically
* Disbursement status is updated
* Transaction history is recorded
* Dashboard statistics are updated

This removes manual payment processing and minimizes operational risks.

---

### 5. Verifier Management

Administrators can:

* Add verifiers
* Remove verifiers
* Manage authorization roles

Only authorized accounts may verify scholarship applications.

---

### 6. Transparency & Auditability

ScholarChain records all critical actions as blockchain events:

* Grant creation
* Student registration
* Approval
* Rejection
* Fund disbursement

Anyone can independently verify the history through Stellar blockchain explorers.

---

### 7. Dashboard Analytics

The contract maintains real-time statistics including:

* Total grants
* Total applicants
* Total pending verifications
* Total verified recipients
* Total funds distributed

---

## Smart Contract Functions

### Administrative Functions

#### initialize()

Initialize the contract and set the administrator.

#### add_verifier()

Authorize a verifier account.

#### remove_verifier()

Remove verifier authorization.

---

### Grant Management

#### create_grant()

Create a new scholarship program and lock funding.

#### close_grant()

Close a scholarship program and return remaining funds.

#### get_grant()

Retrieve grant information.

---

### Recipient Management

#### register_recipient()

Register a student for a scholarship program.

#### verify_and_disburse()

Approve or reject applicants and automatically distribute funds.

#### get_recipient()

Retrieve recipient information.

---

### Analytics

#### get_dashboard_stats()

Retrieve contract statistics.

#### grant_count()

Get total number of scholarship programs.

---

## Smart Contract Architecture

### Actors

#### Administrator

Responsible for:

* Contract initialization
* Managing verifiers
* Closing scholarship programs

#### Sponsor

Responsible for:

* Funding scholarship grants
* Creating scholarship programs

#### Verifier

Responsible for:

* Reviewing applications
* Approving or rejecting recipients

#### Student

Responsible for:

* Registering for scholarships
* Receiving scholarship funds

---

## Contract Events

The contract emits blockchain events for transparency.

| Event  | Description                 |
| ------ | --------------------------- |
| grant  | Scholarship program created |
| reg    | Student registered          |
| reject | Application rejected        |
| disb   | Scholarship funds disbursed |

---

## Technology Stack

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

## Future Improvements

### Phase 1

* Multiple scholarship categories
* Recipient pagination
* Enhanced dashboard analytics
* Scholarship search and filtering

### Phase 2

* NFT Scholarship Certificates
* Academic achievement verification
* Multi-university integration
* Decentralized identity support

### Phase 3

* Cross-border scholarship distribution
* DAO governance
* AI-assisted eligibility screening
* Mobile application

---

## Contract Information

### Network

Stellar Testnet

### Contract Address

CCDLJSBTUKEC6UA2IKY7R2DNFVNSKTPE7SPLBECSXZRYT6XZRZ673JKP

---

## Why ScholarChain?

Traditional scholarship systems often suffer from:

* Lack of transparency
* Slow verification processes
* Centralized control
* Manual fund distribution
* Limited auditability

ScholarChain solves these challenges through blockchain technology, creating a transparent and verifiable scholarship ecosystem for students, sponsors, and educational institutions.

---

## Built with Stellar Soroban

Empowering transparent educational funding through decentralized technology.

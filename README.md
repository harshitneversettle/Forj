ProgramId : 8DUw9b9nwoXH6FuqBUGy7dknzpDy1Ljh94rwKYNdEHRb

Live on : https://forj-eight.vercel.app


# Forj: Blockchain Certificate Verification System
Forj is a decentralized platform built on the Solana blockchain designed to issue and verify tamper-proof digital certificates. By leveraging Merkle Trees and IPFS, Forj ensures that academic or professional credentials remain permanent, verifiable, and private, while maintaining minimal on-chain storage costs.

## Technical Overview
The system addresses the vulnerabilities of traditional PDF certificates—such as forgery and centralized dependency—by storing a cryptographic Merkle Root on-chain. This allows for the verification of thousands of certificates in a single Solana transaction.

### Core Architecture
1. Issuer Layer: Organizations upload a CSV of recipients and a fillable PDF template.

2. Processing Layer: The Node.js backend generates a Merkle Tree from the recipient data and uploads the metadata and template to IPFS via Pinata.

3. On-chain Layer: An Anchor-based smart contract stores the Merkle Root and metadata URIs in a Program Derived Address (PDA).

4. Verification Layer: Students claim certificates by providing their email; the system generates a Merkle Proof to validate their claim against the on-chain root before serving the finalized PDF.

## Tech Stack
Blockchain: Solana (Rust, Anchor Framework)

Frontend: React, TypeScript, Tailwind CSS

Backend: Node.js, Express, TypeScript

Storage: IPFS (Pinata), Amazon S3

Cryptography: MerkleTree.js, SHA-256

PDF Logic: PDF-lib for dynamic field population

## Project Structure
```
forj/
├── programs/
│   └── forj/
│       └── src/
│           ├── lib.rs              # Anchor program entry point
│           ├── state.rs            # Event account and state definitions
│           └── instructions/       # Initialize and Claim logic
├── Backend/
│   └── src/
│       ├── server.ts               # Express API and middleware
│       ├── services/               # Merkle Tree and IPFS logic
│       └── routes/                 # Upload and Verification endpoints
├── frontend/
│   ├── src/
│   │   ├── components/             # UI Components (Glassmorphism theme)
│   │   ├── pages/                  # Admin Dashboard and Claim Page
│   │   └── hooks/                  # Web3 and API integration
└── README.md
```

## Smart Contract Specification (Anchor)
### Event Account Structure
The contract utilizes a PDA to manage event-specific state, minimizing the data stored on-chain to maintain cost-efficiency.
```
#[account]
pub struct Event {
    pub issuer: Pubkey,              // Public key of the issuing authority
    pub unique_key: u64,             // Unique identifier for the event
    pub event_name: String,          // Name of the certification event
    pub batch_size: u32,             // Total number of certificates issued
    pub claimed_bitmap: Vec<u64>,    // Bitwise tracking of claimed status
    pub merkle_root: [u8; 32],       // Cryptographic root for verification
    pub metadata_uri: String,        // IPFS link to recipient data
    pub template_uri: String,        // IPFS link to the PDF template
    pub merkle_proof_uri: String,    // IPFS link to pre-computed proofs
    pub bump: u8,                    // PDA bump seed
}
```

## Installation and Setup
-> Prerequisites
1. Node.js 18+
2. Rust 1.75+ & Solana CLI 1.18+
3. Anchor Framework 0.30+
4. Pinata API Credentials

### 1. Repository Setup
```
git clone https://github.com/harshitneversettle/Forj.git
cd Forj
npm install
```
### 2. Smart Contract Deployment
Configure for Devnet
```
solana config set --url devnet
```
Build and deploy
```
anchor build
anchor deploy --provider.cluster devnet
```
### 3. Environment Configuration
```
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your_deployed_program_id
```
### 4. Running the Application
Start Backend
```
cd Backend && npm run dev
```
Start Frontend
```
cd ../frontend && npm run dev
```
### Performance Metrics
```
Metric,Value
Verification Latency,< 2 seconds
On-chain Storage,32 bytes (Root only)
Transaction Cost,~0.000005 SOL
Proof Size (1k certs),~10 hashes
```

## License
This project is licensed under the MIT License.

Author
Harshit Yadav

Email: harshityadav5499@gmail.com ,

GitHub: [harshitneversettle](https://github.com/harshitneversettle) ,

Twitter: [@Harshit_yad4v](https://x.com/Harshit_yad4v)

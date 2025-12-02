# 🎓 Suitudy - Decentralized Education Platform

![Sui Network](https://img.shields.io/badge/Sui-Network-blue)
![Move](https://img.shields.io/badge/Smart%20Contract-Move-orange)
![React](https://img.shields.io/badge/Frontend-React-61dafb)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

**Suitudy** is a decentralized education marketplace built on the Sui blockchain. Learn from experts or monetize your knowledge with crypto payments, powered by a custom token economy.

---

## 🌟 Features

### For Students
- 📚 **Browse Courses** - Explore educational content from global instructors
- 🔐 **zkLogin Integration** - Sign in with Google (no wallet needed!)
- 💎 **SUITUDY Tokens** - Purchase platform tokens to enroll in courses
- 🎫 **NFT Course Passes** - Receive soulbound NFT passes as proof of enrollment
- 🔒 **Secure Content** - Access private course materials after purchase

### For Instructors
- 👨‍🏫 **Create Courses** - List educational content with custom pricing
- 💰 **Direct Payments** - Receive SUITUDY tokens directly to your wallet
- 🌍 **Global Reach** - Access students worldwide without intermediaries
- 📊 **Full Control** - Manage your course listings and pricing

### Platform Features
- 🪙 **Token Exchange** - Buy/Sell SUITUDY tokens with SUI (1 SUI = 10 SUITUDY)
- 🎨 **Modern UI** - Beautiful, responsive interface with dark/light mode
- ⚡ **Fast Transactions** - Powered by Sui's high-performance blockchain
- 🔑 **Multiple Auth** - Support for both zkLogin and traditional wallets

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│  • Radix UI Components    • React Query                     │
│  • Sui dApp Kit          • Enoki (zkLogin)                  │
│  • Vite Build System     • TypeScript                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ RPC Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    SUI BLOCKCHAIN                            │
├─────────────────────────────────────────────────────────────┤
│  • Sui Testnet           • Move Smart Contracts             │
│  • zkLogin Proofs        • Shared Objects                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│              SMART CONTRACTS (Move Language)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Bank Object (Shared)                                        │
│  ├─ SUITUDY Token Treasury                                  │
│  ├─ SUI Reserve Balance                                     │
│  ├─ buy_token() - Mint tokens                               │
│  └─ sell_token() - Burn tokens                              │
│                                                              │
│  Lecture Object (Shared)                                     │
│  ├─ Course Metadata                                         │
│  ├─ Pricing Information                                     │
│  └─ Instructor Address                                      │
│                                                              │
│  LecturePass Object (Soulbound NFT)                          │
│  ├─ Student Ownership Proof                                 │
│  ├─ Course Reference                                        │
│  └─ Non-transferable                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Sui CLI** (latest version)
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/suitudy.git
cd suitudy
```

2. **Install Smart Contract Dependencies**
```bash
cd suitudy
sui move build
```

3. **Deploy Smart Contracts (Testnet)**
```bash
sui client publish --gas-budget 100000000
```

4. **Install Frontend Dependencies**
```bash
cd ../frontend
pnpm install
```

5. **Configure Environment Variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Enoki API Key (zkLogin)
VITE_ENOKI_PUBLIC_KEY=your_enoki_key

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Smart Contract Addresses (from deployment)
VITE_PACKAGE_ID=0x...
VITE_BANK_ID=0x...
```

6. **Start Development Server**
```bash
pnpm dev
```

Visit `http://localhost:5173` 🎉

---

## 📚 Smart Contract Details

### Core Module: `education_platform::suitudy`

#### Objects

**1. Bank (Shared Object)**
```move
struct Bank has key {
    id: UID,
    treasury: TreasuryCap<SUITUDY>,  // Token minting authority
    sui_reserve: Balance<SUI>         // SUI liquidity pool
}
```

**2. Lecture (Shared Object)**
```move
struct Lecture has key {
    id: UID,
    title: String,
    description: String,
    image_url: String,
    content_url: String,    // Private access link
    price: u64,             // Price in SUITUDY tokens
    seller: address         // Instructor address
}
```

**3. LecturePass (Soulbound NFT)**
```move
struct LecturePass has key {
    id: UID,
    lecture_id: ID,         // Reference to purchased course
    student: address,       // Owner (non-transferable)
    title: String          // Course title
}
```

#### Key Functions

| Function | Description | Access |
|----------|-------------|--------|
| `buy_token` | Exchange SUI for SUITUDY tokens (1:10 ratio) | Public |
| `sell_token` | Exchange SUITUDY tokens back to SUI | Public |
| `list_lecture` | Create a new course listing | Public |
| `buy_lecture` | Purchase a course with SUITUDY tokens | Public |
| `burn_pass` | Delete a course pass (student only) | Public |
| `delete_lecture` | Remove a course listing (instructor only) | Public |

#### Events

```move
// Token purchase event
struct TokenPurchased has copy, drop {
    buyer: address,
    sui_spent: u64,
    tokens_received: u64,
    timestamp: u64
}

// Token sale event
struct TokenSold has copy, drop {
    seller: address,
    tokens_sold: u64,
    sui_received: u64,
    timestamp: u64
}

// Course listing event
struct LectureListed has copy, drop {
    lecture_id: ID,
    instructor: address,
    title: String,
    price: u64,
    timestamp: u64
}

// Course purchase event
struct LecturePurchased has copy, drop {
    lecture_id: ID,
    student: address,
    instructor: address,
    price: u64,
    timestamp: u64
}
```

---

## 🔐 zkLogin Integration

Suitudy supports **passwordless authentication** using Google OAuth via Enoki's zkLogin.

### How It Works

1. User clicks "Login with Google"
2. Google OAuth flow authenticates user
3. Enoki generates zkLogin proof
4. User receives a Sui wallet address derived from their Google account
5. User can now interact with the blockchain without managing private keys

### Setup zkLogin

1. **Get Enoki API Key**: https://portal.enoki.mystenlabs.com/
2. **Create Google OAuth App**: https://console.cloud.google.com/
3. Configure redirect URIs:
   - Dev: `http://localhost:5173/auth/callback`
   - Prod: `https://yourdomain.com/auth/callback`

---

## 💻 Frontend Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Radix UI** | Component Library |
| **@mysten/dapp-kit** | Sui Wallet Integration |
| **@mysten/enoki** | zkLogin Provider |
| **@tanstack/react-query** | State Management |
| **React Router** | Client-side Routing |

---

## 📁 Project Structure

```
suitudy/
├── suitudy/                          # Move Smart Contracts
│   ├── sources/
│   │   └── core.move                 # Main contract logic
│   ├── tests/
│   │   └── suitudy_tests.move        # Unit tests
│   └── Move.toml                     # Move package config
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Navigation bar
│   │   │   ├── Marketplace.tsx       # Course listings
│   │   │   ├── CourseDetail.tsx      # Course details
│   │   │   ├── CreateCourse.tsx      # Create course form
│   │   │   ├── TokenShop.tsx         # Buy/Sell tokens
│   │   │   ├── EnokiLoginButton.tsx  # zkLogin button
│   │   │   └── AuthCallback.tsx      # OAuth handler
│   │   ├── utils/
│   │   │   └── tx-helpers.ts         # Transaction builders
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── networkConfig.ts          # Sui network config
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md                         # This file
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd suitudy
sui move test
```

### Test Coverage

- ✅ Bank initialization
- ✅ Token buying/selling
- ✅ Course listing
- ✅ Course purchasing
- ✅ Insufficient funds handling
- ✅ Access control

---

## 🎨 UI Screenshots

### Landing Page
```
┌────────────────────────────────────────────────┐
│  Suitudy                      [Token] [Theme]  │
│                                    [zkLogin]    │
├────────────────────────────────────────────────┤
│                                                 │
│        🎓 Knowledge is Value                   │
│                                                 │
│  The decentralized marketplace for education   │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐             │
│  │ 📖 Student  │  │ 👨‍🏫 Teacher │             │
│  │             │  │             │             │
│  │ Learn       │  │ Teach       │             │
│  └─────────────┘  └─────────────┘             │
└────────────────────────────────────────────────┘
```

### Marketplace
```
┌────────────────────────────────────────────────┐
│  ← Back to Home        Explore Courses         │
├────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │[Image] │  │[Image] │  │[Image] │          │
│  │Course 1│  │Course 2│  │Course 3│          │
│  │50 EP   │  │75 EP   │  │100 EP  │          │
│  │[View]  │  │[View]  │  │[View]  │          │
│  └────────┘  └────────┘  └────────┘          │
└────────────────────────────────────────────────┘
```

---

## 🛣️ Roadmap

### Phase 1 (Current) ✅
- [x] Core smart contracts
- [x] Token economy (SUITUDY)
- [x] Course marketplace
- [x] Basic UI
- [x] zkLogin integration

### Phase 2 (Q2 2025) 🚧
- [ ] Course reviews & ratings
- [ ] Instructor profiles
- [ ] Advanced search & filters
- [ ] Video hosting integration
- [ ] Certificate NFTs

### Phase 3 (Q3 2025) 📋
- [ ] Subscription models
- [ ] Live streaming classes
- [ ] DAO governance
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Phase 4 (Q4 2025) 🔮
- [ ] AI course recommendations
- [ ] Decentralized storage (Walrus)
- [ ] Cross-chain support
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Sui Foundation** - For the amazing blockchain platform
- **Mysten Labs** - For dApp Kit and Enoki zkLogin
- **Radix UI** - For beautiful React components
- **Move Language** - For secure smart contract development

---

## 📞 Contact & Support

- **Website**: https://suitudy.xyz (coming soon)
- **Twitter**: [@Suitudy](https://twitter.com/suitudy)
- **Discord**: [Join our community](https://discord.gg/suitudy)
- **Email**: support@suitudy.xyz

---

## ⚠️ Disclaimer

**Testnet Only**: This project is currently deployed on Sui Testnet for testing purposes. Do not use real funds or sensitive data.

**Educational Purpose**: This is a proof-of-concept project demonstrating decentralized education platforms on Sui blockchain.

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

Built with ❤️ on [Sui](https://sui.io) | Powered by [Move](https://move-language.github.io/)

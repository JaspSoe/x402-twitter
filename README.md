# x402-twitter

> The first x402-compliant payment protocol for Twitter bots on Solana

Build monetized Twitter bots in minutes with automatic micropayments.

## 🌟 Features

✅ **x402-compliant** - Standard payment protocol  
✅ **Automatic wallet creation** - Users get Solana wallets via Twitter  
✅ **Built-in payments** - Charge per command automatically  
✅ **0.1% protocol fee** - Sustainable & fair  
✅ **Simple API** - Build bots in minutes  
✅ **TypeScript support** - Full type safety  

## 📦 Installation
```bash
npm install x402-twitter
```

## 🚀 Quick Start
```typescript
import { X402Twitter } from 'x402-twitter';

const bot = new X402Twitter({
  twitterApiKey: process.env.TWITTER_API_KEY!,
  twitterApiSecret: process.env.TWITTER_API_SECRET!,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN!,
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET!,
  botUsername: 'YourBot',
  solanaRpcUrl: process.env.SOLANA_RPC_URL!,
  treasuryWallet: process.env.TREASURY_WALLET!,
});

// Free command
bot.onCommand('hello', async (username, command) => {
  return `👋 Hello @${username}!`;
});

// Paid command (0.001 SOL)
bot.onCommand('premium', async (username, command) => {
  return `✨ Premium feature unlocked!`;
}, 0.001);

bot.start();
```

## �� Monetization

Charge users per command with automatic x402 payments:
```typescript
// Free commands
bot.onCommand('help', handler);

// Paid commands
bot.onCommand('swap', handler, 0.001);      // 0.001 SOL
bot.onCommand('analysis', handler, 0.005);  // 0.005 SOL
bot.onCommand('premium', handler, 0.01);    // 0.01 SOL
```

## 🏗️ Use Cases

- **Trading bots** - Charge for trade signals
- **AI bots** - Monetize AI responses  
- **Tip bots** - Enable Solana tipping
- **NFT bots** - Sell NFTs via Twitter
- **Gaming bots** - In-game purchases

## 📖 Documentation

### Configuration
```typescript
interface X402Config {
  // Twitter API credentials
  twitterApiKey: string;
  twitterApiSecret: string;
  twitterAccessToken: string;
  twitterAccessSecret: string;
  botUsername: string;
  
  // Solana
  solanaRpcUrl: string;
  treasuryWallet: string;
  
  // Optional
  commandFees?: Record<string, number>;
  protocolFee?: number; // Default: 0.001 (0.1%)
}
```

### Commands

Register command handlers with optional fees:
```typescript
bot.onCommand(
  commandType: string,
  handler: (username: string, command: Command) => Promise<string>,
  fee?: number  // Fee in SOL
);
```

## 🔐 x402 Protocol

This package implements the x402 payment protocol for Twitter:

1. User mentions bot with command
2. Bot checks user balance
3. If insufficient, returns payment request
4. If sufficient, charges fee and executes
5. 0.1% goes to x402 protocol, rest to you

## 📝 License

MIT

## 🤝 Contributing

Built by [Stakefy](https://stakefy.io)

---

**Built with x402-twitter** 🚀

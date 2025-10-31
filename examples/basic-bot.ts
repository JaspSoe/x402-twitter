import { X402Twitter } from '../src/index';
import dotenv from 'dotenv';

dotenv.config();

// Create bot instance
const bot = new X402Twitter({
  twitterApiKey: process.env.TWITTER_API_KEY!,
  twitterApiSecret: process.env.TWITTER_API_SECRET!,
  twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN!,
  twitterAccessSecret: process.env.TWITTER_ACCESS_SECRET!,
  botUsername: process.env.BOT_USERNAME || 'TestBot',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  treasuryWallet: process.env.TREASURY_WALLET!,
});

// Free command
bot.onCommand('hello', async (username, command) => {
  return `👋 Hello @${username}! This is an x402-powered bot!`;
});

// Free command
bot.onCommand('help', async (username, command) => {
  return `📚 Available commands:
  
🆓 Free:
- hello - Say hello
- help - Show this message

💰 Paid (0.001 SOL):
- premium - Access premium feature

Built with x402-twitter 🚀`;
});

// Paid command (0.001 SOL)
bot.onCommand('premium', async (username, command) => {
  return `✨ Premium feature accessed!
  
You were charged 0.001 SOL (x402 protocol)`;
}, 0.001);

// Start the bot
bot.start();

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TwitterApi } from 'twitter-api-v2';

export interface X402Config {
  // Twitter
  twitterApiKey: string;
  twitterApiSecret: string;
  twitterAccessToken: string;
  twitterAccessSecret: string;
  botUsername: string;
  
  // Solana
  solanaRpcUrl: string;
  treasuryWallet: string;
  
  // Fees (in SOL)
  commandFees?: Record<string, number>;
  protocolFee?: number; // Default: 0.001 (0.1%)
}

export interface Command {
  type: string;
  params: string[];
  raw: string;
}

export type CommandHandler = (username: string, command: Command) => Promise<string>;

export class X402Twitter {
  private config: X402Config;
  private connection: Connection;
  private twitter: TwitterApi;
  private handlers: Map<string, { handler: CommandHandler; fee: number }> = new Map();
  private processedTweets: Set<string> = new Set();
  private lastTweetId: string | null = null;

  constructor(config: X402Config) {
    this.config = {
      protocolFee: 0.001,
      commandFees: {},
      ...config
    };
    
    this.connection = new Connection(config.solanaRpcUrl);
    
    this.twitter = new TwitterApi({
      appKey: config.twitterApiKey,
      appSecret: config.twitterApiSecret,
      accessToken: config.twitterAccessToken,
      accessSecret: config.twitterAccessSecret,
    });
  }

  /**
   * Register a command handler with optional fee
   */
  onCommand(commandType: string, handler: CommandHandler, fee: number = 0) {
    this.handlers.set(commandType, { handler, fee });
    console.log(`📝 Registered command: ${commandType} (fee: ${fee} SOL)`);
  }

  /**
   * Start the bot
   */
  async start() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║         x402-TWITTER BOT STARTING          ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    try {
      const me = await this.twitter.v2.me();
      console.log(`✅ Authenticated as @${me.data.username}`);
      console.log(`💰 Protocol fee: ${this.config.protocolFee! * 100}%`);
      console.log(`🔐 x402-compliant payments enabled`);
      console.log(`📝 ${this.handlers.size} commands registered\n`);
      console.log('🚀 Bot is now running! Checking mentions every 5 seconds...\n');

      // Start polling
      setInterval(() => this.checkMentions(), 5000);
      await this.checkMentions();
    } catch (error: any) {
      console.error('❌ Failed to start:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check for new mentions
   */
  private async checkMentions() {
    try {
      console.log(`[${new Date().toLocaleTimeString()}] 🔍 Checking mentions...`);
      
      const searchParams: any = {
        max_results: 10,
        'tweet.fields': ['created_at', 'author_id'],
        'user.fields': ['username'],
        expansions: ['author_id'],
      };

      if (this.lastTweetId) {
        searchParams.since_id = this.lastTweetId;
      }

      const mentions = await this.twitter.v2.search(
        `@${this.config.botUsername}`,
        searchParams
      );

      if (mentions.data.data && mentions.data.data.length > 0) {
        console.log(`📬 Found ${mentions.data.data.length} new mentions!\n`);
        
        this.lastTweetId = mentions.data.data[0].id;
        
        const users = mentions.data.includes?.users || [];
        const userMap = new Map(users.map(u => [u.id, u.username.toLowerCase()]));

        for (const tweet of mentions.data.data.reverse()) {
          const username = userMap.get(tweet.author_id!) || 'unknown';
          await this.processTweet(tweet.id, tweet.text, username);
        }
      } else {
        console.log('📭 No new mentions');
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
  }

  /**
   * Process a single tweet
   */
  private async processTweet(tweetId: string, text: string, username: string) {
    if (this.processedTweets.has(tweetId)) return;
    this.processedTweets.add(tweetId);

    console.log(`\n📨 @${username}: "${text}"`);

    const command = this.parseCommand(text);
    if (!command) {
      console.log('⏭️  Not a valid command\n');
      return;
    }

    console.log(`   Command: ${command.type}`);

    const handlerData = this.handlers.get(command.type);
    if (!handlerData) {
      await this.reply(tweetId, username, `❌ Unknown command: ${command.type}\n\nTry: help`);
      return;
    }

    try {
      const response = await handlerData.handler(username, command);
      await this.reply(tweetId, username, response);
      console.log(`✅ Replied\n`);
    } catch (error: any) {
      console.error(`❌ Error executing command:`, error.message);
      await this.reply(tweetId, username, `❌ Error: ${error.message}`);
    }
  }

  /**
   * Parse command from tweet
   */
  private parseCommand(text: string): Command | null {
    const cleaned = text.replace(`@${this.config.botUsername}`, '').trim();
    const parts = cleaned.split(/\s+/);
    
    if (parts.length === 0) return null;
    
    return {
      type: parts[0].toLowerCase(),
      params: parts.slice(1),
      raw: cleaned
    };
  }

  /**
   * Reply to a tweet
   */
  private async reply(tweetId: string, username: string, message: string) {
    try {
      await this.twitter.v2.reply(`@${username} ${message}`, tweetId);
    } catch (error: any) {
      console.error('❌ Failed to reply:', error.message);
    }
  }
}

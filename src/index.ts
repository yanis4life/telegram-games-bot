import { Env } from './types';
import { KvStore } from './db/kv';
import { DbStore } from './db/d1';
import { UserManager } from './user/manager';
import { GroupManager } from './group/manager';
import { PointsSystem } from './points/system';
import { ShopManager } from './shop/shop';
import { SessionManager } from './session/manager';
import { LeaderboardManager } from './leaderboard/manager';
import { SudoManager, AdminManager } from './admin/sudo';
import { AiService } from './ai/api';
import { TelegramApi } from './telegram';
import { CommandHandler } from './commands/handler';

let initialized = false;

async function initialize(db: DbStore | null): Promise<void> {
  if (initialized || !db) return;
  try {
    await db.initialize();
    initialized = true;
  } catch {
    console.error('D1 database initialization failed, continuing without DB');
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET') {
      return new Response('Bot is running!', { status: 200 });
    }

    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const tokenFromPath = pathParts[0] || '';

      const botToken = env.BOT_TOKEN || tokenFromPath;
      if (!botToken) {
        return new Response('BOT_TOKEN not configured', { status: 500 });
      }

      const telegram = new TelegramApi(botToken);
      const kv = new KvStore(env.STORAGE);
      const db = env.DB ? new DbStore(env.DB) : null;

      await initialize(db);

      const body: any = await request.json();
      const msg = body.message || body.callback_query?.message || {};
      const callbackQuery = body.callback_query;
      const text = msg.text || '';
      const chatId = msg.chat?.id || 0;
      const userId = msg.from?.id || 0;

      if (!chatId || !userId) {
        return new Response('OK', { status: 200 });
      }

      const userManager = new UserManager(kv, db);
      const groupManager = new GroupManager(kv, db);
      const pointsSystem = new PointsSystem(kv, userManager, groupManager);
      const shopManager = new ShopManager(kv);
      const sessionManager = new SessionManager(kv, env);
      const leaderboardManager = new LeaderboardManager(kv);
      const ai = new AiService(env.AI_API_ENDPOINT, env.AI_API_KEY || '');
      const sudoManager = new SudoManager(kv, db, userManager, pointsSystem, telegram, env);
      const adminManager = new AdminManager(kv, db, groupManager, sessionManager, telegram);
      const commandHandler = new CommandHandler(
        kv, db, userManager, groupManager, pointsSystem, shopManager,
        sessionManager, leaderboardManager, sudoManager, adminManager, ai, telegram, env
      );

      if (callbackQuery) {
        const cbData = callbackQuery.data || '';
        const cbId = callbackQuery.id || '';
        const cbChatId = callbackQuery.message?.chat?.id || 0;
        const cbUserId = callbackQuery.from?.id || 0;
        await telegram.answerCallbackQuery(cbId, 'جاري المعالجة...');
        const response = await commandHandler.handleCommand(cbChatId, cbUserId, cbData, [], callbackQuery.message);
        if (response) {
          await telegram.editMessageText(cbChatId, callbackQuery.message?.message_id || 0, response);
        }
        return new Response('OK', { status: 200 });
      }

      await handleGroupUpdates(kv, msg, groupManager);

      if (text.startsWith('/')) {
        const parts = text.slice(1).split(' ');
        const command = parts[0].toLowerCase().split('@')[0];
        const args = parts.slice(1);
        const response = await commandHandler.handleCommand(chatId, userId, command, args, msg);
        if (response) {
          await telegram.sendMessage(chatId, response);
        }
      } else {
        const response = await commandHandler.handleMessage(chatId, userId, text, msg);
        if (response) {
          await telegram.sendMessage(chatId, response);
        }
      }

      return new Response('OK', { status: 200 });
    } catch (e: any) {
      console.error('Error:', e.message, e.stack);
      return new Response('Error', { status: 500 });
    }
  },
};

async function handleGroupUpdates(kv: KvStore, msg: any, groupManager: GroupManager): Promise<void> {
  if (msg.left_chat_member) {
    const leftUserId = msg.left_chat_member.id;
    const groupId = msg.chat.id;
    const session = await kv.getSession(groupId);
    if (session) {
      const { SessionManager } = await import('./session/manager');
      const sm = new SessionManager(kv, {} as any);
      await sm.removePlayer(groupId, leftUserId);
    }
  }
  if (msg.new_chat_title) {
    await groupManager.updateGroupTitle(msg.chat.id, msg.new_chat_title);
  }
  if (msg.group_chat_created || msg.supergroup_chat_created) {
    await groupManager.getOrCreateGroup(msg.chat);
  }
  if (msg.migrate_to_chat_id) {
    const oldId = msg.chat.id;
    const newId = msg.migrate_to_chat_id;
    const oldGroup = await kv.getGroup(oldId);
    if (oldGroup) {
      oldGroup.id = newId;
      await kv.setGroup(oldGroup);
      await kv.deleteGroup(oldId);
    }
  }
}
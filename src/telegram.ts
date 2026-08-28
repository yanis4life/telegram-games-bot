import { ApiResponse } from '../types';

export class TelegramApi {
  private baseUrl: string;
  private botToken: string;

  constructor(botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
    this.botToken = botToken;
  }

  async call(method: string, body: Record<string, any> = {}): Promise<ApiResponse> {
    try {
      const resp = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await resp.json();
    } catch (e) {
      return { ok: false, description: 'Network error' };
    }
  }

  async sendMessage(chatId: number | string, text: string, opts: Record<string, any> = {}): Promise<ApiResponse> {
    return this.call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...opts });
  }

  async sendPhoto(chatId: number | string, photo: string, caption = '', opts: Record<string, any> = {}): Promise<ApiResponse> {
    return this.call('sendPhoto', { chat_id: chatId, photo, caption, parse_mode: 'HTML', ...opts });
  }

  async sendSticker(chatId: number | string, sticker: string): Promise<ApiResponse> {
    return this.call('sendSticker', { chat_id: chatId, sticker });
  }

  async editMessageText(chatId: number | string, messageId: number, text: string, opts: Record<string, any> = {}): Promise<ApiResponse> {
    return this.call('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML', ...opts });
  }

  async deleteMessage(chatId: number | string, messageId: number): Promise<ApiResponse> {
    return this.call('deleteMessage', { chat_id: chatId, message_id: messageId });
  }

  async answerCallbackQuery(callbackQueryId: string, text = '', showAlert = false): Promise<ApiResponse> {
    return this.call('answerCallbackQuery', { callback_query_id: callbackQueryId, text, show_alert: showAlert });
  }

  async getChatMember(chatId: number | string, userId: number): Promise<ApiResponse> {
    return this.call('getChatMember', { chat_id: chatId, user_id: userId });
  }

  async getChatAdministrators(chatId: number | string): Promise<ApiResponse> {
    return this.call('getChatAdministrators', { chat_id: chatId });
  }

  async setWebhook(url: string, secretToken = ''): Promise<ApiResponse> {
    const opts: Record<string, any> = { url };
    if (secretToken) opts.secret_token = secretToken;
    return this.call('setWebhook', opts);
  }

  async deleteWebhook(): Promise<ApiResponse> {
    return this.call('deleteWebhook');
  }

  async leaveChat(chatId: number | string): Promise<ApiResponse> {
    return this.call('leaveChat', { chat_id: chatId });
  }

  async getChat(chatId: number | string): Promise<ApiResponse> {
    return this.call('getChat', { chat_id: chatId });
  }

  isAdmin(status: string): boolean {
    return status === 'creator' || status === 'administrator';
  }

  isCreator(status: string): boolean {
    return status === 'creator';
  }
}
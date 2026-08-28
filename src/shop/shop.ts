import { KvStore } from '../db/kv';
import { PERKS } from '../config';
import { GroupUserData } from '../types';

export class ShopManager {
  private kv: KvStore;

  constructor(kv: KvStore) {
    this.kv = kv;
  }

  getPerks() {
    return PERKS;
  }

  getPerk(id: number) {
    return PERKS.find(p => p.id === id) || null;
  }

  async buyPerk(userId: number, groupId: number, perkId: number): Promise<{ success: boolean; error?: string }> {
    const perk = this.getPerk(perkId);
    if (!perk) return { success: false, error: 'perkNotFound' };
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (!gu) return { success: false, error: 'notRegistered' };
    if (gu.groupPoints < perk.price) return { success: false, error: 'insufficientPoints' };
    const currentUses = gu.perks[perkId] || 0;
    if (currentUses >= perk.maxUses) return { success: false, error: 'maxUses' };
    gu.groupPoints -= perk.price;
    gu.perks[perkId] = currentUses + 1;
    await this.kv.setGroupUser(gu);
    return { success: true };
  }

  async usePerk(userId: number, groupId: number, perkId: number): Promise<{ success: boolean; error?: string }> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (!gu) return { success: false, error: 'notRegistered' };
    const currentUses = gu.perks[perkId] || 0;
    if (currentUses <= 0) return { success: false, error: 'perkNotAvailable' };
    gu.perks[perkId] = currentUses - 1;
    await this.kv.setGroupUser(gu);
    return { success: true };
  }

  async getUserPerks(userId: number, groupId: number): Promise<{ id: number; name: string; uses: number }[]> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (!gu) return [];
    const result: { id: number; name: string; uses: number }[] = [];
    for (const [idStr, uses] of Object.entries(gu.perks)) {
      const id = parseInt(idStr);
      if (uses > 0) {
        const perk = this.getPerk(id);
        result.push({ id, name: perk?.name || 'Unknown', uses });
      }
    }
    return result;
  }

  hasPerk(userId: number, groupId: number, perkId: number): Promise<boolean> {
    return this.getUserPerks(userId, groupId).then(perks => perks.some(p => p.id === perkId));
  }
}
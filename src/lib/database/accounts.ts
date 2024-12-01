import { ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { DatabaseError } from './errors';
import type { PinterestAccount } from '@/types/pinterest';

export async function getAccount(userId: string, accountId: string): Promise<PinterestAccount | null> {
  try {
    const snapshot = await get(ref(database, `users/${userId}/accounts/${accountId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    throw new DatabaseError('Failed to fetch account', (error as Error).message);
  }
}

export async function saveAccount(userId: string, account: PinterestAccount): Promise<void> {
  try {
    await set(ref(database, `users/${userId}/accounts/${account.id}`), account);
  } catch (error) {
    throw new DatabaseError('Failed to save account', (error as Error).message);
  }
}

export async function removeAccount(userId: string, accountId: string): Promise<void> {
  try {
    await remove(ref(database, `users/${userId}/accounts/${accountId}`));
    await remove(ref(database, `users/${userId}/boards/${accountId}`));
  } catch (error) {
    throw new DatabaseError('Failed to remove account', (error as Error).message);
  }
}
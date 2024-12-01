import { ref, get, set } from 'firebase/database';
import { database } from '../firebase';
import { DatabaseError } from './errors';
import type { PinterestBoard } from '@/types/pinterest';

export async function saveBoards(
  userId: string, 
  accountId: string, 
  boards: PinterestBoard[]
): Promise<void> {
  try {
    await set(ref(database, `users/${userId}/boards/${accountId}`), boards);
  } catch (error) {
    throw new DatabaseError('Failed to save boards', (error as Error).message);
  }
}

export async function getBoards(
  userId: string, 
  accountId: string
): Promise<PinterestBoard[]> {
  try {
    const snapshot = await get(ref(database, `users/${userId}/boards/${accountId}`));
    return snapshot.exists() ? snapshot.val() : [];
  } catch (error) {
    throw new DatabaseError('Failed to fetch boards', (error as Error).message);
  }
}
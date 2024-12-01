import { ref, get, set, remove, query, orderByChild } from 'firebase/database';
import { database } from './firebase';
import type { PinterestAccount, PinterestBoard, ScheduledPin } from '@/types/pinterest';

export class DatabaseError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

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

export async function schedulePin(userId: string, pin: ScheduledPin): Promise<void> {
  try {
    await set(ref(database, `users/${userId}/scheduled_pins/${pin.id}`), pin);
  } catch (error) {
    throw new DatabaseError('Failed to schedule pin', (error as Error).message);
  }
}

export async function getScheduledPins(userId: string): Promise<ScheduledPin[]> {
  try {
    const pinsRef = ref(database, `users/${userId}/scheduled_pins`);
    const pinsQuery = query(pinsRef, orderByChild('scheduledTime'));
    const snapshot = await get(pinsQuery);
    
    const pins: ScheduledPin[] = [];
    snapshot.forEach((childSnapshot) => {
      pins.push({
        id: childSnapshot.key as string,
        ...childSnapshot.val(),
      });
    });
    
    return pins;
  } catch (error) {
    throw new DatabaseError('Failed to fetch scheduled pins', (error as Error).message);
  }
}

export async function removeScheduledPin(userId: string, pinId: string): Promise<void> {
  try {
    await remove(ref(database, `users/${userId}/scheduled_pins/${pinId}`));
  } catch (error) {
    throw new DatabaseError('Failed to remove scheduled pin', (error as Error).message);
  }
}

export async function updatePinStatus(
  userId: string, 
  pinId: string, 
  status: ScheduledPin['status']
): Promise<void> {
  try {
    await set(ref(database, `users/${userId}/scheduled_pins/${pinId}/status`), status);
  } catch (error) {
    throw new DatabaseError('Failed to update pin status', (error as Error).message);
  }
}
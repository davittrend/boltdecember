import { ref, get, set, remove, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';
import { DatabaseError } from './errors';
import type { ScheduledPin } from '@/types/pinterest';

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
import { auth } from '@/lib/firebase';
import type { ScheduledPin } from '@/types/pinterest';

export async function schedulePin(pin: ScheduledPin): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await fetch('/.netlify/functions/pin-scheduler', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`,
    },
    body: JSON.stringify([pin]),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to schedule pin');
  }
}

export async function getScheduledPins(userId: string): Promise<ScheduledPin[]> {
  const response = await fetch('/.netlify/functions/pin-scheduler', {
    headers: {
      'Authorization': `Bearer ${userId}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch scheduled pins');
  }

  const { pins } = await response.json();
  return pins;
}

export async function deleteScheduledPin(userId: string, pinId: string): Promise<void> {
  const response = await fetch('/.netlify/functions/pin-scheduler', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`,
    },
    body: JSON.stringify({ pinId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete scheduled pin');
  }
}
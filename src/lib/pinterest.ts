import { auth } from './firebase';
import { saveAccount, saveBoards } from './database';
import { env } from './config/env';
import type { PinterestBoard, PinterestToken, PinterestUser, ScheduledPin } from '@/types/pinterest';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/callback`
  : '';

export async function getPinterestAuthUrl() {
  const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
  const state = crypto.randomUUID();
  const redirectUri = encodeURIComponent(REDIRECT_URI);
  return `https://www.pinterest.com/oauth/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
}

export async function exchangePinterestCode(code: string): Promise<{ token: PinterestToken; user: PinterestUser }> {
  const response = await fetch('/.netlify/functions/pinterest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      code, 
      redirectUri: REDIRECT_URI,
      clientId: env.VITE_PINTEREST_CLIENT_ID,
      clientSecret: env.VITE_PINTEREST_CLIENT_SECRET
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Pinterest token exchange failed:', error);
    throw new Error(error.message || 'Failed to exchange Pinterest code');
  }

  return response.json();
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const response = await fetch(`${PINTEREST_API_URL}/boards`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch Pinterest boards:', error);
    throw new Error(error.message || 'Failed to fetch boards');
  }

  const data = await response.json();
  return data.items || [];
}

export async function connectPinterestAccount(code: string): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('No authenticated user found');
    throw new Error('User not authenticated');
  }

  console.log('Starting Pinterest account connection process');

  try {
    // Exchange code for token and user data
    const { token, user } = await exchangePinterestCode(code);
    console.log('Successfully exchanged Pinterest code for token');

    // Create new account object
    const newAccount = {
      id: user.username,
      user,
      token,
      lastRefreshed: Date.now(),
    };

    // Save account
    await saveAccount(userId, newAccount);
    console.log('Saved Pinterest account to database');

    // Fetch and save boards
    const boards = await fetchPinterestBoards(token.access_token);
    await saveBoards(userId, newAccount.id, boards);
    console.log('Saved Pinterest boards to database');
  } catch (error) {
    console.error('Failed to connect Pinterest account:', error);
    throw error;
  }
}

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
import { auth } from '@/lib/firebase';
import { saveAccount, saveBoards } from '@/lib/database';
import { exchangePinterestCode, fetchPinterestBoards } from './api';

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
import type { PinterestBoard, PinterestToken, PinterestUser } from '@/types/pinterest';
import { env } from '@/lib/config/env';

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
  // Use the Netlify function instead of direct API call to avoid CORS
  const response = await fetch('/.netlify/functions/pinterest', {
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch Pinterest boards:', error);
    throw new Error(error.message || 'Failed to fetch boards');
  }

  return response.json();
}

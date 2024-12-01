import type { PinterestBoard, PinterestToken, PinterestUser } from '@/types/pinterest';
import { env } from '@/lib/config/env';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';
const REDIRECT_URI = `${window.location.origin}/callback`;

export function getPinterestAuthUrl(): string {
  const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
  const state = crypto.randomUUID();
  const redirectUri = encodeURIComponent(REDIRECT_URI);
  
  return `https://www.pinterest.com/oauth/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
}

export async function exchangePinterestCode(code: string): Promise<{ token: PinterestToken; user: PinterestUser }> {
  const response = await fetch('/.netlify/functions/pinterest/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      code, 
      redirectUri: REDIRECT_URI,
      clientId: env.VITE_PINTEREST_CLIENT_ID,
      clientSecret: env.VITE_PINTEREST_CLIENT_SECRET
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to exchange Pinterest code');
  }

  return data;
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const response = await fetch('/.netlify/functions/pinterest/boards', {
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch boards');
  }

  return data.items || [];
}

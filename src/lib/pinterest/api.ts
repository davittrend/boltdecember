import type { PinterestBoard, PinterestToken, PinterestUser } from '@/types/pinterest';
import { env } from '@/lib/config/env';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';
const REDIRECT_URI = `${window.location.origin}/callback`;

export function getPinterestAuthUrl(): string {
  const scope = 'boards:read,pins:read,pins:write,user_accounts:read,boards:write';
  const state = crypto.randomUUID();
  const redirectUri = encodeURIComponent(REDIRECT_URI);
  
  // Use the sandbox OAuth endpoint
  return `https://api-sandbox.pinterest.com/oauth/?client_id=${env.VITE_PINTEREST_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
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

  if (!response.ok) {
    const error = await response.json();
    console.error('Pinterest token exchange failed:', error);
    throw new Error(error.error || 'Failed to exchange Pinterest code');
  }

  return response.json();
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const response = await fetch('/.netlify/functions/pinterest/boards', {
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to fetch Pinterest boards:', error);
    throw new Error(error.error || 'Failed to fetch boards');
  }

  const data = await response.json();
  return data.items || [];
}

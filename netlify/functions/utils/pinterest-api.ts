import fetch from 'node-fetch';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export async function exchangeCodeForToken(code: string, redirectUri: string, clientId: string, clientSecret: string) {
  console.log('Exchanging code for token with Pinterest API...', { redirectUri });
  
  const response = await fetch(`${PINTEREST_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Pinterest token exchange error:', data);
    throw new Error(data.error_description || data.error || 'Token exchange failed');
  }

  return data;
}

export async function refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
  console.log('Refreshing token with Pinterest API...');
  
  const response = await fetch(`${PINTEREST_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Pinterest token refresh error:', data);
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }

  return data;
}

export async function fetchUserAccount(accessToken: string) {
  console.log('Fetching user account from Pinterest API...');
  
  const response = await fetch(`${PINTEREST_API_URL}/user_account`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Pinterest user account fetch error:', data);
    throw new Error(data.message || 'Failed to fetch user data');
  }

  return data;
}

export async function fetchBoards(accessToken: string) {
  console.log('Fetching boards from Pinterest API...');
  
  const response = await fetch(`${PINTEREST_API_URL}/boards`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Pinterest boards fetch error:', data);
    throw new Error(data.message || 'Failed to fetch boards');
  }

  return data.items || [];
}
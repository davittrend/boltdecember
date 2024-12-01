import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers,
      body: '' 
    };
  }

  try {
    const { code, redirectUri, clientId, clientSecret } = JSON.parse(event.body || '{}');

    if (!code || !redirectUri || !clientId || !clientSecret) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Exchange code for token using sandbox endpoint
    const tokenResponse = await fetch(`${PINTEREST_API_URL}/oauth/token`, {
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

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return {
        statusCode: tokenResponse.status,
        headers,
        body: JSON.stringify({ error: tokenData.message || 'Token exchange failed' }),
      };
    }

    // Fetch user data from sandbox API
    const userResponse = await fetch(`${PINTEREST_API_URL}/user_account`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error('User data fetch failed:', userData);
      return {
        statusCode: userResponse.status,
        headers,
        body: JSON.stringify({ error: userData.message || 'Failed to fetch user data' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: tokenData,
        user: userData,
      }),
    };
  } catch (error) {
    console.error('Pinterest API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

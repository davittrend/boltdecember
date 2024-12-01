import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'POST') {
      const { code, redirectUri, clientId, clientSecret } = JSON.parse(event.body || '{}');

      if (!clientId || !clientSecret) {
        throw new Error('Pinterest credentials not configured');
      }

      // Handle token exchange
      if (code && redirectUri) {
        console.log('Exchanging code for token...', { redirectUri });
        
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
          throw new Error(tokenData.error_description || 'Token exchange failed');
        }

        // Fetch user data
        const userResponse = await fetch(`${PINTEREST_API_URL}/user_account`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const userData = await userResponse.json();
        
        if (!userResponse.ok) {
          console.error('User data fetch failed:', userData);
          throw new Error(userData.message || 'Failed to fetch user data');
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token: tokenData,
            user: userData,
          }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request' }),
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
}
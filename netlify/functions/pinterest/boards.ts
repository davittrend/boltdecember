import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers,
      body: '' 
    };
  }

  try {
    const accessToken = event.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No access token provided' }),
      };
    }

    // Fetch boards from sandbox API
    const response = await fetch(`${PINTEREST_API_URL}/boards`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Pinterest API Error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.message || 'Failed to fetch boards' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
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

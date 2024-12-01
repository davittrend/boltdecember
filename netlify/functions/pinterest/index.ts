import { Handler } from '@netlify/functions';
import { handler as authHandler } from './auth';
import { handler as boardsHandler } from './boards';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers,
      body: '' 
    };
  }

  // Extract the endpoint from the path
  const path = event.path.replace('/.netlify/functions/pinterest/', '');

  // Route requests to appropriate handlers
  switch (path) {
    case 'auth':
      return authHandler(event);
    case 'boards':
      return boardsHandler(event);
    default:
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Not found' }),
      };
  }
};

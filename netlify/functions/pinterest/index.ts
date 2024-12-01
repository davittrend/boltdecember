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

  // Route requests to appropriate handlers
  if (event.path.endsWith('/auth')) {
    return authHandler(event);
  }
  
  if (event.path.endsWith('/boards')) {
    return boardsHandler(event);
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found' }),
  };
};

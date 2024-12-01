import { Handler } from '@netlify/functions';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const PINTEREST_API_URL = 'https://api-sandbox.pinterest.com/v5';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const database = getDatabase();

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const userId = event.headers.authorization?.split(' ')[1];
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const { pinId } = JSON.parse(event.body || '{}');

    // Get pin data from Firebase
    const pinSnapshot = await database
      .ref(`users/${userId}/scheduled_pins/${pinId}`)
      .once('value');
    
    const pin = pinSnapshot.val();
    if (!pin) {
      throw new Error('Pin not found');
    }

    // Get account data from Firebase
    const accountSnapshot = await database
      .ref(`users/${userId}/accounts/${pin.accountId}`)
      .once('value');
    
    const account = accountSnapshot.val();
    if (!account) {
      throw new Error('Account not found');
    }

    // Create pin on Pinterest
    const response = await fetch(`${PINTEREST_API_URL}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: pin.boardId,
        title: pin.title,
        description: pin.description,
        link: pin.link,
        media_source: {
          source_type: 'image_url',
          url: pin.imageUrl,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create pin');
    }

    const pinterestPin = await response.json();

    // Update pin status in Firebase
    await database
      .ref(`users/${userId}/scheduled_pins/${pinId}`)
      .update({
        status: 'published',
        pinterestId: pinterestPin.id,
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, pin: pinterestPin }),
    };
  } catch (error) {
    console.error('Error publishing pin:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};
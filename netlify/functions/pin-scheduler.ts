import { Handler } from '@netlify/functions';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import type { ScheduledPin } from '../../src/types/pinterest';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
  });
}

const database = getDatabase();

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
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

    const pinsRef = database.ref(`users/${userId}/scheduled_pins`);

    switch (event.httpMethod) {
      case 'GET': {
        const snapshot = await pinsRef.orderByChild('scheduledTime').once('value');
        const pins: ScheduledPin[] = [];
        
        snapshot.forEach((childSnapshot) => {
          pins.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ pins }),
        };
      }

      case 'POST': {
        const pins = JSON.parse(event.body || '[]') as ScheduledPin[];
        const updates: Record<string, any> = {};
        
        pins.forEach((pin) => {
          updates[pin.id] = pin;
        });

        await pinsRef.update(updates);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      case 'DELETE': {
        const { pinId } = JSON.parse(event.body || '{}');
        
        if (!pinId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Pin ID required' }),
          };
        }

        await pinsRef.child(pinId).remove();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Pin scheduler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};
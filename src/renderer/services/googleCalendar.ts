// Google Calendar API Integration
// Requires OAuth2 Authentication

import type { Task } from '@/shared/types';

// Google Calendar API Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let gapiInited = false;
let gisInited = false;
let tokenClient: any;

/**
 * Initialisiert Google API und OAuth2
 */
export const initGoogleCalendar = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Prüfen ob Google APIs verfügbar sind
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      reject(new Error('Google API Credentials fehlen. Bitte VITE_GOOGLE_CLIENT_ID und VITE_GOOGLE_API_KEY in .env setzen.'));
      return;
    }

    // Load Google API Script
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/api.js';
    script1.onload = () => {
      (window as any).gapi.load('client', async () => {
        await (window as any).gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      });
    };
    document.body.appendChild(script1);

    // Load Google Identity Services Script
    const script2 = document.createElement('script');
    script2.src = 'https://accounts.google.com/gsi/client';
    script2.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: '', // wird später gesetzt
      });
      gisInited = true;
      maybeEnableButtons();
    };
    document.body.appendChild(script2);

    function maybeEnableButtons() {
      if (gapiInited && gisInited) {
        resolve();
      }
    }
  });
};

/**
 * OAuth2 Login für Google Calendar
 */
export const loginGoogleCalendar = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      resolve();
    };

    if ((window as any).gapi.client.getToken() === null) {
      // Prompt user to select a Google Account and consent
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

/**
 * Logout von Google Calendar
 */
export const logoutGoogleCalendar = () => {
  const token = (window as any).gapi.client.getToken();
  if (token !== null) {
    (window as any).google.accounts.oauth2.revoke(token.access_token);
    (window as any).gapi.client.setToken('');
  }
};

/**
 * Task zu Google Calendar hinzufügen
 */
export const addTaskToGoogleCalendar = async (task: Task): Promise<string> => {
  try {
    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      },
      end: {
        date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 Tag vorher
          { method: 'popup', minutes: 30 },
        ],
      },
      extendedProperties: {
        private: {
          gurktaler_task_id: task.id,
          gurktaler_priority: task.priority,
          gurktaler_assignee: task.assignee || '',
        },
      },
    };

    const request = await (window as any).gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return request.result.id;
  } catch (error) {
    console.error('Fehler beim Hinzufügen zu Google Calendar:', error);
    throw error;
  }
};

/**
 * Alle Tasks zu Google Calendar synchronisieren
 */
export const syncAllTasksToGoogleCalendar = async (tasks: Task[]): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const task of tasks) {
    // Nur offene Tasks mit Due Date synchronisieren
    if (task.status !== 'completed' && task.due_date) {
      try {
        await addTaskToGoogleCalendar(task);
        success++;
      } catch (error) {
        failed++;
        console.error(`Task "${task.title}" konnte nicht synchronisiert werden:`, error);
      }
    }
  }

  return { success, failed };
};

/**
 * Task in Google Calendar aktualisieren
 */
export const updateTaskInGoogleCalendar = async (
  googleEventId: string,
  task: Task
): Promise<void> => {
  try {
    const event = {
      summary: task.title,
      description: task.description || '',
      start: {
        date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      },
      end: {
        date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      },
      status: task.status === 'completed' ? 'confirmed' : 'tentative',
    };

    await (window as any).gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      resource: event,
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren in Google Calendar:', error);
    throw error;
  }
};

/**
 * Task aus Google Calendar löschen
 */
export const deleteTaskFromGoogleCalendar = async (googleEventId: string): Promise<void> => {
  try {
    await (window as any).gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: googleEventId,
    });
  } catch (error) {
    console.error('Fehler beim Löschen aus Google Calendar:', error);
    throw error;
  }
};

/**
 * Prüft ob User eingeloggt ist
 */
export const isGoogleCalendarLoggedIn = (): boolean => {
  if (!(window as any).gapi || !(window as any).gapi.client) return false;
  return (window as any).gapi.client.getToken() !== null;
};

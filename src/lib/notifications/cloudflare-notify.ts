/**
 * Send a form submission notification via the Cloudflare Worker.
 *
 * This is a fire-and-forget call — it won't block the API response.
 * The Worker handles sending email notifications to Deke and Denis
 * using Cloudflare's native Email Routing (no external services).
 */

const WORKER_URL = process.env.CF_NOTIFICATION_WORKER_URL;
const WEBHOOK_SECRET = process.env.CF_NOTIFICATION_SECRET;

export interface FormNotificationData {
  type: 'booking_request' | 'contact' | 'group_request';
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  serviceType?: string;
  eventDate?: string | null;
  location?: string | null;
  budget?: string | null;
  message?: string | null;
}

export async function sendCloudflareNotification(
  data: FormNotificationData
): Promise<{ success: boolean; error?: string }> {
  if (!WORKER_URL || !WEBHOOK_SECRET) {
    console.warn(
      'Cloudflare notification not configured — set CF_NOTIFICATION_WORKER_URL and CF_NOTIFICATION_SECRET'
    );
    return { success: false, error: 'Not configured' };
  }

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Cloudflare notification failed:', response.status, errorBody);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();
    console.log('Cloudflare notification sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Cloudflare notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

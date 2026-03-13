import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sendCloudflareNotification } from '@/lib/notifications/cloudflare-notify'

/**
 * GET /api/notifications/debug?secret=<DEBUG_SECRET>
 *
 * Diagnostic endpoint to verify notification configuration and test delivery.
 * Returns which env vars are set and attempts test sends via both channels.
 */
export async function GET(request: NextRequest) {
  // Gate behind a secret to prevent abuse
  const secret = request.nextUrl.searchParams.get('secret')
  const debugSecret = process.env.DEBUG_SECRET

  if (!debugSecret) {
    return NextResponse.json(
      { error: 'DEBUG_SECRET env var not set — add it to Railway to use this endpoint' },
      { status: 503 }
    )
  }

  if (secret !== debugSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL
  const bookingEmails = process.env.BOOKING_NOTIFICATION_EMAILS
  const cfWorkerUrl = process.env.CF_NOTIFICATION_WORKER_URL
  const cfSecret = process.env.CF_NOTIFICATION_SECRET

  // 1. Report env var status
  const envVars = {
    RESEND_API_KEY: !!resendApiKey,
    RESEND_FROM_EMAIL: resendFromEmail || null,
    BOOKING_NOTIFICATION_EMAILS: bookingEmails || '(using default: deke@dekesharon.com,denis@theagentfactory.ai)',
    CF_NOTIFICATION_WORKER_URL: !!cfWorkerUrl,
    CF_NOTIFICATION_SECRET: !!cfSecret,
    NODE_ENV: process.env.NODE_ENV || 'not set',
  }

  // 2. Test Resend
  let resendTest: { success: boolean; emailId?: string; error?: string }
  if (!resendApiKey || !resendFromEmail) {
    resendTest = {
      success: false,
      error: `Missing: ${[!resendApiKey && 'RESEND_API_KEY', !resendFromEmail && 'RESEND_FROM_EMAIL'].filter(Boolean).join(', ')}`,
    }
  } else {
    try {
      const resend = new Resend(resendApiKey)
      const recipients = (bookingEmails || 'deke@dekesharon.com,denis@theagentfactory.ai')
        .split(',')
        .map((e: string) => e.trim())
        .filter(Boolean)

      const result = await resend.emails.send({
        from: resendFromEmail,
        to: recipients,
        subject: 'Notification Debug Test — Deke Sharon Website',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Notification System Debug Test</h2>
            <p>This is an automated test from the <code>/api/notifications/debug</code> endpoint.</p>
            <p>If you received this, <strong>Resend email delivery is working correctly.</strong></p>
            <p style="color: #888; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
          </div>
        `,
        tags: [{ name: 'type', value: 'debug_test' }],
      })

      if (result.error) {
        resendTest = { success: false, error: result.error.message }
      } else {
        resendTest = { success: true, emailId: result.data?.id }
      }
    } catch (error) {
      resendTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // 3. Test Cloudflare Worker
  let cloudflareTest: { success: boolean; error?: string }
  try {
    const cfResult = await sendCloudflareNotification({
      type: 'contact',
      name: 'Debug Test',
      email: 'debug@test.local',
      message: `Diagnostic test at ${new Date().toISOString()}`,
    })
    cloudflareTest = cfResult
  } catch (error) {
    cloudflareTest = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    envVars,
    resendTest,
    cloudflareTest,
  })
}

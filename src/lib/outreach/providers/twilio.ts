import twilio from 'twilio'

export interface SendSMSParams {
  to: string
  body: string
  campaignId: string
  leadId: string
}

export interface SMSResponse {
  id: string
  success: boolean
  error?: string
}

/**
 * Get or create Twilio client instance
 * Lazy initialization to avoid build-time errors
 */
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required')
  }

  return twilio(accountSid, authToken)
}

/**
 * Send an SMS via Twilio with opt-out message
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  try {
    const client = getTwilioClient()
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    if (!fromPhone) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable is not set')
    }

    // Append opt-out message to comply with regulations
    const bodyWithOptOut = `${params.body}\n\nReply STOP to unsubscribe`

    const message = await client.messages.create({
      from: fromPhone,
      to: params.to,
      body: bodyWithOptOut,
    })

    return {
      id: message.sid,
      success: message.status !== 'failed' && message.status !== 'undelivered',
      error: message.errorMessage || undefined,
    }
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

import { Resend } from 'resend'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  campaignId: string
  leadId: string
}

export interface EmailResponse {
  id: string
  success: boolean
  error?: string
}

/**
 * Get or create Resend client instance
 * Lazy initialization to avoid build-time errors
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required')
  }

  return new Resend(apiKey)
}

/**
 * Send an email via Resend with campaign tracking tags
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResponse> {
  try {
    const resend = getResendClient()
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not set')
    }

    const response = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
      tags: [
        {
          name: 'campaignId',
          value: params.campaignId,
        },
        {
          name: 'leadId',
          value: params.leadId,
        },
        {
          name: 'channel',
          value: 'email',
        },
      ],
    })

    if (response.error) {
      return {
        id: '',
        success: false,
        error: response.error.message,
      }
    }

    return {
      id: response.data?.id || '',
      success: true,
    }
  } catch (error) {
    return {
      id: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

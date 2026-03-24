interface NewsletterIssueData {
  issueNumber: number
  title: string
  subject: string | null
  storyContent: string | null
  craftContent: string | null
  communityContent: string | null
  noteContent: string | null
}

function contentToHtml(content: string | null): string {
  if (!content) return ''
  return content
    .split(/\n\n+/)
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;color:#D4D4D8;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

function sectionBlock(label: string, content: string | null, accentColor: string): string {
  if (!content?.trim()) return ''
  return `
    <tr>
      <td style="padding:40px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-bottom:20px;">
              <div style="display:inline-block;background:${accentColor}15;padding:6px 14px;border-left:3px solid ${accentColor};">
                <span style="font-family:'Georgia',serif;font-size:11px;font-weight:600;letter-spacing:2px;color:${accentColor};text-transform:uppercase;">
                  ${label}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:16px;">
              ${contentToHtml(content)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

export function buildNewsletterEmail(issue: NewsletterIssueData, unsubscribeUrl: string): string {
  const accent = '#C9943A'
  const bgDark = '#0D1117'
  const bgSection = '#141C26'
  const textMuted = '#7A8A9A'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${issue.subject || issue.title}</title>
</head>
<body style="margin:0;padding:0;background-color:${bgDark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bgDark};">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${bgSection};border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${bgDark} 0%,#1a1a2e 100%);padding:48px 40px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <div style="display:inline-flex;align-items:center;gap:12px;">
                      <span style="display:inline-block;width:40px;height:1px;background:${accent}40;"></span>
                      <span style="font-family:'Georgia',serif;font-size:11px;font-weight:600;letter-spacing:3px;color:${accent};text-transform:uppercase;">
                        A Monthly Letter from Deke Sharon
                      </span>
                      <span style="display:inline-block;width:40px;height:1px;background:${accent}40;"></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-family:'Georgia',serif;font-size:32px;font-weight:600;color:#FFFFFF;line-height:1.2;">
                      ${issue.title}
                    </h1>
                  </td>
                </tr>
                ${issue.subject && issue.subject !== issue.title ? `
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;font-size:16px;color:${textMuted};line-height:1.5;">
                      ${issue.subject}
                    </p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${accent},transparent);"></div>
            </td>
          </tr>

          <!-- Content sections -->
          ${sectionBlock('The Story', issue.storyContent, accent)}
          ${sectionBlock('The Craft', issue.craftContent, '#5B8DEF')}
          ${sectionBlock('The Community', issue.communityContent, '#4ADE80')}
          ${sectionBlock('The Note', issue.noteContent, '#A78BFA')}

          <!-- Sign-off -->
          <tr>
            <td style="padding:40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <div style="display:inline-block;width:40px;height:2px;background:${accent};border-radius:1px;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-family:'Georgia',serif;font-size:16px;color:${textMuted};font-style:italic;">
                      Keep singing,
                    </p>
                    <p style="margin:8px 0 0;font-family:'Georgia',serif;font-size:18px;color:#FFFFFF;font-weight:600;">
                      Deke
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${bgDark};padding:24px 40px;border-top:1px solid #1E2A38;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:12px;color:#4A5A6A;">
                      The Arrangement by Deke Sharon &middot;
                      <a href="https://dekesharon.com" style="color:${accent};text-decoration:none;">dekesharon.com</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#3A4A5A;">
                      <a href="${unsubscribeUrl}" style="color:#4A5A6A;text-decoration:underline;">Unsubscribe</a>
                      &nbsp;&middot;&nbsp; You received this because you subscribed to The Arrangement newsletter.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

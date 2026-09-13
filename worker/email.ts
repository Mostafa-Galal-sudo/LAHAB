import type { Env } from './types';

interface SendEmailParams {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}

// BUG FIX (Cloudflare migration): the old server used Nodemailer over raw SMTP
// sockets. Cloudflare Workers don't support raw TCP, so SMTP libraries can't
// run here at all. Resend's HTTP API (fetch-based) is the current standard
// replacement for transactional email on Workers - see:
// https://resend.com/docs/send-with-cloudflare-workers
//
// Setup required: create a free Resend account, verify a sending domain (or
// use their onboarding domain for testing), then:
//   wrangler secret put RESEND_API_KEY
export async function sendEmail(env: Env, params: SendEmailParams): Promise<'sent' | 'not_configured' | 'failed'> {
  if (!env.RESEND_API_KEY) {
    console.log(`[LAHAB Worker] RESEND_API_KEY not set - email not sent. Subject: ${params.subject}`);
    return 'not_configured';
  }

  const fromAddress = env.EMAIL_FROM || 'LΛHΛB Atelier <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[LAHAB Worker] Resend API error:', response.status, errorBody);
      return 'failed';
    }

    return 'sent';
  } catch (err) {
    console.error('[LAHAB Worker] Failed to reach Resend API:', err);
    return 'failed';
  }
}

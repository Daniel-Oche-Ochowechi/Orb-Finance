import fs from 'fs';
import path from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import {
  renderWaitlistConfirmationEmail,
  WaitlistEmailParams,
} from './waitlistTemplate';
import {
  renderAdminOtpEmail,
  AdminOtpEmailParams,
} from './adminOtpTemplate';

export type EmailProvider = 'resend' | 'smtp' | 'none';

export type EmailDeliveryStatus =
  | 'sent'
  | 'skipped_duplicate'
  | 'not_configured'
  | 'failed';

export interface SendEmailResult {
  sent: boolean;
  status: EmailDeliveryStatus;
  provider?: 'resend' | 'smtp';
  messageId?: string;
  error?: string;
}

interface InlineLogoAsset {
  filename: string;
  contentId: string;
  content: Buffer;
}

interface EmailDispatchPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  inlineAssets?: InlineLogoAsset[];
}

let cachedSmtpKey: string | null = null;
let cachedTransporter: Transporter | null = null;

function isPlaceholderValue(val: string | undefined): boolean {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized.includes('your_') ||
    normalized.includes('xxxxxxxx') ||
    normalized === 're_example'
  );
}

export function getConfiguredEmailProvider(): EmailProvider {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!isPlaceholderValue(resendKey)) {
    return 'resend';
  }

  const smtpUrl = process.env.SMTP_URL?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  if (!isPlaceholderValue(smtpUrl) || !isPlaceholderValue(smtpHost)) {
    return 'smtp';
  }

  return 'none';
}

export function isEmailConfigured(): boolean {
  return getConfiguredEmailProvider() !== 'none';
}

function resolveSenderAddresses(provider: EmailProvider): {
  from: string;
  replyTo: string;
} {
  const envFrom = process.env.EMAIL_FROM?.trim();
  const envReplyTo = process.env.EMAIL_REPLY_TO?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();

  let from = 'Orb Finance <hello@orbfinance.co>';
  if (envFrom && !isPlaceholderValue(envFrom)) {
    from = envFrom;
  } else if (provider === 'smtp' && smtpUser && smtpUser.includes('@')) {
    from = `Orb Finance <${smtpUser}>`;
  }

  let replyTo = 'hello@orbfinance.co';
  if (envReplyTo && !isPlaceholderValue(envReplyTo)) {
    replyTo = envReplyTo;
  } else if (provider === 'smtp' && smtpUser && smtpUser.includes('@')) {
    replyTo = smtpUser;
  }

  return { from, replyTo };
}

function loadInlineLogoAssets(): InlineLogoAsset[] {
  const candidates: Array<{ file: string; contentId: string }> = [
    { file: 'orb-logo-white.png', contentId: 'orb-logo-white' },
    { file: 'orb-logo-black.png', contentId: 'orb-logo-black' },
  ];

  const assets: InlineLogoAsset[] = [];
  for (const item of candidates) {
    try {
      const fullPath = path.join(process.cwd(), 'public', 'images', item.file);
      if (fs.existsSync(fullPath)) {
        assets.push({
          filename: item.file,
          contentId: item.contentId,
          content: fs.readFileSync(fullPath),
        });
      }
    } catch {
      // Fall back gracefully if filesystem logo assets cannot be read
    }
  }
  return assets;
}

function getSmtpTransporter(): Transporter {
  const smtpUrl = process.env.SMTP_URL?.trim();
  const host = process.env.SMTP_HOST?.trim() || '';
  const port = Number(process.env.SMTP_PORT || '587');
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === 'true' ? true : secureEnv === 'false' ? false : port === 465;
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS?.trim() || '';

  const cacheKey = smtpUrl
    ? `url:${smtpUrl}`
    : `${host}:${port}:${secure}:${user}:${pass ? 'auth' : 'noauth'}`;

  if (cachedTransporter && cachedSmtpKey === cacheKey) {
    return cachedTransporter;
  }

  const baseTimeouts = {
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  };

  cachedTransporter = smtpUrl
    ? nodemailer.createTransport({ url: smtpUrl, ...baseTimeouts })
    : nodemailer.createTransport({
        host,
        port,
        secure,
        ...(user && pass ? { auth: { user, pass } } : {}),
        ...baseTimeouts,
      });

  cachedSmtpKey = cacheKey;
  return cachedTransporter;
}

async function sendViaResend(
  payload: EmailDispatchPayload,
  from: string,
  replyTo: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, status: 'not_configured', error: 'Missing RESEND_API_KEY' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        reply_to: payload.replyTo || replyTo,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.inlineAssets && payload.inlineAssets.length > 0
          ? {
              attachments: payload.inlineAssets.map((asset) => ({
                filename: asset.filename,
                content: asset.content.toString('base64'),
                content_type: 'image/png',
                content_id: asset.contentId,
              })),
            }
          : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const reason =
        (typeof result?.message === 'string' && result.message) ||
        (typeof result?.error === 'string' && result.error) ||
        `Resend API responded with HTTP ${response.status}`;
      return {
        sent: false,
        status: 'failed',
        provider: 'resend',
        error: reason,
      };
    }

    return {
      sent: true,
      status: 'sent',
      provider: 'resend',
      messageId: typeof result?.id === 'string' ? result.id : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Resend request failed';
    return {
      sent: false,
      status: 'failed',
      provider: 'resend',
      error: msg,
    };
  }
}

async function sendViaSmtp(
  payload: EmailDispatchPayload,
  from: string,
  replyTo: string
): Promise<SendEmailResult> {
  try {
    const transporter = getSmtpTransporter();
    const info = await transporter.sendMail({
      from,
      to: payload.to,
      replyTo: payload.replyTo || replyTo,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      ...(payload.inlineAssets && payload.inlineAssets.length > 0
        ? {
            attachments: payload.inlineAssets.map((asset) => ({
              filename: asset.filename,
              content: asset.content,
              contentType: 'image/png',
              cid: asset.contentId,
            })),
          }
        : {}),
    });

    return {
      sent: true,
      status: 'sent',
      provider: 'smtp',
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'SMTP delivery failed';
    return {
      sent: false,
      status: 'failed',
      provider: 'smtp',
      error: msg,
    };
  }
}

export async function dispatchTransactionalEmail(
  payload: EmailDispatchPayload
): Promise<SendEmailResult> {
  const provider = getConfiguredEmailProvider();

  if (provider === 'none') {
    console.warn(
      '[Orb Mailer] Email provider not configured. Set RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS in .env.local to send live emails.'
    );
    return {
      sent: false,
      status: 'not_configured',
    };
  }

  const { from, replyTo } = resolveSenderAddresses(provider);

  if (provider === 'resend') {
    return sendViaResend(payload, from, replyTo);
  }

  return sendViaSmtp(payload, from, replyTo);
}

export async function sendWaitlistConfirmationEmail(
  params: WaitlistEmailParams
): Promise<SendEmailResult> {
  const inlineAssets = loadInlineLogoAssets();
  const rendered = renderWaitlistConfirmationEmail({
    ...params,
    useCidImages: inlineAssets.length === 2,
  });

  return dispatchTransactionalEmail({
    to: rendered.copy.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    inlineAssets,
  });
}

export async function sendAdminOtpEmail(
  params: AdminOtpEmailParams
): Promise<SendEmailResult> {
  const inlineAssets = loadInlineLogoAssets();
  const rendered = renderAdminOtpEmail({
    ...params,
    useCidImages: inlineAssets.length === 2,
  });

  return dispatchTransactionalEmail({
    to: rendered.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    inlineAssets,
  });
}

export interface AdminOtpEmailParams {
  email: string;
  fullName?: string;
  otpCode: string;
  expiresInMinutes?: number;
  ipAddress?: string | null;
  useCidImages?: boolean;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderAdminOtpEmail(params: AdminOtpEmailParams) {
  const email = params.email.trim().toLowerCase();
  const displayName = (params.fullName || 'Orb Administrator').trim();
  const otpCode = params.otpCode.trim();
  const expiresInMinutes = params.expiresInMinutes ?? 10;
  const ipAddress = params.ipAddress?.trim() || 'Verified Terminal';

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://orbfinance.co').replace(/\/$/, '');
  const whiteLogoSrc = params.useCidImages
    ? 'cid:orb-logo-white'
    : `${siteUrl}/images/orb-logo-white.png`;
  const blackLogoSrc = params.useCidImages
    ? 'cid:orb-logo-black'
    : `${siteUrl}/images/orb-logo-black.png`;

  const issuedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  const safeName = escapeHtml(displayName);
  const safeEmail = escapeHtml(email);
  const safeOtp = escapeHtml(otpCode);
  const safeIp = escapeHtml(ipAddress);

  const subject = `${otpCode} — Orb Finance Admin Verification Code`;

  const text = `ORB FINANCE — EXECUTIVE ADMIN VERIFICATION

Hello ${displayName},

A sign-in attempt to the Orb Finance Executive Admin Terminal was authenticated via Supabase Auth (role: admin) for ${email}.

Your 6-digit single-use verification code is:

    ${otpCode}

This verification code expires in ${expiresInMinutes} minutes and can only be used once.

Session Details:
- Account: ${email}
- Authority Role: ADMIN (Supabase Auth)
- Origin IP: ${ipAddress}
- Issued At: ${issuedAt} UTC

If you did not initiate this request, ignore this email and immediately rotate your Supabase Auth credentials.

— Orb Finance Security Desk
https://x.com/OrbFinanceHq`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111116;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 20px 50px rgba(0,0,0,0.08);">
          <!-- Obsidian Executive Header -->
          <tr>
            <td align="center" style="background-color:#07090e;padding:40px 32px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:22px;">
                    <img
                      src="${whiteLogoSrc}"
                      alt="Orb Finance"
                      width="132"
                      style="display:block;margin:0 auto;width:132px;max-width:100%;height:auto;border:0;"
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <span style="display:inline-block;padding:6px 14px;border-radius:999px;background-color:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#e2e8f0;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;font-family:'SF Mono',Menlo,Consolas,monospace;">
                      EXECUTIVE OTP CONFIRMATION
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-size:23px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">
                      Confirm Your Admin Sign-In
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 36px 24px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#18181b;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin:0 0 26px;font-size:15px;line-height:1.65;color:#3f3f46;">
                Your Supabase Auth credentials and <strong>admin</strong> role were verified for <strong>${safeEmail}</strong>. Enter the single-use confirmation code below to unlock the Orb Finance Admin Terminal:
              </p>

              <!-- 6-Digit OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#090c12;border:1px solid #1e293b;border-radius:16px;margin-bottom:26px;">
                <tr>
                  <td align="center" style="padding:28px 20px;">
                    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;margin-bottom:12px;">
                      ONE-TIME VERIFICATION CODE
                    </div>
                    <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:36px;line-height:1.1;font-weight:700;letter-spacing:0.28em;color:#ffffff;padding-left:0.28em;">
                      ${safeOtp}
                    </div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:14px;">
                      Valid for <strong style="color:#e2e8f0;">${expiresInMinutes} minutes</strong> &bull; Single use only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Session Audit Ledger -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 20px;background-color:#111318;border-bottom:1px solid #27272a;">
                    <span style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#e2e8f0;">
                      AUTHENTICATION CONTEXT
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;border-bottom:1px solid #e4e4e7;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;font-family:'SF Mono',Menlo,Consolas,monospace;">Account</td>
                        <td align="right" style="font-size:13px;font-weight:600;color:#111116;">${safeEmail}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;border-bottom:1px solid #e4e4e7;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;font-family:'SF Mono',Menlo,Consolas,monospace;">Supabase Role</td>
                        <td align="right">
                          <span style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:#0f172a;color:#f8fafc;font-size:11px;font-weight:700;font-family:'SF Mono',Menlo,Consolas,monospace;letter-spacing:0.08em;">ADMIN</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;font-family:'SF Mono',Menlo,Consolas,monospace;">Request IP / Time</td>
                        <td align="right" style="font-size:12px;color:#52525b;font-family:'SF Mono',Menlo,Consolas,monospace;">${safeIp} &bull; ${escapeHtml(issuedAt)} UTC</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12.5px;line-height:1.6;color:#71717a;">
                If you did not initiate this sign-in, disregard this email and rotate your Supabase Auth password immediately. Never share this verification code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#fafafa;border-top:1px solid #e4e4e7;padding:24px 32px;text-align:center;">
              <img
                src="${blackLogoSrc}"
                alt="Orb Finance"
                width="74"
                style="display:block;margin:0 auto 10px;width:74px;max-width:100%;height:auto;border:0;opacity:0.88;"
              />
              <p style="margin:0 0 6px;font-size:11px;color:#71717a;">
                Orb Finance Security Operations &bull; Institutional Treasury Infrastructure
              </p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;">
                <a href="https://x.com/OrbFinanceHq" style="color:#52525b;text-decoration:none;font-weight:600;">Follow @OrbFinanceHq</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject,
    html,
    text,
    email,
  };
}


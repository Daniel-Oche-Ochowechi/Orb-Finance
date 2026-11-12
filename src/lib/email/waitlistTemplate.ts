export interface WaitlistEmailParams {
  fullName: string;
  email: string;
  role: string;
  referenceId: string;
  launchDate?: string;
  useCidImages?: boolean;
}

export interface WaitlistEmailCopy {
  subject: string;
  preheader: string;
  firstName: string;
  fullName: string;
  email: string;
  roleLabel: string;
  referenceId: string;
  launchDate: string;
  greeting: string;
  openingParagraph: string;
  networkParagraph: string;
  nextStepsParagraph: string;
  closingNote: string;
  tagline: string;
  signoff: string;
}

export interface RenderedWaitlistEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
  copy: WaitlistEmailCopy;
}

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  Bank: 'Bank',
  'Fintech or payments company': 'Fintech or payments company',
  Business: 'Business',
  Individual: 'Individual',
};

/**
 * Restores characters escaped by `sanitizeInput` so plain-text emails
 * render naturally without literal entities (e.g. `&#x27;`), before
 * re-escaping strictly for HTML output.
 */
export function decodeStoredInput(value: string): string {
  if (!value) return '';
  return value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFirstName(cleanFullName: string): string {
  const first = cleanFullName.split(/\s+/).filter(Boolean)[0];
  return first || 'Partner';
}

function getNextStepsCopy(role: string, launchDate: string): string {
  if (role === 'Bank' || role === 'Fintech or payments company') {
    return `We open on ${launchDate}. Ahead of launch, our partnerships team will write to you with sandbox documentation and onboarding details. If your institution wishes to speak sooner, simply reply to this message.`;
  }

  if (role === 'Business') {
    return `We open on ${launchDate}, and you will hear from us ahead of launch with access details for your team. If you have upcoming corridors or treasury requirements to discuss sooner, simply reply to this message.`;
  }

  return `We open on ${launchDate}, and you will hear from us before launch with your invitation details. If you have any questions in the meantime, simply reply to this message.`;
}

export function buildWaitlistEmailCopy(params: WaitlistEmailParams): WaitlistEmailCopy {
  const cleanFullName = decodeStoredInput(params.fullName) || 'Member';
  const cleanEmail = decodeStoredInput(params.email);
  const cleanRole = decodeStoredInput(params.role) || 'Member';
  const cleanReferenceId = decodeStoredInput(params.referenceId) || 'ORB-REG-0001';
  const launchDate = params.launchDate?.trim() || '15 April 2027 (Q2)';

  const firstName = getFirstName(cleanFullName);
  const roleLabel = ROLE_DISPLAY_LABELS[cleanRole] || cleanRole;

  return {
    subject: 'You are in orbit — Orb Finance early access confirmed',
    preheader: `Your reservation on the Orb Finance priority register is confirmed (${cleanReferenceId}). Opening ${launchDate}.`,
    firstName,
    fullName: cleanFullName,
    email: cleanEmail,
    roleLabel,
    referenceId: cleanReferenceId,
    launchDate,
    greeting: `Dear ${firstName},`,
    openingParagraph: 'Thank you for requesting early access to Orb Finance.',
    networkParagraph:
      'We are building a single network for sending money across borders: you send in your currency, and they receive in theirs.',
    nextStepsParagraph: getNextStepsCopy(cleanRole, launchDate),
    closingNote:
      'Discreet by design — we write infrequently and only with substantive updates regarding Orb Finance.',
    tagline: 'Every currency. One orbit.',
    signoff: 'The Orb Finance team',
  };
}

export function renderWaitlistConfirmationEmail(
  params: WaitlistEmailParams
): RenderedWaitlistEmail {
  const copy = buildWaitlistEmailCopy(params);

  const safePreheader = escapeHtml(copy.preheader);
  const safeGreeting = escapeHtml(copy.greeting);
  const safeFullName = escapeHtml(copy.fullName);
  const safeEmail = escapeHtml(copy.email);
  const safeRole = escapeHtml(copy.roleLabel);
  const safeReferenceId = escapeHtml(copy.referenceId);
  const safeLaunchDate = escapeHtml(copy.launchDate);

  // Emphasize the launch date cleanly inside the HTML prose
  const escapedNextSteps = escapeHtml(copy.nextStepsParagraph).replace(
    safeLaunchDate,
    `<strong style="color:#0b0d13;font-weight:600;">${safeLaunchDate}</strong>`
  );

  const fontSans =
    "'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const fontMono =
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

  const siteBaseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://orbfinance.co')
  ).replace(/\/+$/, '');
  const whiteLogoUrl = params.useCidImages
    ? 'cid:orb-logo-white'
    : `${siteBaseUrl}/images/orb-logo-white.png`;
  const blackLogoUrl = params.useCidImages
    ? 'cid:orb-logo-black'
    : `${siteBaseUrl}/images/orb-logo-black.png`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" content="true" />
  <title>${escapeHtml(copy.subject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #eef1f5; }
    @media only screen and (max-width: 620px) {
      .orb-outer-pad { padding: 20px 12px !important; }
      .orb-masthead { padding: 30px 24px 26px 24px !important; }
      .orb-body-pad { padding: 32px 24px 28px 24px !important; }
      .orb-footer-pad { padding: 22px 24px !important; }
      .orb-headline { font-size: 24px !important; }
      .orb-slip-head { padding: 12px 16px !important; }
      .orb-slip-body { padding: 0 16px !important; }
      .orb-row-label { display: block !important; width: 100% !important; padding-bottom: 2px !important; }
      .orb-row-val { display: block !important; width: 100% !important; text-align: left !important; padding-top: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:${fontSans};color:#0b0d13;">
  <!-- Hidden Inbox Preheader -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${safePreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#eef1f5;">
    <tr>
      <td align="center" class="orb-outer-pad" style="padding:44px 16px;">
        <!-- Stationery Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="width:100%;max-width:580px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          
          <!-- Centered Obsidian Masthead -->
          <tr>
            <td align="center" class="orb-masthead" style="background-color:#090b10;background-image:linear-gradient(180deg,#111520 0%,#090b10 100%);padding:34px 40px 28px 40px;border-bottom:1px solid #e2e8f0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <img
                      src="${whiteLogoUrl}"
                      alt="ORB FINANCE"
                      width="68"
                      height="44"
                      style="display:block;margin:0 auto;width:68px;height:auto;max-width:100%;font-family:${fontSans};font-size:16px;font-weight:700;letter-spacing:0.2em;color:#ffffff;"
                    />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <div style="width:42px;height:1px;margin:0 auto;background-color:#334155;font-size:1px;line-height:1px;">&nbsp;</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-family:${fontSans};font-size:9.5px;font-weight:500;letter-spacing:0.26em;color:#94a3b8;text-transform:uppercase;">PRIORITY REGISTER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Letter Body -->
          <tr>
            <td class="orb-body-pad" style="padding:40px 42px 36px 42px;background-color:#ffffff;">
              <p style="margin:0 0 12px 0;font-family:${fontSans};font-size:10px;font-weight:600;letter-spacing:0.22em;color:#64748b;text-transform:uppercase;">
                RESERVATION CONFIRMED
              </p>

              <h1 class="orb-headline" style="margin:0 0 26px 0;font-family:${fontSans};font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.03em;color:#0b0d13;">
                You are in <span style="font-style:italic;font-weight:300;color:#475569;">orbit.</span>
              </h1>

              <p style="margin:0 0 18px 0;font-family:${fontSans};font-size:15px;line-height:1.7;font-weight:600;color:#0b0d13;">
                ${safeGreeting}
              </p>

              <p style="margin:0 0 16px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#334155;">
                ${escapeHtml(copy.openingParagraph)}
              </p>

              <p style="margin:0 0 16px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#334155;">
                ${escapeHtml(copy.networkParagraph)}
              </p>

              <p style="margin:0 0 28px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#334155;">
                ${escapedNextSteps}
              </p>

              <!-- Ledger Confirmation Table -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;margin-bottom:28px;border-collapse:separate;">
                <tr>
                  <td class="orb-slip-head" style="padding:14px 22px;background-color:#0b0d13;background-image:linear-gradient(180deg,#131722 0%,#0b0d13 100%);border-bottom:1px solid #1e293b;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" valign="middle" style="font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.16em;color:#94a3b8;text-transform:uppercase;">
                          RECORD OF REGISTRATION
                        </td>
                        <td align="right" valign="middle">
                          <span style="display:inline-block;padding:4px 10px;background-color:#161c28;border:1px solid #334155;border-radius:5px;font-family:${fontMono};font-size:11px;font-weight:600;letter-spacing:0.08em;color:#f8fafc;">
                            ${safeReferenceId}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="orb-slip-body" style="padding:2px 22px;background-color:#ffffff;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="orb-row-label" width="36%" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.12em;color:#64748b;text-transform:uppercase;">
                          Applicant
                        </td>
                        <td class="orb-row-val" align="right" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontSans};font-size:13.5px;font-weight:600;color:#0b0d13;">
                          ${safeFullName}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="36%" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.12em;color:#64748b;text-transform:uppercase;">
                          Email
                        </td>
                        <td class="orb-row-val" align="right" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontSans};font-size:13.5px;font-weight:500;color:#334155;word-break:break-all;">
                          ${safeEmail}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="36%" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.12em;color:#64748b;text-transform:uppercase;">
                          Category
                        </td>
                        <td class="orb-row-val" align="right" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-family:${fontSans};font-size:12.5px;font-weight:600;color:#0f172a;">
                          <span style="display:inline-block;padding:3px 10px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;color:#0f172a;">
                            ${safeRole}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="36%" style="padding:14px 0;font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.12em;color:#64748b;text-transform:uppercase;">
                          Opening Date
                        </td>
                        <td class="orb-row-val" align="right" style="padding:14px 0;font-family:${fontSans};font-size:13.5px;font-weight:600;letter-spacing:-0.01em;color:#0b0d13;">
                          ${safeLaunchDate}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="orb-slip-head" style="padding:12px 22px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="orb-row-label" align="left" valign="middle" style="font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.12em;color:#64748b;text-transform:uppercase;">
                          Status
                        </td>
                        <td class="orb-row-val" align="right" valign="middle">
                          <span style="display:inline-block;padding:4px 11px;background-color:#ecfdf5;border:1px solid #bbf7d0;border-radius:999px;font-family:${fontSans};font-size:12px;font-weight:600;color:#166534;">
                            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#16a34a;vertical-align:middle;margin-right:6px;"></span>Confirmed &middot; Priority Queue
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 26px 0;font-family:${fontSans};font-size:13px;line-height:1.65;color:#64748b;">
                ${escapeHtml(copy.closingNote)}
              </p>

              <!-- Sign-off -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e2e8f0;">
                <tr>
                  <td style="padding-top:22px;">
                    <p style="margin:0 0 4px 0;font-family:${fontSans};font-size:14px;font-style:italic;color:#475569;">
                      ${escapeHtml(copy.tagline)}
                    </p>
                    <p style="margin:0;font-family:${fontSans};font-size:14px;font-weight:600;color:#0b0d13;">
                      ${escapeHtml(copy.signoff)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quiet Stationery Footer -->
          <tr>
            <td align="center" class="orb-footer-pad" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 42px;text-align:center;">
              <img
                src="${blackLogoUrl}"
                alt="Orb Finance"
                width="38"
                height="24"
                style="display:block;margin:0 auto 12px auto;width:38px;height:auto;opacity:0.78;"
              />
              <p style="margin:0 0 6px 0;font-family:${fontSans};font-size:11.5px;font-weight:600;letter-spacing:0.02em;color:#334155;">
                Orb Finance &nbsp;&middot;&nbsp; Opening ${safeLaunchDate}
              </p>
              <p style="margin:0 0 4px 0;font-family:${fontSans};font-size:11px;line-height:1.5;color:#64748b;">
                Sent to ${safeEmail} following your early access registration (${safeReferenceId}).
              </p>
              <p style="margin:0;font-family:${fontSans};font-size:11px;color:#94a3b8;">
                &copy; 2026 Orb Finance. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    'ORB FINANCE — PRIORITY REGISTER',
    '==================================================',
    '',
    'RESERVATION CONFIRMED: You are in orbit.',
    '',
    copy.greeting,
    '',
    copy.openingParagraph,
    '',
    copy.networkParagraph,
    '',
    copy.nextStepsParagraph,
    '',
    'RECORD OF REGISTRATION',
    '--------------------------------------------------',
    `Reference:     ${copy.referenceId}`,
    `Applicant:     ${copy.fullName}`,
    `Email:         ${copy.email}`,
    `Category:      ${copy.roleLabel}`,
    `Opening Date:  ${copy.launchDate}`,
    `Status:        Confirmed (Priority Queue)`,
    '--------------------------------------------------',
    '',
    copy.closingNote,
    '',
    copy.tagline,
    copy.signoff,
    '',
    `© 2026 Orb Finance. All rights reserved.`,
  ].join('\n');

  return {
    subject: copy.subject,
    preheader: copy.preheader,
    html,
    text,
    copy,
  };
}


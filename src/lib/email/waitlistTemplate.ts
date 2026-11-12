export interface WaitlistEmailParams {
  fullName: string;
  email: string;
  role: string;
  referenceId: string;
  launchDate?: string;
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
  const launchDate = params.launchDate?.trim() || '15 January 2027';

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
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Raleway:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f1ea; }
    @media only screen and (max-width: 620px) {
      .orb-outer-pad { padding: 20px 12px !important; }
      .orb-masthead { padding: 22px 24px !important; }
      .orb-body-pad { padding: 30px 24px 28px 24px !important; }
      .orb-footer-pad { padding: 18px 24px !important; }
      .orb-headline { font-size: 24px !important; }
      .orb-slip-head { padding: 12px 16px !important; }
      .orb-slip-body { padding: 0 16px !important; }
      .orb-row-label { display: block !important; width: 100% !important; padding-bottom: 2px !important; }
      .orb-row-val { display: block !important; width: 100% !important; text-align: left !important; padding-top: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:${fontSans};color:#18181b;">
  <!-- Hidden Inbox Preheader -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${safePreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f1ea;">
    <tr>
      <td align="center" class="orb-outer-pad" style="padding:44px 16px;">
        <!-- Stationery Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="width:100%;max-width:580px;background-color:#ffffff;border:1px solid #e2ddd2;border-radius:4px;overflow:hidden;">
          
          <!-- Obsidian Masthead -->
          <tr>
            <td class="orb-masthead" style="background-color:#0b0d13;padding:26px 42px;border-bottom:2px solid #b8812e;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right:10px;">
                          <div style="width:7px;height:7px;border-radius:50%;background-color:#d99429;line-height:7px;font-size:1px;">&nbsp;</div>
                        </td>
                        <td valign="middle">
                          <span style="font-family:${fontSans};font-size:16px;font-weight:800;letter-spacing:0.22em;color:#ffffff;text-transform:uppercase;">ORB</span>
                          <span style="font-family:${fontSans};font-size:10px;font-weight:600;letter-spacing:0.24em;color:#9ca3af;text-transform:uppercase;padding-left:8px;">FINANCE</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family:${fontMono};font-size:10px;font-weight:500;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">PRIORITY REGISTER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Letter Body -->
          <tr>
            <td class="orb-body-pad" style="padding:40px 42px 36px 42px;background-color:#ffffff;">
              <p style="margin:0 0 12px 0;font-family:${fontMono};font-size:10.5px;font-weight:600;letter-spacing:0.18em;color:#9a6518;text-transform:uppercase;">
                RESERVATION CONFIRMED
              </p>

              <h1 class="orb-headline" style="margin:0 0 26px 0;font-family:${fontSans};font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-0.025em;color:#0b0d13;">
                You are in <span style="font-style:italic;font-weight:400;color:#4b5563;">orbit.</span>
              </h1>

              <p style="margin:0 0 18px 0;font-family:${fontSans};font-size:15px;line-height:1.7;font-weight:600;color:#111827;">
                ${safeGreeting}
              </p>

              <p style="margin:0 0 16px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#374151;">
                ${escapeHtml(copy.openingParagraph)}
              </p>

              <p style="margin:0 0 16px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#374151;">
                ${escapeHtml(copy.networkParagraph)}
              </p>

              <p style="margin:0 0 28px 0;font-family:${fontSans};font-size:15px;line-height:1.72;font-weight:400;color:#374151;">
                ${escapedNextSteps}
              </p>

              <!-- Ledger Confirmation Slip -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf8f4;border:1px solid #e5e0d5;border-radius:3px;margin-bottom:28px;">
                <tr>
                  <td class="orb-slip-head" style="padding:12px 20px;background-color:#f4f0e8;border-bottom:1px solid #e5e0d5;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="left" style="font-family:${fontMono};font-size:10px;font-weight:600;letter-spacing:0.14em;color:#57534e;text-transform:uppercase;">
                          RECORD OF REGISTRATION
                        </td>
                        <td align="right" style="font-family:${fontMono};font-size:11px;font-weight:600;letter-spacing:0.06em;color:#0b0d13;">
                          ${safeReferenceId}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="orb-slip-body" style="padding:4px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="orb-row-label" width="38%" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontMono};font-size:10.5px;letter-spacing:0.08em;color:#78716c;text-transform:uppercase;">
                          Applicant
                        </td>
                        <td class="orb-row-val" align="right" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontSans};font-size:13.5px;font-weight:600;color:#0b0d13;">
                          ${safeFullName}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="38%" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontMono};font-size:10.5px;letter-spacing:0.08em;color:#78716c;text-transform:uppercase;">
                          Email
                        </td>
                        <td class="orb-row-val" align="right" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontSans};font-size:13.5px;font-weight:500;color:#27272a;word-break:break-all;">
                          ${safeEmail}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="38%" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontMono};font-size:10.5px;letter-spacing:0.08em;color:#78716c;text-transform:uppercase;">
                          Category
                        </td>
                        <td class="orb-row-val" align="right" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontSans};font-size:13.5px;font-weight:600;color:#0b0d13;">
                          ${safeRole}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="38%" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontMono};font-size:10.5px;letter-spacing:0.08em;color:#78716c;text-transform:uppercase;">
                          Opening Date
                        </td>
                        <td class="orb-row-val" align="right" style="padding:11px 0;border-bottom:1px solid #ece7dc;font-family:${fontSans};font-size:13.5px;font-weight:600;color:#9a6518;">
                          ${safeLaunchDate}
                        </td>
                      </tr>
                      <tr>
                        <td class="orb-row-label" width="38%" style="padding:11px 0;font-family:${fontMono};font-size:10.5px;letter-spacing:0.08em;color:#78716c;text-transform:uppercase;">
                          Status
                        </td>
                        <td class="orb-row-val" align="right" style="padding:11px 0;font-family:${fontSans};font-size:13.5px;font-weight:600;color:#15803d;">
                          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#15803d;vertical-align:middle;margin-right:6px;"></span>Confirmed &middot; Priority Queue
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 26px 0;font-family:${fontSans};font-size:13px;line-height:1.65;color:#6b7280;">
                ${escapeHtml(copy.closingNote)}
              </p>

              <!-- Sign-off -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #ece7dc;">
                <tr>
                  <td style="padding-top:22px;">
                    <p style="margin:0 0 4px 0;font-family:${fontSans};font-size:14px;font-style:italic;color:#52525b;">
                      ${escapeHtml(copy.tagline)}
                    </p>
                    <p style="margin:0;font-family:${fontSans};font-size:14px;font-weight:700;color:#0b0d13;">
                      ${escapeHtml(copy.signoff)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quiet Stationery Footer -->
          <tr>
            <td class="orb-footer-pad" style="background-color:#faf9f6;border-top:1px solid #e8e4dc;padding:20px 42px;">
              <p style="margin:0 0 6px 0;font-family:${fontSans};font-size:11.5px;font-weight:600;letter-spacing:0.02em;color:#4b5563;">
                Orb Finance &nbsp;&middot;&nbsp; Opening ${safeLaunchDate}
              </p>
              <p style="margin:0 0 4px 0;font-family:${fontSans};font-size:11px;line-height:1.5;color:#78716c;">
                Sent to ${safeEmail} following your early access registration (${safeReferenceId}).
              </p>
              <p style="margin:0;font-family:${fontSans};font-size:11px;color:#a8a29e;">
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


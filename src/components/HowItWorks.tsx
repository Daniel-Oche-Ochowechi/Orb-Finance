'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

const CODE_EXAMPLES = {
  curl: `curl -X POST "https://api.orb.finance/v1/settlements/quote" \\
  -H "Authorization: Bearer orb_sec_live_9f82d1c7" \\
  -H "Orb-Signature: t=1798804804,v1=9e821f92c10bca001..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "corridor": "NGN_TO_USD",
    "amount_ngn": 5000000.00,
    "settlement_rail": "INSTANT_SWIFT_DIRECT",
    "beneficiary": {
      "account_holder": "Global Ventures Ltd",
      "routing_code": "021000021",
      "account_number": "9876543210"
    }
  }'`,

  node: `import { OrbClient } from '@orb-finance/sdk';

const orb = new OrbClient({
  apiKey: process.env.ORB_SECRET_KEY,
  environment: 'production'
});

// Request upfront locked FX quote & initiate instant settlement
const settlement = await orb.settlements.createQuote({
  sourceCurrency: 'NGN',
  targetCurrency: 'GBP',
  amount: 15_000_000.00,
  beneficiary: {
    name: 'Atlas Capital Partners',
    sortCode: '20-00-00',
    accountNumber: '12345678'
  },
  autoExecute: true
});

console.log('Orb Settlement ID:', settlement.id);
console.log('Guaranteed Rate:', settlement.guaranteedRate);
console.log('Ledger Status:', settlement.status); // 'SETTLED'`,

  python: `from orb_finance import OrbClient

client = OrbClient(api_key="orb_sec_live_9f82d1c7")

# Atomic cross-border payout with double-entry ledger lock
quote = client.settlements.create(
    source_currency="NGN",
    target_currency="EUR",
    amount=7500000.00,
    beneficiary={
        "iban": "DE89370400440532013000",
        "bic": "DBEUTDDBXXX",
        "name": "Nordic Tech GmbH"
    },
    webhook_url="https://api.yourbank.com/webhooks/orb"
)

print(f"Settled: {quote.status}, Ledger ID: {quote.id}")`,

  webhook: `{
  "id": "evt_orb_9941a82bc1",
  "object": "event",
  "type": "settlement.completed",
  "created_at": "2027-01-01T12:00:04.120Z",
  "signature": "t=1798804804,v1=9e821f92c10bca001e92d8f7...",
  "data": {
    "settlement_id": "stl_01HXYZ789",
    "ledger_reference": "LEDGER_DOUBLE_ENTRY_9921",
    "status": "SETTLED",
    "source_amount": 5000000.00,
    "source_currency": "NGN",
    "target_amount": 3365.87,
    "target_currency": "USD",
    "exchange_rate": 1485.50,
    "network_fee_bps": 15,
    "settlement_latency_ms": 820
  }
}`
};

export default function HowItWorks() {
  const [activeLang, setActiveLang] = useState<'curl' | 'node' | 'python' | 'webhook'>('curl');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="page-section how-root" id="how-it-works">
      <div className="container">
        <div className="section-header-center">
          <div className="how-eyebrow-row">
            <span className="how-eyebrow-rule" aria-hidden="true" />
            <span className="how-eyebrow">HOW IT WORKS</span>
            <span className="how-eyebrow-rule" aria-hidden="true" />
          </div>
          <h2 className="how-headline">
            The pathway into <span className="italic-accent gradient-shimmer">orbit.</span>
          </h2>
          <p className="how-subtext">
            Three quiet milestones between your product and global liquidity.
          </p>
        </div>

        {/* 3 Architectural Step Cards */}
        <div className="steps-cards-grid">
          {/* 01 */}
          <div className="step-box">
            <div className="step-card-specular" aria-hidden="true" />

            <div className="step-top-row">
              <span className="step-num">01</span>
              <span className="step-tag">MILESTONE ONE</span>
            </div>

            <h3 className="step-title">Connect</h3>
            <p className="step-description">
              Integrate once. Rehearse the entire flow in our sandbox before anything goes live.
            </p>

            <div className="step-chips-row">
              <span className="chip-item">Staging Sandbox</span>
              <span className="chip-item">Typed Client SDKs</span>
            </div>
          </div>

          {/* 02 */}
          <div className="step-box">
            <div className="step-card-specular" aria-hidden="true" />

            <div className="step-top-row">
              <span className="step-num">02</span>
              <span className="step-tag">MILESTONE TWO</span>
            </div>

            <h3 className="step-title">Move</h3>
            <p className="step-description">
              Request a quote in the sender&apos;s currency, see exactly what the recipient will receive in theirs, and confirm. Orb handles screening, conversion and settlement.
            </p>

            <div className="step-chips-row">
              <span className="chip-item">Upfront Locked FX</span>
              <span className="chip-item">Instant Sanctions Pass</span>
            </div>
          </div>

          {/* 03 */}
          <div className="step-box">
            <div className="step-card-specular" aria-hidden="true" />

            <div className="step-top-row">
              <span className="step-num">03</span>
              <span className="step-tag">MILESTONE THREE</span>
            </div>

            <h3 className="step-title">Observe</h3>
            <p className="step-description">
              Watch every transaction in real time. Receive a signed webhook the moment a status changes.
            </p>

            <div className="step-chips-row">
              <span className="chip-item">HMAC Signed Webhooks</span>
              <span className="chip-item">Immutable Double-Entry</span>
            </div>
          </div>
        </div>

        {/* Minimalist Developer Sandbox Console */}
        <div className="developer-terminal">
          <div className="terminal-specular" aria-hidden="true" />
          <div className="terminal-header-bar">
            <div className="terminal-left-meta">
              <div className="language-tabs font-mono">
                {(['curl', 'node', 'python', 'webhook'] as const).map((lang) => {
                  const isActive = activeLang === lang;
                  return (
                    <button
                      key={lang}
                      className={`lang-tab-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveLang(lang)}
                      type="button"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="howItWorksLangPill"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '9999px',
                            pointerEvents: 'none',
                          }}
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        >
                          <span className="lang-tab-pill" />
                        </motion.span>
                      )}
                      <span className="lang-tab-label">
                        {lang === 'webhook' ? 'Signed Webhook' : lang.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="terminal-actions font-mono">
              <span className="endpoint-pill">POST /v1/settlements/quote</span>
              <button className="copy-code-btn" onClick={handleCopy} title="Copy Code" type="button">
                {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          <div className="terminal-code-body">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeLang}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <pre className="terminal-pre font-mono">
                  <code>{CODE_EXAMPLES[activeLang]}</code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .how-root {
          padding: clamp(5rem, 9vw, 9rem) 0;
          position: relative;
          z-index: 2;
        }

        .section-header-center {
          text-align: center;
          max-width: 720px;
          margin: 0 auto clamp(3rem, 5.5vw, 4.75rem);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .how-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.2rem;
        }

        .how-eyebrow-rule {
          width: 24px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.55));
        }

        .how-eyebrow-rule:last-child {
          background: linear-gradient(90deg, rgba(226, 232, 240, 0.55), transparent);
        }

        .how-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.24em;
          color: rgba(203, 213, 225, 0.66);
          text-transform: uppercase;
        }

        .how-headline {
          font-size: clamp(2.45rem, 4.8vw, 3.95rem);
          font-weight: 600;
          letter-spacing: -0.038em;
          line-height: 1.07;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .gradient-shimmer {
          font-weight: 300;
          background: linear-gradient(180deg, #ffffff 14%, #cbd5e1 85%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .how-subtext {
          font-size: clamp(1.02rem, 1.4vw, 1.14rem);
          line-height: 1.68;
          color: rgba(226, 232, 240, 0.64);
          max-width: 560px;
          font-weight: 400;
        }

        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.35rem, 2.4vw, 2rem);
          margin-bottom: clamp(2.5rem, 4.5vw, 3.8rem);
        }

        .step-box {
          position: relative;
          padding: clamp(1.65rem, 2.8vw, 2.3rem) clamp(1.45rem, 2.5vw, 2.15rem);
          border-radius: 28px;
          background: linear-gradient(
            165deg,
            rgba(16, 19, 28, 0.88) 0%,
            rgba(9, 11, 16, 0.94) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.12);
          box-shadow: 0 24px 56px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.3s ease,
            box-shadow 0.4s ease;
        }

        .step-box:hover {
          transform: translateY(-4px);
          border-color: rgba(226, 232, 240, 0.26);
          box-shadow: 0 32px 68px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .step-card-specular {
          position: absolute;
          top: 0;
          left: 14%;
          right: 14%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.36) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .step-top-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          margin-bottom: 1.45rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .step-num {
          font-family: var(--font-sans);
          font-size: 1.05rem;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(241, 245, 249, 0.82);
        }

        .step-tag {
          font-family: var(--font-sans);
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          color: rgba(148, 163, 184, 0.65);
        }

        .step-title {
          font-size: clamp(1.45rem, 2vw, 1.75rem);
          font-weight: 550;
          letter-spacing: -0.028em;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .step-description {
          font-size: 0.95rem;
          line-height: 1.66;
          color: rgba(203, 213, 225, 0.66);
          margin-bottom: 1.85rem;
          flex: 1;
          font-weight: 400;
        }

        .step-chips-row {
          display: flex;
          flex-direction: column;
          gap: 0.42rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1rem;
        }

        .chip-item {
          font-family: var(--font-sans);
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(226, 232, 240, 0.56);
        }

        /* Minimalist Developer Sandbox Console */
        .developer-terminal {
          position: relative;
          background: linear-gradient(
            165deg,
            rgba(15, 18, 26, 0.94) 0%,
            rgba(8, 10, 14, 0.98) 100%
          );
          border: 1px solid rgba(226, 232, 240, 0.13);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 32px 72px rgba(0, 0, 0, 0.66), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .terminal-specular {
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(226, 232, 240, 0.36) 50%,
            transparent 100%
          );
          z-index: 3;
          pointer-events: none;
        }

        .terminal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(0.85rem, 1.8vw, 1.05rem) clamp(1.1rem, 2.6vw, 1.55rem);
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.065);
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
        }

        .terminal-left-meta {
          display: flex;
          align-items: center;
          max-width: 100%;
          min-width: 0;
          flex-wrap: wrap;
        }

        .language-tabs {
          position: relative;
          display: flex;
          background: rgba(0, 0, 0, 0.42);
          padding: 0.22rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          gap: 0.18rem;
          overflow-x: auto;
          max-width: 100%;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .language-tabs::-webkit-scrollbar {
          display: none;
        }

        .lang-tab-btn {
          position: relative;
          background: transparent;
          border: none;
          padding: 0.36rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(203, 213, 225, 0.54);
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        .lang-tab-btn:hover,
        .lang-tab-btn.active {
          color: #ffffff;
        }

        .lang-tab-pill {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.11);
          border: 1px solid rgba(226, 232, 240, 0.16);
        }

        .lang-tab-label {
          position: relative;
          z-index: 1;
        }

        .terminal-actions {
          display: flex;
          align-items: center;
          gap: 0.95rem;
          flex-wrap: wrap;
        }

        .endpoint-pill {
          font-size: 0.72rem;
          color: rgba(203, 213, 225, 0.56);
          letter-spacing: 0.02em;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-code-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(226, 232, 240, 0.14);
          color: rgba(241, 245, 249, 0.84);
          padding: 0.36rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .copy-code-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(226, 232, 240, 0.28);
          color: #ffffff;
        }

        .text-emerald {
          color: #34d399;
        }

        .terminal-code-body {
          padding: clamp(1.25rem, 3vw, 2rem);
          overflow-x: auto;
          background: rgba(5, 6, 9, 0.55);
          min-height: 220px;
        }

        .terminal-pre {
          margin: 0;
          line-height: 1.72;
          font-size: clamp(0.76rem, 1.35vw, 0.86rem);
          color: rgba(226, 232, 240, 0.88);
        }

        @media (max-width: 992px) {
          .steps-cards-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}

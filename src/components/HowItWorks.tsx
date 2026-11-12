'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal, Play, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

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
          <span className="section-label font-mono">HOW IT WORKS</span>
          <h2 className="section-headline">
            The pathway into <span className="italic-accent gradient-shimmer">orbit.</span>
          </h2>
          <p className="section-subtext">
            Three simple milestones between your product and global liquidity.
          </p>
        </div>

        {/* 3 Step Progression Cards */}
        <div className="steps-cards-grid">
          {/* 01 */}
          <div className="step-box glass-surface">
            <div className="step-card-specular" aria-hidden="true" />
            <div className="step-orbit-watermark font-mono">01</div>
            
            <div className="step-top-row">
              <span className="step-tag font-mono">MILESTONE ONE</span>
              <span className="step-dot active" />
            </div>

            <h3 className="step-title">01. Connect</h3>
            <p className="step-description">
              Integrate once. Rehearse the entire flow in our sandbox before anything goes live.
            </p>
            
            <div className="step-chips-row font-mono">
              <span className="chip-item">✦ Staging Sandbox</span>
              <span className="chip-item">✦ Typed Client SDKs</span>
            </div>
          </div>

          {/* 02 */}
          <div className="step-box glass-surface">
            <div className="step-card-specular" aria-hidden="true" />
            <div className="step-orbit-watermark font-mono">02</div>
            
            <div className="step-top-row">
              <span className="step-tag font-mono">MILESTONE TWO</span>
              <span className="step-dot active" />
            </div>

            <h3 className="step-title">02. Move</h3>
            <p className="step-description">
              Request a quote in the sender's currency, see exactly what the recipient will receive in theirs, and confirm. Orb handles screening, conversion and settlement.
            </p>
            
            <div className="step-chips-row font-mono">
              <span className="chip-item">✦ Upfront Locked FX</span>
              <span className="chip-item">✦ Instant Sanctions Pass</span>
            </div>
          </div>

          {/* 03 */}
          <div className="step-box glass-surface">
            <div className="step-card-specular" aria-hidden="true" />
            <div className="step-orbit-watermark font-mono">03</div>
            
            <div className="step-top-row">
              <span className="step-tag font-mono">MILESTONE THREE</span>
              <span className="step-dot active" />
            </div>

            <h3 className="step-title">03. Observe</h3>
            <p className="step-description">
              Watch every transaction in real time. Receive a signed webhook the moment a status changes.
            </p>
            
            <div className="step-chips-row font-mono">
              <span className="chip-item">✦ HMAC Signed Webhooks</span>
              <span className="chip-item">✦ Immutable Double-Entry</span>
            </div>
          </div>
        </div>

        {/* Developer Sandbox Code Terminal */}
        <div className="developer-terminal glass-surface">
          <div className="terminal-header-bar">
            <div className="terminal-left-meta">
              <div className="mac-traffic-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
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
                          className="lang-tab-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          aria-hidden="true"
                        />
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
                {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          <div className="terminal-code-body">
            <AnimatePresence mode="wait" initial={false}>
              <motion.pre
                key={activeLang}
                className="font-mono text-sm leading-relaxed text-slate-200"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <code>{CODE_EXAMPLES[activeLang]}</code>
              </motion.pre>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-header-center {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 4.5rem);
        }

        .section-header-center .section-subtext {
          margin-left: auto;
          margin-right: auto;
        }

        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(1.25rem, 2.5vw, 2rem);
          margin-bottom: clamp(2.5rem, 4.5vw, 4rem);
        }

        .step-box {
          position: relative;
          padding: clamp(1.75rem, 3.2vw, 2.8rem) clamp(1.35rem, 2.6vw, 2.2rem);
          border-radius: clamp(20px, 2.2vw, 26px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease;
        }

        .step-box:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .step-card-specular {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        }

        .step-orbit-watermark {
          position: absolute;
          top: -10px;
          right: 18px;
          font-size: 5.5rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.03);
          pointer-events: none;
          line-height: 1;
        }

        .step-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .step-tag {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #fbbf24;
        }

        .step-dot.active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .step-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.85rem;
        }

        .step-description {
          font-size: 0.96rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 1.8rem;
          flex: 1;
        }

        .step-chips-row {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1rem;
        }

        .chip-item {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Developer Sandbox Terminal */
        .developer-terminal {
          position: relative;
          background: rgba(12, 14, 22, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15);
        }

        .terminal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(0.75rem, 1.8vw, 0.9rem) clamp(1rem, 2.6vw, 1.4rem);
          background: rgba(255, 255, 255, 0.025);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
        }

        .terminal-left-meta {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1.25rem);
          max-width: 100%;
          min-width: 0;
          flex-wrap: wrap;
        }

        .mac-traffic-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .dot.red { background: #ef4444; }
        .dot.yellow { background: #f59e0b; }
        .dot.green { background: #10b981; }

        .language-tabs {
          position: relative;
          display: flex;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.22rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          gap: 0.2rem;
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
          padding: 0.34rem 0.78rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.22s ease;
        }

        .lang-tab-btn:hover {
          color: #ffffff;
        }

        .lang-tab-btn.active {
          color: #ffffff;
        }

        .lang-tab-pill {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .lang-tab-label {
          position: relative;
          z-index: 1;
        }

        .terminal-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .endpoint-pill {
          font-size: 0.7rem;
          background: rgba(245, 158, 11, 0.12);
          color: #fbbf24;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(245, 158, 11, 0.2);
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-code-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-code-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        .text-emerald { color: #34d399; }

        .terminal-code-body {
          padding: clamp(1.1rem, 2.8vw, 1.8rem);
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.45);
          min-height: 220px;
        }

        .terminal-code-body pre {
          margin: 0;
          line-height: 1.7;
          font-size: clamp(0.76rem, 1.4vw, 0.875rem);
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

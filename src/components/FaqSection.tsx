'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const FAQ_ITEMS = [
  {
    num: '01',
    q: 'When does Orb Finance launch?',
    a: 'On 15 January 2027. Early access members hear from us first.',
  },
  {
    num: '02',
    q: 'How does sending money work?',
    a: 'You send in your local currency, for example Naira. The recipient, in another country, receives the equivalent amount in their local currency. The exchange rate and any fee are shown before you confirm.',
  },
  {
    num: '03',
    q: 'Who is Orb for?',
    a: 'Banks, fintechs and businesses that want to send money across borders, move money at home and pay bills through one integration. Individuals may join the list too, and we will tell you when personal access opens.',
  },
  {
    num: '04',
    q: 'Does it cost anything to join?',
    a: 'No. Early access is free and carries no obligation.',
  },
  {
    num: '05',
    q: 'What happens after I sign up?',
    a: 'You will receive a confirmation, then updates as launch approaches, then an invitation when your access opens.',
  },
  {
    num: '06',
    q: 'Can we connect before launch?',
    a: 'Join as a bank or fintech, or request sandbox access, and our team will contact you.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-apple-root" id="faq">
      <div className="container max-w-4xl">
        {/* Section Header */}
        <div className="faq-header">
          <span className="faq-eyebrow font-mono">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="faq-headline">
            Everything you need <br />
            <span className="italic-accent faq-accent-text">to know.</span>
          </h2>
          <p className="faq-subhead">
            Straightforward answers on our launch timeline, architecture, and onboarding.
          </p>
        </div>

        {/* Minimalist Apple Line Stack */}
        <div className="faq-line-stack">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.num}
                className={`faq-row-item ${isOpen ? 'is-expanded' : ''}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  type="button"
                >
                  <div className="faq-q-cluster">
                    <span className="faq-item-num font-mono">{item.num}</span>
                    <h3 className="faq-question-title">{item.q}</h3>
                  </div>

                  <div className="faq-plus-icon" aria-hidden="true">
                    <span className="icon-bar horizontal" />
                    <span className={`icon-bar vertical ${isOpen ? 'rotated' : ''}`} />
                  </div>
                </button>

                <div className="faq-drawer">
                  <div className="faq-drawer-inner">
                    <div className="faq-answer-pad">
                      <p className="faq-answer-copy">{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .faq-apple-root {
          padding: clamp(4.5rem, 8.5vw, 8.5rem) 0;
          position: relative;
          z-index: 2;
        }

        .max-w-4xl {
          max-width: 880px;
        }

        .faq-header {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 4.5rem);
        }

        .faq-eyebrow {
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #f59e0b;
          text-transform: uppercase;
          margin-bottom: 1.1rem;
          display: inline-block;
        }

        .faq-headline {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.08;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }

        .faq-accent-text {
          background: linear-gradient(135deg, #ffffff 20%, #c084fc 60%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .faq-subhead {
          font-size: 1.15rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.65);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Pure Linear Stack with 1px Hairline Dividers */
        .faq-line-stack {
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .faq-row-item {
          position: relative;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: background-color 0.25s ease, border-color 0.25s ease;
        }

        .faq-row-item:hover {
          background-color: rgba(255, 255, 255, 0.015);
        }

        .faq-row-item.is-expanded {
          border-bottom-color: rgba(255, 255, 255, 0.18);
        }

        .faq-trigger {
          width: 100%;
          background: transparent;
          border: none;
          padding: clamp(1.35rem, 2.8vw, 2rem) 0.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          gap: clamp(0.85rem, 2.2vw, 1.5rem);
        }

        .faq-q-cluster {
          display: flex;
          align-items: baseline;
          gap: clamp(1rem, 2.5vw, 2rem);
          flex: 1;
        }

        .faq-item-num {
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.06em;
          flex-shrink: 0;
          transition: color 0.25s ease;
        }

        .faq-row-item:hover .faq-item-num,
        .faq-row-item.is-expanded .faq-item-num {
          color: #fbbf24;
        }

        .faq-question-title {
          font-family: var(--font-sans);
          font-size: clamp(1.15rem, 2vw, 1.35rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #ffffff;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        /* Minimalist Line Plus / Minus Icon */
        .faq-plus-icon {
          width: 32px;
          height: 32px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        .icon-bar {
          position: absolute;
          background: currentColor;
          border-radius: 1px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }

        .icon-bar.horizontal {
          width: 14px;
          height: 1.5px;
        }

        .icon-bar.vertical {
          width: 1.5px;
          height: 14px;
        }

        .icon-bar.vertical.rotated {
          transform: rotate(90deg);
          opacity: 0;
        }

        .faq-row-item.is-expanded .faq-plus-icon {
          color: #ffffff;
        }

        /* Drawer */
        .faq-drawer {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 0.42s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .faq-row-item.is-expanded .faq-drawer {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .faq-drawer-inner {
          overflow: hidden;
          min-height: 0;
        }

        .faq-answer-pad {
          padding: 0 0.5rem clamp(1.35rem, 2.8vw, 2rem) clamp(2.15rem, 4.8vw, 3.4rem);
        }

        .faq-answer-copy {
          font-size: clamp(0.98rem, 1.8vw, 1.08rem);
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.68);
          max-width: 680px;
          margin: 0;
        }
      `}</style>
    </section>
  );
}



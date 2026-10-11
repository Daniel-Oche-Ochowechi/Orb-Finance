'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  Terminal,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useEarlyAccess } from '@/context/EarlyAccessContext';
import { ContactCategory } from '@/lib/supabase/types';

const CATEGORIES: { id: ContactCategory; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'Partnership', label: 'Institutional Partnership', icon: Briefcase },
  { id: 'Institutional Sandbox', label: 'Sandbox & API Keys', icon: Terminal },
  { id: 'Integration Support', label: 'Integration Support', icon: Building2 },
  { id: 'Compliance', label: 'Compliance & Legal', icon: Scale },
  { id: 'General', label: 'General Inquiry', icon: HelpCircle },
];

export default function ContactModal() {
  const { isContactOpen, closeContact, initialContactCategory } = useEarlyAccess();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Partnership');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  // Sync initial category when opening modal
  useEffect(() => {
    if (initialContactCategory) {
      const match = CATEGORIES.find((c) => c.id === initialContactCategory);
      if (match) setCategory(match.id);
    }
  }, [initialContactCategory, isContactOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset form state after closing
      setTimeout(() => {
        setError(null);
        setSuccessData(null);
        setFullName('');
        setEmail('');
        setCompany('');
        setSubject('');
        setMessage('');
      }, 300);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isContactOpen]);

  if (!isContactOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full official name.');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid official email address.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setError('Please write a brief message outlining your request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          company: company.trim() || null,
          category,
          subject: subject.trim() || `${category} Inquiry from ${fullName.trim()}`,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSuccessData({
        referenceId: data.referenceId,
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || 'Transmission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
      {/* Dark Glass Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={closeContact}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0d12]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-white overflow-hidden z-10 max-h-[92vh] overflow-y-auto">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeContact}
          className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {successData ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-gold">
                TRANSMISSION LOGGED
              </span>
              <h3 className="text-2xl font-semibold mt-1 tracking-tight text-white">
                Inquiry Dispatched
              </h3>
              <p className="text-sm text-white/70 max-w-md mx-auto mt-2 leading-relaxed">
                {successData.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 max-w-sm mx-auto">
              <span className="text-xs uppercase font-mono text-white/40 block mb-1">
                Institutional Reference ID
              </span>
              <span className="font-mono text-lg font-semibold tracking-wider text-amber-400">
                {successData.referenceId}
              </span>
            </div>

            <p className="text-xs text-white/40">
              A copy has been routed to our global partnerships desk. Our team typically responds within 24 business hours.
            </p>

            <button
              onClick={closeContact}
              className="w-full py-3 px-6 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all text-sm shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Contact Form */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider bg-gold/15 text-gold border border-gold/30">
                  DIRECT LINE
                </span>
                <span className="text-xs text-white/40 font-mono">
                  LAUNCHING 15 JAN 2027
                </span>
              </div>
              <h3 className="text-2xl font-medium tracking-tight text-white">
                Contact Orb Institutional Desk
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Direct contact for partner discussions, FX liquidity routing, sandbox credentials, or compliance reviews.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Pill Selector */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">
                  Topic of inquiry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left border ${
                          isSelected
                            ? 'bg-white/15 border-white/30 text-white shadow-sm'
                            : 'bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon size={13} className={isSelected ? 'text-amber-400' : 'text-white/40'} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two-column Inputs: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Full name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Official email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. elena@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>
              </div>

              {/* Company & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Citadel FX Bank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Subject (optional)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. API Integration Review"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Message / Requirements *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your request, estimated transfer corridors, or questions ahead of our January 15, 2027 opening..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-medium hover:brightness-105 active:scale-[0.99] transition-all text-xs tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting encrypted inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Transmit Inquiry</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>NDPR & Bank-grade encrypted transmission</span>
                </div>
                <span>Ref: ORB-DIRECT</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

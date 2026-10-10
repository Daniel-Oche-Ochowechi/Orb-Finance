/**
 * ORB FINANCE — Interactive Platform Experience
 * Tone: composed, precise, quietly futuristic.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initCursorGlow();
  initCountdownTimer();
  initScrollReveal();
  initNavbarScroll();
  initThemeToggle();
  initComparisonTabs();
  initApiConsole();
  initWaitlistForm();
  initFaqAccordion();
  initFxConverterSimulation();
  initMobileNav();
});

/* --------------------------------------------------------------------------
   1. AMBIENT CELESTIAL CANVAS
   -------------------------------------------------------------------------- */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.6 ? '#f59e0b' : (Math.random() > 0.3 ? '#c084fc' : '#ffffff');
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw subtle connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#c084fc';
          ctx.globalAlpha = (1 - dist / 120) * 0.12;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* --------------------------------------------------------------------------
   2. CURSOR GLOW EFFECT
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

/* --------------------------------------------------------------------------
   3. COUNTDOWN TIMER TO 1 JANUARY 2027
   -------------------------------------------------------------------------- */
function initCountdownTimer() {
  const targetDate = new Date('2027-01-01T00:00:00Z').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '000';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(3, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* --------------------------------------------------------------------------
   4. SCROLL REVEAL (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-fade, .reveal-left, .reveal-right');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. NAVBAR STICKY & SCROLL EFFECT
   -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* --------------------------------------------------------------------------
   6. THEME TOGGLE (Dark / Light)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Saved theme or system preference
  const savedTheme = localStorage.getItem('orb_theme') || 'dark';
  if (savedTheme === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('orb_theme', 'light');
      } else {
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('orb_theme', 'dark');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   7. COMPARISON TABS (The Shift)
   -------------------------------------------------------------------------- */
function initComparisonTabs() {
  const tabs = document.querySelectorAll('.comp-tab');
  const states = document.querySelectorAll('.comparison-state');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      states.forEach(state => {
        if (state.classList.contains(`${target}-state`)) {
          state.classList.add('active');
        } else {
          state.classList.remove('active');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   8. API CODE CONSOLE & COPY
   -------------------------------------------------------------------------- */
const CODE_SNIPPETS = {
  curl: `curl -X POST "https://api.orbfinance.com/v1/settlements/quote" \\
  -H "Authorization: Bearer orb_sec_live_9f82d1c7" \\
  -H "Idempotency-Key: idemp_9921471a-28" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_currency": "NGN",
    "target_currency": "USD",
    "amount": 5000000.00,
    "settlement_type": "INSTANT_SWIFT",
    "recipient": {
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
  recipient: {
    name: 'Atlas Capital Partners',
    sortCode: '20-00-00',
    accountNumber: '12345678'
  },
  autoExecute: true
});

console.log('Orb Settlement ID:', settlement.id);
console.log('Confirmed Rate:', settlement.guaranteedRate);
console.log('Status:', settlement.status); // 'SETTLED'`,

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

print(f"Settled: {quote.status}, Transaction ID: {quote.id}")`,

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
    "target_amount": 3280.00,
    "target_currency": "USD",
    "exchange_rate": 1524.39,
    "margin_bps": 20,
    "settlement_duration_ms": 2340
  }
}`
};

function initApiConsole() {
  const tabs = document.querySelectorAll('.console-tab');
  const codeDisplay = document.getElementById('code-display');
  const copyBtn = document.getElementById('copy-code-btn');

  let currentLang = 'curl';

  function updateCode(lang) {
    if (!codeDisplay) return;
    currentLang = lang;
    codeDisplay.textContent = CODE_SNIPPETS[lang] || CODE_SNIPPETS.curl;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateCode(tab.dataset.lang);
    });
  });

  // Initial code load
  updateCode('curl');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = CODE_SNIPPETS[currentLang];
      navigator.clipboard.writeText(code).then(() => {
        const copyLabel = copyBtn.querySelector('.copy-label');
        if (copyLabel) {
          copyLabel.textContent = 'Copied!';
          setTimeout(() => {
            copyLabel.textContent = 'Copy';
          }, 2000);
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   9. EARLY ACCESS WAITLIST FORM & EMAIL MODAL
   -------------------------------------------------------------------------- */
function initWaitlistForm() {
  const form = document.getElementById('early-access-form');
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('emailAddress');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const generalError = document.getElementById('general-error');
  const submitBtn = document.getElementById('submit-waitlist-btn');

  const successState = document.getElementById('form-success-state');
  const successName = document.getElementById('success-user-name');
  const successEmail = document.getElementById('success-user-email');
  const successRole = document.getElementById('success-user-role');
  const resetBtn = document.getElementById('reset-form-btn');

  // Modal elements
  const emailModal = document.getElementById('email-modal');
  const openModalBtn = document.getElementById('view-email-preview-btn');
  const closeModalBtn = document.getElementById('close-email-modal');
  const closeModalFooter = document.getElementById('close-modal-footer');
  const modalToName = document.getElementById('modal-to-name');
  const modalToEmail = document.getElementById('modal-to-email');
  const modalBodyName = document.getElementById('modal-body-name');

  if (!form) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Reset errors
    nameError.classList.remove('active');
    emailError.classList.remove('active');
    generalError.classList.remove('active');

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const selectedRole = form.querySelector('input[name="joiningRole"]:checked')?.value || 'Fintech or payments company';

    if (!nameVal) {
      nameError.classList.add('active');
      hasError = true;
    }

    if (!emailVal || !validateEmail(emailVal)) {
      emailError.classList.add('active');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Simulate API request
    submitBtn.classList.add('loading');

    setTimeout(() => {
      submitBtn.classList.remove('loading');

      // Populate Success Card
      successName.textContent = nameVal;
      successEmail.textContent = emailVal;
      successRole.textContent = selectedRole;

      // Populate Modal Preview
      const firstName = nameVal.split(' ')[0] || nameVal;
      if (modalToName) modalToName.textContent = nameVal;
      if (modalToEmail) modalToEmail.textContent = emailVal;
      if (modalBodyName) modalBodyName.textContent = firstName;

      // Swap Form & Success View
      form.style.display = 'none';
      successState.classList.add('active');

      // Store in localStorage for persistence
      localStorage.setItem('orb_waitlist_user', JSON.stringify({
        name: nameVal,
        email: emailVal,
        role: selectedRole,
        timestamp: new Date().toISOString()
      }));
    }, 900);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = 'block';
      successState.classList.remove('active');
    });
  }

  // Modal Handling
  function openModal() {
    if (emailModal) {
      emailModal.classList.add('active');
      emailModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (emailModal) {
      emailModal.classList.remove('active');
      emailModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (closeModalFooter) closeModalFooter.addEventListener('click', closeModal);

  if (emailModal) {
    emailModal.addEventListener('click', (e) => {
      if (e.target === emailModal) closeModal();
    });
  }
}

// Global helper for CTA buttons setting role directly
window.setRoleSelect = function(roleValue) {
  const radio = document.querySelector(`input[name="joiningRole"][value="${roleValue}"]`);
  if (radio) {
    radio.checked = true;
  }
};

/* --------------------------------------------------------------------------
   10. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherBtn = otherItem.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   11. FX CONVERTER SIMULATION IN CARD
   -------------------------------------------------------------------------- */
function initFxConverterSimulation() {
  const ngnEl = document.getElementById('mini-calc-ngn');
  const destEl = document.getElementById('mini-calc-dest');
  if (!ngnEl || !destEl) return;

  const mockPairs = [
    { ngn: '₦ 5,000,000', dest: '$ 3,280.00 USD' },
    { ngn: '₦ 12,500,000', dest: '£ 6,450.00 GBP' },
    { ngn: '₦ 8,200,000', dest: '€ 4,920.00 EUR' },
    { ngn: '₦ 20,000,000', dest: '$ 13,120.00 USD' }
  ];

  let index = 0;
  setInterval(() => {
    index = (index + 1) % mockPairs.length;
    ngnEl.style.opacity = '0';
    destEl.style.opacity = '0';

    setTimeout(() => {
      ngnEl.textContent = mockPairs[index].ngn;
      destEl.textContent = mockPairs[index].dest;
      ngnEl.style.opacity = '1';
      destEl.style.opacity = '1';
    }, 300);
  }, 4000);
}

/* --------------------------------------------------------------------------
   12. MOBILE NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
    });
  });
}

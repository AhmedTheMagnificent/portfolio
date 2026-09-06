// ============================================================================
// PORTFOLIO SCRIPT
// This file is organized into small, independent chunks. Each one does one
// job and doesn't depend on the others, so you can delete or rewrite any
// section without breaking the rest.
// ============================================================================

// A visitor who has "reduce motion" turned on in their OS gets everything
// instantly, no animation. We check this once and branch on it everywhere.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----------------------------------------------------------------------------
// 1. BOOT SEQUENCE
// Types out a few fake terminal lines into #boot-lines, then fades the boot
// screen out and reveals the real site. This is what replaces "blank page
// while everything loads".
// ----------------------------------------------------------------------------
function runBootSequence() {
  const bootScreen = document.getElementById('boot-screen');
  const bootLines = document.getElementById('boot-lines');
  const site = document.getElementById('site');

  const script = [
    { text: '$ whoami', pause: 250 },
    { text: 'ahmed_bhan', pause: 250, color: true },
    { text: '$ ./launch_portfolio.sh', pause: 300 },
    { text: 'Booting environment... done.', pause: 400 },
  ];

  // Skip straight to the real site if the visitor doesn't want motion,
  // or if they click/press a key to skip the intro.
  function finishBoot() {
    bootScreen.classList.add('is-done');
    bootScreen.setAttribute('aria-hidden', 'true');
    site.classList.remove('is-hidden');
    setTimeout(() => bootScreen.remove(), 450);
    startHeroTypewriter();
  }

  if (prefersReducedMotion) {
    finishBoot();
    return;
  }

  bootScreen.addEventListener('click', finishBoot, { once: true });
  window.addEventListener('keydown', finishBoot, { once: true });

  let lineIndex = 0;

  function typeNextLine() {
    if (lineIndex >= script.length) {
      setTimeout(finishBoot, 300);
      return;
    }

    const { text, pause } = script[lineIndex];
    const lineEl = document.createElement('div');
    lineEl.className = 'boot-line';
    bootLines.appendChild(lineEl);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      lineEl.textContent += text[charIndex];
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(typeInterval);
        lineIndex++;
        setTimeout(typeNextLine, pause);
      }
    }, 22);
  }

  typeNextLine();
}

// ----------------------------------------------------------------------------
// 2. HERO TYPEWRITER
// Types "Ahmed Bhan." into the hero heading, character by character, once
// the boot sequence hands off. This is the one "big" animated moment on the
// page — everything else stays quiet by comparison.
// ----------------------------------------------------------------------------
function startHeroTypewriter() {
  const target = document.getElementById('typed-name');
  const fullText = "Ahmed Bhan.";

  if (prefersReducedMotion) {
    target.textContent = fullText;
    return;
  }

  let i = 0;
  const interval = setInterval(() => {
    target.textContent += fullText[i];
    i++;
    if (i >= fullText.length) clearInterval(interval);
  }, 55);
}

// ----------------------------------------------------------------------------
// 3. SCROLL REVEAL
// Adds the .reveal class to each section so it's invisible until it enters
// the viewport, then IntersectionObserver flips it to visible. This is a
// browser-native way to do "animate when scrolled into view" without a
// library.
// ----------------------------------------------------------------------------
function setupScrollReveal() {
  const targets = document.querySelectorAll('.section');
  targets.forEach((el) => el.classList.add('reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // only animate in once
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
}

// ----------------------------------------------------------------------------
// 4. MOBILE NAV TOGGLE
// ----------------------------------------------------------------------------
function setupNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('nav-mobile');

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after a link is tapped.
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ----------------------------------------------------------------------------
// 5. CONTACT FORM
// There's no backend here, so this just validates the fields and shows a
// status message. To make it actually send email, see the note at the
// bottom of this file.
// ----------------------------------------------------------------------------
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      status.textContent = 'error: all fields are required.';
      status.style.color = 'var(--danger)';
      return;
    }

    // Placeholder behavior — see the note below for wiring this up for real.
    status.textContent = `message queued for ${email}. (wire this up — see script.js)`;
    status.style.color = 'var(--accent)';
    form.reset();
  });
}

// ----------------------------------------------------------------------------
// 6. FOOTER YEAR
// ----------------------------------------------------------------------------
function setupFooterYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

// ----------------------------------------------------------------------------
// INIT
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  runBootSequence();
  setupScrollReveal();
  setupNavToggle();
  setupContactForm();
  setupFooterYear();
});

// ----------------------------------------------------------------------------
// NOTE: making the contact form actually send email
// This form currently only shows a fake status message — there is no server
// to receive it. The simplest real fix, with zero backend code of your own:
//   1. Create a free form endpoint at https://formspree.io
//   2. Add action="https://formspree.io/f/YOUR_ID" method="POST" to the
//      <form id="contact-form"> tag in index.html
//   3. Delete the event.preventDefault() line above so the browser submits
//      the form normally.
// ----------------------------------------------------------------------------
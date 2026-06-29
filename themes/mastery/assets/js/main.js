(function () {
  'use strict';

  /* ─── Sticky Nav + Back-to-Top: scroll handler ─── */
  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  let ticking = false;
  if (header) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          header.classList.toggle('nav-scrolled', y > 50);
          if (backToTop) backToTop.classList.toggle('visible', y > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── Mobile Nav: burger toggle ─── */
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('navOverlay');
  const overlayLinks = overlay?.querySelectorAll('a');

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const open = overlay.classList.toggle('open');
      burger.classList.toggle('active');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    overlayLinks?.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── Scroll Reveal (IntersectionObserver) ─── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-scale, .reveal-stagger, .reveal-right, .reveal-scale-in, .reveal-fade, .reveal-blur, .reveal-scale-zoom, .reveal-clip');
  if (revealElements.length) {
    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Already visible on load — don't animate, just show
        el.classList.add('visible');
      } else {
        io.observe(el);
      }
    });
  }

  /* ─── Stat Counter ─── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.textContent.replace(/[0-9]/g, '');
    let current = 0;
    let animationId = null;
    const step = () => {
      const increment = Math.max(1, Math.ceil(target / 40));
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        return;
      }
      el.textContent = current + suffix;
      animationId = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animationId = requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  /* ─── Cookie Consent ─── */
  (function() {
    const bar = document.getElementById('cookieBar');
    const btn = document.getElementById('cookieAccept');
    if (!bar || !btn) return;
    try {
      if (localStorage.getItem('cookieConsent')) return;
    } catch (_) { /* noop */ }
    requestAnimationFrame(() => bar.classList.add('visible'));
    btn.addEventListener('click', () => {
      bar.classList.remove('visible');
      try { localStorage.setItem('cookieConsent', 'true'); } catch (_) { /* noop */ }
    });
  })();

  /* ─── Form Validation & Inline Submit ─── */
  document.querySelectorAll('.contact-form').forEach(form => {
    const inputs = form.querySelectorAll('input, textarea');
    const feedback = form.querySelector('.form-feedback');

    const validate = () => {
      let valid = true;
      inputs.forEach(input => {
        const group = input.closest('.form-group');
        if (!group) return;
        group.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        const existing = group.querySelector('.form-error');
        if (existing) existing.remove();
        const errorId = input.id + '-error';
        input.removeAttribute('aria-describedby');

        const showError = (message) => {
          valid = false;
          group.classList.add('has-error');
          input.setAttribute('aria-invalid', 'true');
          const msg = document.createElement('span');
          msg.className = 'form-error';
          msg.id = errorId;
          msg.textContent = message;
          group.appendChild(msg);
          input.setAttribute('aria-describedby', errorId);
        };

        if (input.hasAttribute('required') && !input.value.trim()) {
          const labels = {
            name: 'Name is required',
            email: 'Email is required',
            message: 'Message is required'
          };
          showError(labels[input.name] || `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`);
        } else if (input.type === 'email' && input.value.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
            showError('Please enter a valid email address');
          }
        }
      });
      return valid;
    };

    form.addEventListener('submit', e => {
      e.preventDefault();

      if (feedback) {
        feedback.className = 'form-feedback';
        feedback.textContent = '';
      }

      if (!validate()) return;

      const replyto = document.getElementById('_replyto');
      const emailInput = document.getElementById('email');
      if (replyto && emailInput) replyto.value = emailInput.value;

      const data = new FormData(form);
      data.append('_redirect', 'false');

      fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(r => r.ok ? r.json() : Promise.reject(r))
        .then(() => {
          if (feedback) {
            feedback.className = 'form-feedback is-success';
            feedback.textContent = 'Message sent! I\'ll get back to you within 24 hours.';
          }
          form.querySelectorAll('input, textarea').forEach(i => i.value = '');
        })
        .catch(() => {
          if (feedback) {
            feedback.className = 'form-feedback is-error';
            feedback.textContent = 'Something went wrong. Please try again or email me directly at hi@magento-mastery.com.';
          }
        })
        .finally(() => {
          const btn = form.querySelector('button[type="submit"]');
          if (btn) btn.disabled = false;
        });

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
    });
  });

  /* ─── Smooth anchor scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ─── Reading Progress Bar ─── */
  const progressBar = document.getElementById('postProgressBar');
  if (progressBar) {
    let progTicking = false;
    const updateProgress = () => {
      if (!progTicking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          progressBar.style.width = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) + '%' : '0%';
          progTicking = false;
        });
        progTicking = true;
      }
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ─── TOC Active Link Tracking ─── */
  const tocLinks = document.querySelectorAll('#TableOfContents a');
  if (tocLinks.length) {
    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.removeAttribute('data-active'));
          const id = entry.target.getAttribute('id');
          const link = document.querySelector(`#TableOfContents a[href="#${CSS.escape(id)}"]`);
          if (link) link.setAttribute('data-active', '');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

    document.querySelectorAll('.post-body h2[id], .post-body h3[id]').forEach(h => tocObserver.observe(h));
  }

  /* ─── Pricing → Contact: pre-fill subject from query param ─── */
  (function() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (!type) return;
    const subjectMap = {
      'single-bug': 'Single Bug Fix / Small Task — Quote Request',
      'custom-module': 'Custom Module Development — Quote Request',
      'audit': 'Full Store Audit & Optimization — Quote Request',
      'free-call': 'Free Discovery Call — Not Sure Yet'
    };
    const subject = subjectMap[type];
    if (!subject) return;
    const subjectInput = document.getElementById('subject');
    if (subjectInput) subjectInput.value = subject;
    const msgInput = document.getElementById('message');
    if (msgInput && type !== 'free-call') {
      msgInput.focus();
    }
  })();

  /* ─── Code Block Copy Button ─── */
  document.querySelectorAll('.highlight').forEach(block => {
    const btn = document.createElement('button');
    btn.className = 'highlight-copy';
    btn.textContent = 'Copy';
    btn.type = 'button';
    btn.addEventListener('click', () => {
      const code = block.querySelector('code');
      if (!code) return;
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    });
    block.appendChild(btn);
  });

})();

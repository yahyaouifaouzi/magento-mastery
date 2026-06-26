(function () {
  'use strict';

  /* ─── Fluid Island Nav ─── */
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('navOverlay');
  const overlayLinks = overlay?.querySelectorAll('a');

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const open = overlay.classList.toggle('open');
      burger.classList.toggle('active');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-scale, .reveal-stagger, .reveal-right, .reveal-scale-in');
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
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    revealElements.forEach(el => io.observe(el));
  }

  /* ─── Stat Counter ─── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const suffix = el.textContent.replace(/[0-9]/g, '');
    let current = 0;
    const step = () => {
      const increment = Math.max(1, Math.ceil(target / 40));
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        return;
      }
      el.textContent = current + suffix;
      requestAnimationFrame(step);
    };
    // Only start counting when element becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(step);
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

  /* ─── Form Validation ─── */
  document.querySelectorAll('.contact-form').forEach(form => {
    const inputs = form.querySelectorAll('input, textarea');
    form.addEventListener('submit', e => {
      let valid = true;
      inputs.forEach(input => {
        const error = input.parentElement.querySelector('.form-error');
        if (error) error.remove();
        input.style.borderColor = '';
        if (input.hasAttribute('required') && !input.value.trim()) {
          valid = false;
          input.style.borderColor = '#ef4444';
          const msg = document.createElement('span');
          msg.className = 'form-error';
          msg.style.cssText = 'font-size:0.75rem;color:#ef4444;margin-top:0.25rem;display:block;';
          msg.textContent = input.name === 'email' ? 'Email is required' : `${input.name.charAt(0).toUpperCase() + input.name.slice(1)} is required`;
          input.parentElement.appendChild(msg);
        }
        if (input.type === 'email' && input.value.trim()) {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(input.value.trim())) {
            valid = false;
            input.style.borderColor = '#ef4444';
            const msg = document.createElement('span');
            msg.className = 'form-error';
            msg.style.cssText = 'font-size:0.75rem;color:#ef4444;margin-top:0.25rem;display:block;';
            msg.textContent = 'Please enter a valid email address';
            input.parentElement.appendChild(msg);
          }
        }
      });
      if (!valid) e.preventDefault();
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

})();

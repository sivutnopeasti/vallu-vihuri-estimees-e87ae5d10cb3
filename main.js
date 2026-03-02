/* ============================================
   VALLU & VIHURI ESTIMEES — MAIN.JS
   ============================================ */

'use strict';

/* ============================================
   HAMBURGER / MOBIILINAVIGAATIO
   ============================================ */
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.hidden = false;
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      hamburger.focus();
    }
  });

  document.addEventListener('click', e => {
    if (
      hamburger.getAttribute('aria-expanded') === 'true' &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

/* ============================================
   AKTIIVINEN NAVIGAATIOLINKKI SCROLLATESSA
   ============================================ */
(function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );

  sections.forEach(section => observer.observe(section));
})();

/* ============================================
   SCROLL-ANIMAATIOT (fade-up)
   ============================================ */
(function initScrollAnimations() {
  const animatableSelectors = [
    '.service-card',
    '.benefits-list li',
    '.guarantee-item',
    '.gallery-card',
    '.section-title',
    '.section-intro',
    '.about-text',
    '.about-img-wrap',
    '.contact-intro',
    '.contact-form',
    '.hero-eyebrow',
    '.hero-content h1',
    '.hero-sub',
    '.hero-ctas'
  ];

  const elements = document.querySelectorAll(animatableSelectors.join(', '));

  elements.forEach((el, index) => {
    el.classList.add('fade-up');
    const col = index % 3;
    el.style.transitionDelay = (col * 0.08) + 's';
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================
   HEADER — VARJO SCROLLATESSA
   ============================================ */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = current;
  }, { passive: true });
})();

/* ============================================
   YHTEYDENOTTOLOMAKE — LÄHETYS JA VALIDOINTI
   ============================================ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
    statusEl.hidden = false;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideStatus() {
    statusEl.hidden = true;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  }

  function setLoadingState(isLoading) {
    const submitBtn = form.querySelector('.btn-submit');
    if (!submitBtn) return;

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Lähetetään...';
      submitBtn.style.opacity = '0.7';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || 'Lähetä tarjouspyyntö';
      submitBtn.style.opacity = '';
    }
  }

  function validateField(field) {
    const value = field.value.trim();

    if (field.required && !value) {
      return 'Tämä kenttä on pakollinen.';
    }

    if (field.type === 'email' && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'Tarkista sähköpostiosoite.';
      }
    }

    if (field.type === 'tel' && value) {
      const telPattern = /^[\d\s\+\-\(\)]{6,20}$/;
      if (!telPattern.test(value)) {
        return 'Tarkista puhelinnumero.';
      }
    }

    return null;
  }

  function markFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.style.borderColor = '#EF4444';

    let errorEl = document.getElementById('error-' + field.id);
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.id = 'error-' + field.id;
      errorEl.setAttribute('role', 'alert');
      errorEl.style.cssText = 'color:#991B1B;font-size:0.8rem;margin-top:0.25rem;display:block;';
      field.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
    field.setAttribute('aria-describedby', errorEl.id);
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.style.borderColor = '';

    const errorEl = document.getElementById('error-' + field.id);
    if (errorEl) errorEl.textContent = '';
  }

  function validateForm() {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    let firstInvalid = null;

    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        markFieldError(field, error);
        isValid = false;
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearFieldError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return isValid;
  }

  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('blur', () => {
      const error = validateField(field);
      if (error) {
        markFieldError(field, error);
      } else {
        clearFieldError(field);
      }
    });

    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        const error = validateField(field);
        if (!error) clearFieldError(field);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideStatus();

    if (!validateForm()) return;

    setLoadingState(true);

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showStatus(
          'Tarjouspyyntö lähetetty. Vastaamme kahden arkipäivän kuluessa.',
          'success'
        );
        form.reset();
        form.querySelectorAll('input, textarea, select').forEach(field => {
          clearFieldError(field);
        });
      } else {
        const data = await response.json().catch(() => ({}));
        if (data.errors) {
          showStatus(
            'Lähetys epäonnistui: ' + data.errors.map(err => err.message).join(', '),
            'error'
          );
        } else {
          showStatus(
            'Lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä suoraan sähköpostilla.',
            'error'
          );
        }
      }
    } catch (err) {
      showStatus(
        'Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.',
        'error'
      );
    } finally {
      setLoadingState(false);
    }
  });
})();

/* ============================================
   SMOOTH SCROLL — ANKKURILINKIT
   ============================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height'),
        10
      ) || 72;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();

/* ============================================
   GALLERIA — TARKENNETTAVUUS (KEYBOARD)
   ============================================ */
(function initGalleryAccessibility() {
  document.querySelectorAll('.gallery-img-wrap').forEach(wrap => {
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('role', 'img');

    const name = wrap.querySelector('.gallery-project-name');
    const location = wrap.querySelector('.gallery-project-location');

    if (name && location) {
      wrap.setAttribute(
        'aria-label',
        name.textContent.trim() + ', ' + location.textContent.trim()
      );
    }
  });
})();

/* ============================================
   CSS-LISÄYS: AKTIIVINEN NAVIGAATIOLINKKI
   ============================================ */
(function injectActiveNavStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active {
      color: var(--orange);
      background: var(--orange-pale);
    }
    .site-header.scrolled {
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(style);
})();
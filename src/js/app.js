/**
 * SOLVO Landing — app.js
 * Refactorizado de Claude Design a vanilla JS puro
 * Fiel al comportamiento original: navbar, scroll-driven, carrusel, formularios
 */

/* ═══════════════════════════════════════════════════════════════
   CONFIGURACIÓN
═══════════════════════════════════════════════════════════════ */
const CONFIG = {
  // ⚠️ Reemplazar con tus Google Form IDs reales
  FORM_HOME:      'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HOME/formResponse',
  FORM_ACCIDENTS: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_ACCIDENTS/formResponse',
  FORM_CONSUMER:  'https://docs.google.com/forms/d/e/YOUR_FORM_ID_CONSUMER/formResponse',
  CAROUSEL_INTERVAL: 4600,
};

const TESTIMONIALS = [
  { quote: '"Pensé que iba a ser un proceso eterno y complicado. Al final fue lo más simple. Luciano me explicó todo, resolvió todo, y listo. No tengo palabras."', name: 'Martín V.', initial: 'M' },
  { quote: '"Mi viejo falleció y no sabía ni por dónde empezar con la sucesión. Pablo nos llevó de la mano. Hoy todo está en orden."', name: 'Graciela M.', initial: 'G' },
  { quote: '"Me despidieron sin justificación. Pensé que perdía todo. Luciano peleó y ganamos. Más que ganar: me devolvieron la confianza."', name: 'Jorge D.', initial: 'J' },
  { quote: '"Iba a firmar un contrato que me perjudicaba sin que yo lo supiera. Pablo me lo explicó punto por punto, con toda la paciencia. Ahora duermo tranquilo."', name: 'Paula N.', initial: 'P' },
];


/* ═══════════════════════════════════════════════════════════════
   NAVBAR — hide/show en scroll + compact + mobile menu
═══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  let lastScroll = 0;
  let isOpen = false;

  // Scroll: compact + hide/show
  window.addEventListener('scroll', () => {
    const curr = window.scrollY;
    if (curr > 60) {
      navbar.classList.add('compact');
      if (curr > lastScroll && curr > 200) navbar.classList.add('hidden');
      else navbar.classList.remove('hidden');
    } else {
      navbar.classList.remove('compact', 'hidden');
    }
    lastScroll = Math.max(0, curr);
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      mobileMenu.classList.toggle('open', isOpen);
    });

    // Cerrar al hacer click en un link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        isOpen = false;
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Cerrar en resize > 768px
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen) {
      isOpen = false;
      mobileMenu?.classList.remove('open');
    }
  });
}


/* ═══════════════════════════════════════════════════════════════
   SCROLL-DRIVEN FADE-IN + PROCESO STICKY REVEAL
   Fiel al algoritmo original del Claude Design
═══════════════════════════════════════════════════════════════ */
function initScrollDriven() {
  let sdCache = null;
  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    const isDesktop = window.innerWidth >= 768;

    // Cache elements
    if (!sdCache) {
      sdCache = [...document.querySelectorAll('.fade-in')];
    }

    // 1. General fade-in por scroll (todos excepto proceso en desktop)
    sdCache.forEach(el => {
      if (isDesktop && el.closest('#proceso') && el.id !== 'proceso-title') return;
      if (el.dataset.revealed === '1') return;

      const isCard = el.classList.contains('svc-card') || el.classList.contains('glass-card');
      const rect   = el.getBoundingClientRect();
      const delay  = parseFloat(getComputedStyle(el).getPropertyValue('--sa-delay') || '0');
      const enterFrom = vh + 10;
      const enterTo   = vh * 0.42 - delay * 50;
      const progress  = Math.max(0, Math.min(1, (enterFrom - rect.top) / (enterFrom - enterTo)));

      if (progress >= 0.99) {
        el.style.opacity = '1';
        if (isCard) el.style.filter = 'blur(0px)';
        el.dataset.revealed = '1';
      } else {
        el.style.opacity = progress;
        if (isCard) el.style.filter = `blur(${(1 - progress) * 5}px)`;
      }
    });

    // 2. Proceso sticky reveal (desktop solamente)
    if (isDesktop) {
      const wrapper = document.getElementById('proceso-scroll-wrapper');
      if (wrapper) {
        const wRect       = wrapper.getBoundingClientRect();
        const totalScroll = wrapper.offsetHeight - vh;
        const scrolled    = Math.max(0, -wRect.top);
        const p           = totalScroll > 0 ? Math.min(1, scrolled / totalScroll) : 0;

        const anim = (id, s, e) => {
          const el = document.getElementById(id);
          if (!el || el.dataset.revealed === '1') return;
          const ep = Math.max(0, Math.min(1, (p - s) / Math.max(0.001, e - s)));
          if (ep >= 0.99) { el.style.opacity = '1'; el.dataset.revealed = '1'; }
          else             { el.style.opacity = ep; }
        };

        anim('step-1',      0.00, 0.22);
        anim('connector-1', 0.18, 0.30);
        anim('step-2',      0.26, 0.48);
        anim('connector-2', 0.44, 0.56);
        anim('step-3',      0.52, 0.74);
        anim('connector-3', 0.70, 0.82);
        anim('step-4',      0.78, 1.00);
      }
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { sdCache = null; requestAnimationFrame(update); });
  requestAnimationFrame(update); // Initial pass
}


/* ═══════════════════════════════════════════════════════════════
   CARRUSEL DE TESTIMONIOS (mobile)
═══════════════════════════════════════════════════════════════ */
function initCarousel() {
  const card    = document.getElementById('tCarousel');
  const quoteEl = document.getElementById('tQuote');
  const nameEl  = document.getElementById('tName');
  const initEl  = document.getElementById('tInitial');
  const dotsEl  = document.getElementById('tDots');
  if (!card || !quoteEl) return;

  let current = 0;

  const update = (idx) => {
    const t = TESTIMONIALS[idx];
    card.style.opacity   = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = 'opacity 350ms ease, transform 350ms ease';

    setTimeout(() => {
      quoteEl.textContent = t.quote;
      nameEl.textContent  = t.name;
      initEl.textContent  = t.initial;
      card.style.opacity  = '1';
      card.style.transform = 'translateY(0)';
    }, 180);

    if (dotsEl) {
      dotsEl.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });
    }
  };

  setInterval(() => {
    current = (current + 1) % TESTIMONIALS.length;
    update(current);
  }, CONFIG.CAROUSEL_INTERVAL);
}


/* ═══════════════════════════════════════════════════════════════
   FORMULARIOS — Validación real-time + envío a Google Forms
═══════════════════════════════════════════════════════════════ */
function initForms() {
  document.querySelectorAll('form').forEach(form => {
    // Validación inline
    form.querySelectorAll('.form-input[required]').forEach(input => {
      input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.classList.add('invalid');
      });
      input.addEventListener('input', () => {
        if (input.checkValidity()) input.classList.remove('invalid');
      });
    });

    // Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Verificar campos inválidos
      const invalids = [...form.querySelectorAll('.form-input[required]')].filter(f => !f.checkValidity());
      if (invalids.length > 0) {
        invalids.forEach(f => f.classList.add('invalid'));
        invalids[0].focus();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn?.textContent ?? '';

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
        btn.style.opacity = '0.75';
      }

      try {
        // Enviar a Google Forms (no-cors — no hay response body, es el comportamiento normal)
        const formData = new FormData(form);
        if (form.action && !form.action.includes('YOUR_FORM_ID')) {
          await fetch(form.action, { method: 'POST', body: formData, mode: 'no-cors' });
        }

        // Éxito
        if (btn) {
          btn.textContent = '✓ ¡Consulta enviada!';
          btn.style.background = '#1a6e3c';
          btn.style.opacity = '1';
        }
        form.reset();
        form.querySelectorAll('.form-input').forEach(f => f.classList.remove('invalid'));

        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
            btn.style.background = '';
          }
        }, 3000);

      } catch {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
          btn.style.opacity = '1';
        }
        alert('Hubo un error. Por favor escribinos directamente a solvolegal.contacto@gmail.com');
      }
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollDriven();
  initCarousel();
  initForms();
  console.log('✅ SOLVO Landing inicializado');
});

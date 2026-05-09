// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== NAV MOBILE TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== FADE-IN OBSERVER =====
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach(el => fadeObserver.observe(el));

// ===== ANIMATED COUNTERS =====
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString('es');
  }, 16);
}

const statsBar = document.querySelector('.stats-bar');
let countersStarted = false;
const statsObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.counter').forEach(el => {
      animateCounter(el, parseInt(el.dataset.target));
    });
  }
}, { threshold: 0.4 });
if (statsBar) statsObserver.observe(statsBar);

// ===== SERVICE TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');

    // Re-trigger fade animations in new panel
    document.querySelectorAll(`#tab-${target} .fade-in`).forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => fadeObserver.observe(el), 50);
    });
  });
});

// ===== TESTIMONIALS SLIDER =====
const track = document.getElementById('testimonialsTrack');
const dotsContainer = document.getElementById('sliderDots');
const cards = track ? track.querySelectorAll('.testimonial-card') : [];
let currentSlide = 0;
let autoSlideTimer;

function getVisibleCount() {
  if (window.innerWidth <= 480) return 1;
  if (window.innerWidth <= 768) return 1;
  return 3;
}

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  const total = cards.length - getVisibleCount() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(index) {
  const visible = getVisibleCount();
  const max = cards.length - visible;
  currentSlide = Math.max(0, Math.min(index, max));
  const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0;
  track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
  document.querySelectorAll('.slider-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() {
  const visible = getVisibleCount();
  const max = cards.length - visible;
  goToSlide(currentSlide >= max ? 0 : currentSlide + 1);
}

function prevSlide() {
  const visible = getVisibleCount();
  const max = cards.length - visible;
  goToSlide(currentSlide <= 0 ? max : currentSlide - 1);
}

function startAutoSlide() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(nextSlide, 4500);
}

if (track && cards.length) {
  buildDots();
  startAutoSlide();
  document.getElementById('nextBtn')?.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
  document.getElementById('prevBtn')?.addEventListener('click', () => { prevSlide(); startAutoSlide(); });
  window.addEventListener('resize', () => { buildDots(); goToSlide(0); });
}

// ===== PROCESS TIMELINE INTERACTIVE =====
const processSteps = document.querySelectorAll('.process-step');
processSteps.forEach((step, i) => {
  step.style.cursor = 'default';
  step.addEventListener('mouseenter', () => {
    step.querySelector('.step-icon').style.transform = 'scale(1.12)';
    step.querySelector('.step-icon').style.transition = '0.3s';
  });
  step.addEventListener('mouseleave', () => {
    step.querySelector('.step-icon').style.transform = 'scale(1)';
  });
});

// ===== FORM VALIDATION =====
const form = document.getElementById('appointmentForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const fields = [
      { id: 'nombre', msg: 'El nombre es requerido.' },
      { id: 'telefono', msg: 'El teléfono es requerido.' },
      { id: 'especialidad', msg: 'Selecciona una especialidad.' },
    ];

    fields.forEach(({ id, msg }) => {
      const input = document.getElementById(id);
      const error = document.getElementById(`${id}Error`);
      const empty = !input?.value.trim();
      if (error) error.textContent = empty ? msg : '';
      if (input) input.classList.toggle('error', empty);
      if (empty) valid = false;
    });

    // Phone format check
    const phone = document.getElementById('telefono');
    if (phone && phone.value && !/[\d\s\-\+\(\)]{7,}/.test(phone.value)) {
      document.getElementById('telefonoError').textContent = 'Ingresa un teléfono válido.';
      phone.classList.add('error');
      valid = false;
    }

    if (valid) {
      const btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.72 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.62 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91a16 16 0 006.29 6.29l1.27-.96a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> Enviar Solicitud`;
        btn.disabled = false;
        document.getElementById('formSuccess').classList.add('show');
        setTimeout(() => document.getElementById('formSuccess').classList.remove('show'), 5000);
      }, 1400);
    }
  });

  // Clear errors on input
  ['nombre', 'telefono', 'especialidad'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      document.getElementById(`${id}Error`).textContent = '';
      document.getElementById(id).classList.remove('error');
    });
  });
}

// ===== SET MIN DATE FOR DATE INPUT =====
const dateInput = document.getElementById('fecha');
if (dateInput) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id], div[id="contacto"]');
const navLinkEls = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.id;
  });
  navLinkEls.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--blue)' : '';
    link.style.background = link.getAttribute('href') === `#${current}` ? 'rgba(27,108,168,.06)' : '';
  });
});

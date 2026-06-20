// ── Helpers ──
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── NAV: scroll shrink ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 40
      ? 'rgba(14,26,19,0.99)'
      : 'rgba(14,26,19,0.96)';
  });
}

// ── NAV: hamburger ──
const hamburger = document.getElementById('hamburger');
if (hamburger && navbar) {
  hamburger.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navbar.classList.remove('open'));
  });
}

// ── CTA buttons (reemplaza onclick inline) ──
document.querySelectorAll('[data-scroll-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    navbar?.classList?.remove('open');
    scrollToId(btn.getAttribute('data-scroll-target'));
  });
});

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// ── FORM VALIDATION ──
const form = document.getElementById('contactForm');
const btnSubmit = document.getElementById('btn-submit');
const formSuccess = document.getElementById('form-success');

function setError(fieldId, errId, show) {
  const field = document.getElementById(fieldId);
  const err = document.getElementById(errId);
  if (!field || !err) return;

  if (show) {
    field.classList.add('error');
    err.classList.add('show');
  } else {
    field.classList.remove('error');
    err.classList.remove('show');
  }
  return !show;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\+\-\(\)]{7,}$/.test(phone.trim());
}

if (form) {
  const nombre = document.getElementById('nombre');
  const correo = document.getElementById('correo');
  const select = document.getElementById('select');
  const telefono = document.getElementById('telefono');
  const mensaje = document.getElementById('mensaje');


  if (nombre) {
    nombre.addEventListener('input', function() {
      setError('nombre', 'err-nombre', this.value.trim().length < 3);
    });
  }

  if (correo) {
    correo.addEventListener('input', function() {
      setError('correo', 'err-correo', !validateEmail(this.value.trim()));
    });
  }

  if (select) {
    select.addEventListener('change', function() {
      setError('select', 'err-select', !this.value);
    });
  }

  if (telefono) {
    telefono.addEventListener('input', function() {
      setError('telefono', 'err-telefono', !validatePhone(this.value));
    });
  }

  if (mensaje) {
    mensaje.addEventListener('input', function() {
      setError('mensaje', 'err-mensaje', this.value.trim().length < 10);
    });
  }

  form.addEventListener('submit', function(e) {
    // 1) Validar y prevenir si hay errores
    const nombreVal   = nombre?.value.trim() ?? '';
    const correoVal   = correo?.value.trim() ?? '';
    const telefonoVal = telefono?.value.trim() ?? '';
    const mensajeVal  = mensaje?.value.trim() ?? '';

    const v1 = setError('nombre',   'err-nombre',   nombreVal.length < 3);
    const v2 = setError('correo',   'err-correo',   !validateEmail(correoVal));
    const v3 = setError('telefono', 'err-telefono', !validatePhone(telefonoVal));
    const v4 = setError('mensaje',  'err-mensaje',  mensajeVal.length < 10);
    const v5 = setError('select',   'err-select',   !select?.value);

    if (!v1 || !v2 || !v3 || !v4 || !v5) {
      e.preventDefault();
      return;
    }

    // 2) UI: mostrar loader/ocultar success
    const formLoading = document.getElementById('form-loading');
    if (formLoading) formLoading.style.display = 'block';
    if (formSuccess) formSuccess.classList.remove('show');

    // 3) Dejar el formulario en blanco inmediatamente
    form.reset();

    // 4) Reset visual de errores y botón
    ['nombre','telefono','correo','select','mensaje'].forEach((id) => {
      if (id === 'mensaje') setError('mensaje', 'err-mensaje', false);
      if (id === 'nombre') setError('nombre', 'err-nombre', false);
      if (id === 'telefono') setError('telefono', 'err-telefono', false);
      if (id === 'correo') setError('correo', 'err-correo', false);
      if (id === 'select') setError('select', 'err-select', false);
    });

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando…';
    }

    // 5) Mostrar éxito después de un pequeño delay (para que el usuario vea confirmación)
    //    Si Netlify tarda más, esto evita que “no aparezca nada”.
    window.setTimeout(() => {
      if (formLoading) formLoading.style.display = 'none';
      // Mostrar éxito sin bloquear el reset del formulario.
      if (formSuccess) formSuccess.classList.add('show');
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Enviar mensaje';
      }
    }, 1200);


  });
}


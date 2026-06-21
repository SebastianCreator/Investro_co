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

function getTextareaValue(el) {
  if (!el) return '';
  return (el.value ?? '').toString();
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

  // Debug opcional: confirmar que estamos leyendo el textarea correcto
  console.log('[contactForm] textarea#mensaje found:', !!mensaje);


  form.addEventListener('submit', function(e) {
    console.log('[contactForm] submit event fired');

    // 1) Validar
    const nombreVal   = nombre?.value.trim() ?? '';
    const correoVal   = correo?.value.trim() ?? '';
    const telefonoVal = telefono?.value.trim() ?? '';
    const mensajeVal  = mensaje?.value.trim() ?? '';
    const selectVal   = select?.value ?? '';

    const nombreOk   = nombreVal.length >= 3;
    const correoOk   = validateEmail(correoVal);
    const telefonoOk = validatePhone(telefonoVal);
    const mensajeOk  = mensajeVal.length >= 10;
    const selectOk   = !!selectVal;

    // Renderizar errores (show = !ok)
    setError('nombre',   'err-nombre',   !nombreOk);
    setError('correo',   'err-correo',   !correoOk);
    setError('telefono', 'err-telefono', !telefonoOk);
    setError('mensaje',  'err-mensaje',  !mensajeOk);
    setError('select',   'err-select',   !selectOk);

    const allOk = nombreOk && correoOk && telefonoOk && mensajeOk && selectOk;

    // Si alguno falla, NO se envía
    if (!allOk) {
      console.warn('[contactForm] validation failed', {
        nombreValLen: nombreVal.length,
        correoOk,
        telefonoOk,
        mensajeValLen: mensajeVal.length,
        selectVal,
        nombreOk,
        allOk
      });
      e.preventDefault();
      return;
    }

    // Ya pasó la validación: controlamos el submit para asegurar:
    // - que se envíe a Netlify
    // - que se muestre éxito
    // - que el formulario quede en blanco
    e.preventDefault();


    const formLoading = document.getElementById('form-loading');
    if (formLoading) formLoading.style.display = 'block';
    if (formSuccess) formSuccess.classList.remove('show');

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Enviando…';
    }

    const formData = new FormData(form);

    // Netlify Forms acepta este endpoint cuando usas data-netlify + name
    const endpoint = '/';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
      .then((res) => {
        console.log('[contactForm] fetch status:', res.status);
        // Netlify típicamente retorna 200/201 si la captura fue bien.
        if (!res.ok) throw new Error('Network response was not ok');
        return res;
      })
      .then(() => {
        // Form en blanco + mensaje
        form.reset();

        // Ocultar errores
        ['nombre','telefono','correo','select','mensaje'].forEach((id) => {
          if (id === 'mensaje') setError('mensaje', 'err-mensaje', false);
          if (id === 'nombre') setError('nombre', 'err-nombre', false);
          if (id === 'telefono') setError('telefono', 'err-telefono', false);
          if (id === 'correo') setError('correo', 'err-correo', false);
          if (id === 'select') setError('select', 'err-select', false);
        });

        if (formLoading) formLoading.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');

        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Enviar mensaje';
        }
      })
      .catch((err) => {
        console.error('[contactForm] fetch error:', err);
        if (formLoading) formLoading.style.display = 'none';
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Enviar mensaje';
        }

        const errMsg = document.getElementById('form-error');
        if (errMsg) errMsg.classList.add('show');
        else alert('No se pudo enviar el formulario. Reintenta por favor.');
      });
  });
}


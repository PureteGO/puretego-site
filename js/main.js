/* =====================================================
   PureteGO Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all modules
  initMobileMenu();
  initHeaderScroll();
  initScrollAnimations();
  initSmoothScroll();
  initFAQ();
  initDailyVerse();
  initScrollUp();
  initConsultationModal();
  initAuditoriaModal();
  initPlanModals();
  handleSuccessMessage();
  initHeroSlideshow();
  initCounters();
});

/* ===== Hero Dynamic Slideshow ===== */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const textItems = document.querySelectorAll('.hero-text-item');
  if (!slides.length) return;

  let currentSlide = 0;
  function nextSlide() {
    // Background Slide
    slides[currentSlide].classList.remove('active');
    // Text Item
    if (textItems[currentSlide]) textItems[currentSlide].classList.remove('active');

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add('active');
    if (textItems[currentSlide]) textItems[currentSlide].classList.add('active');
  }

  setInterval(nextSlide, 8000);
}

/* ===== Mobile Menu Toggle ===== */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (!menuToggle || !navList) return;

  menuToggle.addEventListener('click', function () {
    navList.classList.toggle('active');
    menuToggle.classList.toggle('active');

    const spans = menuToggle.querySelectorAll('span');
    if (menuToggle.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
      menuToggle.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

/* ===== Header Scroll Effect ===== */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => observer.observe(el));
}

/* ===== Smooth Scroll ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

/* ===== WhatsApp Helper ===== */
function openWhatsApp(message = '') {
  const phoneNumber = '595983500802';
  const encodedMessage = encodeURIComponent(message || '¡Hola! 👋 Vi su sitio web y me interesa saber cómo pueden ayudarme a posicionar mi negocio en Google.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/* ===== Counter Animation ===== */
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  function update() {
    start += increment;
    if (start < target) {
      element.textContent = '+' + Math.floor(start).toLocaleString('es-PY');
      requestAnimationFrame(update);
    } else {
      element.textContent = '+' + target.toLocaleString('es-PY');
    }
  }
  update();
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.counter));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => observer.observe(counter));
}

/* ===== FAQ Accordion ===== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      faqItems.forEach(otherItem => { if (otherItem !== item) otherItem.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });
}

/* ===== Daily Bible Verse ===== */
function initDailyVerse() {
  const verseContainer = document.getElementById('daily-verse');
  if (!verseContainer) return;
  const verses = [
    { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
    { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz, y no de mal.", ref: "Jeremías 29:11" },
    { text: "El Señor es mi pastor, nada me faltará.", ref: "Salmo 23:1" },
    { text: "Confía en el Señor con todo tu coração, y no te apoyes en tu propia prudencia.", ref: "Proverbios 3:5" },
    { text: "Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.", ref: "Mateo 11:28" }
  ];
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const verse = verses[dayOfYear % verses.length];
  verseContainer.innerHTML = `<span class="verse-text">"${verse.text}"</span> <span class="verse-ref">— ${verse.ref}</span>`;
}

/* ===== Scroll Up Button ===== */
function initScrollUp() {
  const scrollUp = document.getElementById('scroll-up');
  if (!scrollUp) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY >= 400) scrollUp.classList.add('show');
    else scrollUp.classList.remove('show');
  });
  scrollUp.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* ===== Auditoria B2B Modal Logic ===== */
function initAuditoriaModal() {
  const modal = document.getElementById('modalAuditoria');
  const btnsOpen = document.querySelectorAll('.btn-auditoria');
  const btnClose = document.querySelector('.modal-close-auditoria');
  const btnCancel = document.querySelector('.btn-cancelar-auditoria');
  const formElement = document.getElementById('formAuditoria');
  const inputPlan = document.getElementById('inputPlanAuditoria');

  if (!modal || !btnsOpen.length) return;

  btnsOpen.forEach(btn => {
    btn.addEventListener('click', function () {
      const plan = this.getAttribute('data-plan');
      if (inputPlan) inputPlan.value = plan;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // if(formElement) formElement.reset(); // Don't reset if we want to show success view
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  if (formElement) {
    formElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(formElement);
      formData.append('form_type', 'Auditoría B2B');

      fetch('php/send-mail.php', { method: 'POST', body: formData }).catch(err => console.error(err));

      let message = `¡Hola! 👋 Solicito una *Auditoría Digital* para o plano *${formData.get('plan_seleccionado')}*.\n\n`;
      message += `*Empresa:* ${formData.get('empresa')}\n*Rubro:* ${formData.get('rubro')}\n*Sitio Web:* ${formData.get('sitio_web') || 'No tiene'}\n*WhatsApp:* ${formData.get('whatsapp')}`;

      showSuccessView('modalAuditoria', formData, message);
    });
  }
}

/* ===== Consultation Modal Logic ===== */
function initConsultationModal() {
  const modal = document.getElementById('modalConsultoria');
  const btnsOpen = [
    document.getElementById('btnConsultoria'),
    document.getElementById('btnHeroConsultoria'),
    document.getElementById('btnCTA')
  ];
  const btnClose = document.querySelector('.modal-close-consultoria');
  const btnCancel = document.getElementById('btnCancelar');
  const formElement = document.getElementById('formConsultoria');

  if (!modal || !btnsOpen.some(btn => btn)) return;

  btnsOpen.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  const phoneInput = document.getElementById('telefono');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^\d+]/g, '');
    });
  }

  if (formElement) {
    formElement.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(formElement);
      formData.append('form_type', 'Consultoría Gratuita');

      fetch('php/send-mail.php', { method: 'POST', body: formData }).catch(err => console.error(err));

      let message = `¡Hola! 👋 Nueva Solicitud de Consultoría Directa:\n\n`;
      message += `*Nombre:* ${formData.get('nombre')}\n*WhatsApp:* ${formData.get('telefono')}\n*Email:* ${formData.get('email')}\n*Empresa:* ${formData.get('empresa')}\n*Dirección:* ${formData.get('direccion')}\n*Cargo:* ${formData.get('cargo')}`;

      showSuccessView('modalConsultoria', formData, message);
    });
  }
}

/* ===== Success View Display ===== */
function showSuccessView(modalId, data, waMessage) {
  const modal = document.getElementById(modalId);
  const modalBody = modal.querySelector('.modal-body-consultoria');
  if (!modalBody) return;

  let summaryHtml = '';
  const fieldsToDisplay = {
    'nombre': 'Nombre',
    'empresa': 'Empresa',
    'rubro': 'Rubro',
    'telefono': 'WhatsApp',
    'whatsapp': 'WhatsApp',
    'plan_seleccionado': 'Plan Interesado'
  };

  for (const [key, label] of Object.entries(fieldsToDisplay)) {
    if (data.get(key)) {
      summaryHtml += `<div class="summary-item"><strong>${label}</strong>${data.get(key)}</div>`;
    }
  }

  modalBody.innerHTML = `
    <div class="success-view">
      <div class="success-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
      <h3>¡Solicitud Enviada!</h3>
      <p>Hemos recibido tus datos correctamente e iniciaremos el análisis subito.</p>
      <div class="success-summary"><span class="summary-title">Resumen de tu solicitud</span>${summaryHtml}</div>
      <div class="whatsapp-nudge">
        <p>¿Prefieres una respuesta inmediata?</p>
        <a href="https://wa.me/595983500802?text=${encodeURIComponent(waMessage)}" target="_blank" class="btn-whatsapp-success">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
           Iniciar Chat con Especialista
        </a>
      </div>
    </div>`;

  const modalHeader = modal.querySelector('.modal-header-consultoria h2');
  if (modalHeader) modalHeader.textContent = 'Envío Exitoso';
}

/* ===== Success Message Handling (URL Params) ===== */
function handleSuccessMessage() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('consultoria') === 'success') {
    alert('¡Gracias! Su solicitud ha sido enviada exitosamente.');
    window.history.replaceState({}, '', window.location.pathname);
  }
}

/* ===== Plan Details Modal Logic ===== */
function initPlanModals() {
  const modals = document.querySelectorAll('.modal-plan');
  const btnsOpen = document.querySelectorAll('.btn-details');
  const btnsClose = document.querySelectorAll('.modal-close-plan');

  if (!btnsOpen.length) return;

  btnsOpen.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const planId = this.getAttribute('data-plan-target');
      const modal = document.getElementById(planId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  btnsClose.forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = this.closest('.modal-plan');
      closeModal(modal);
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modal);
    });
  });
}

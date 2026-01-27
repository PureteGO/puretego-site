/* =====================================================
   PureteGO Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all modules
  initMobileMenu();
  initHeaderScroll();
  initScrollAnimations();
  initSmoothScroll();
});

/* ===== Mobile Menu Toggle ===== */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');

  if (!menuToggle || !navList) return;

  menuToggle.addEventListener('click', function () {
    navList.classList.toggle('active');
    menuToggle.classList.toggle('active');

    // Animate hamburger to X
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

  // Close menu on link click
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

  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide/show header on scroll (optional)
    // if (currentScroll > lastScroll && currentScroll > 200) {
    //   header.style.transform = 'translateY(-100%)';
    // } else {
    //   header.style.transform = 'translateY(0)';
    // }

    lastScroll = currentScroll;
  });
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

  if (!animatedElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

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

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/* ===== WhatsApp Helper ===== */
function openWhatsApp(message = '') {
  const phoneNumber = '595983500802';
  const encodedMessage = encodeURIComponent(message || '¡Hola! 👋 Vi su sitio web y me interesa saber cómo pueden ayudarme a posicionar mi negocio en Google. ¿Podemos agendar una consultoría gratuita?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/* ===== Form to WhatsApp Redirect ===== */
function handleContactForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    let message = '¡Hola! 👋 Me contacto desde su sitio web y estoy interesado/a en sus servicios de marketing digital.\n\n';

    formData.forEach((value, key) => {
      if (value) {
        message += `*${key}:* ${value}\n`;
      }
    });

    openWhatsApp(message);
  });
}

/* ===== Counter Animation ===== */
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  function update() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  update();
}

/* ===== Initialize Counters on Scroll ===== */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.counter);
        animateCounter(entry.target, target);
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
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
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
    { text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", ref: "Proverbios 3:5" },
    { text: "Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.", ref: "Mateo 11:28" },
    { text: "El amor es paciente, es bondadoso.", ref: "1 Corintios 13:4" },
    { text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", ref: "Mateo 6:33" },
    { text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.", ref: "Isaías 41:10" },
    { text: "El Señor es mi luz y mi salvación; ¿de quién temeré?", ref: "Salmo 27:1" },
    { text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.", ref: "Juan 3:16" },
    { text: "Esfuérzate y sé valiente; no tengas miedo ni te desanimes.", ref: "Josué 1:9" },
    { text: "La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da.", ref: "Juan 14:27" },
    { text: "Encomienda al Señor tu camino, confía en él, y él actuará.", ref: "Salmo 37:5" },
    { text: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", ref: "Salmo 46:1" },
    { text: "He aquí, yo estoy con vosotros todos los días, hasta el fin del mundo.", ref: "Mateo 28:20" },
    { text: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.", ref: "Salmo 91:1" },
    { text: "Bendito el varón que confía en el Señor, y cuya confianza es el Señor.", ref: "Jeremías 17:7" },
    { text: "Las misericordias del Señor son nuevas cada mañana; grande es tu fidelidad.", ref: "Lamentaciones 3:23" },
    { text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.", ref: "Romanos 8:28" },
    { text: "Porque donde están dos o tres reunidos en mi nombre, allí estoy yo en medio de ellos.", ref: "Mateo 18:20" },
    { text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", ref: "Salmo 119:105" },
    { text: "Yo soy el camino, la verdad y la vida.", ref: "Juan 14:6" },
    { text: "Señor, tú me has examinado y conocido.", ref: "Salmo 139:1" },
    { text: "Deléitate en el Señor, y él te concederá las peticiones de tu corazón.", ref: "Salmo 37:4" },
    { text: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones.", ref: "Filipenses 4:7" },
    { text: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.", ref: "Mateo 7:7" },
    { text: "El Señor te bendiga y te guarde.", ref: "Números 6:24" },
    { text: "Es por gracia que ustedes han sido salvados mediante la fe.", ref: "Efesios 2:8" },
    { text: "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad.", ref: "Gálatas 5:22" },
    { text: "Todo tiene su tiempo, y todo lo que se quiere debajo del cielo tiene su hora.", ref: "Eclesiastés 3:1" },
    { text: "De cierto, de cierto os digo: El que oye mi palabra y cree al que me envió, tiene vida eterna.", ref: "Juan 5:24" }
  ];

  // Get day of year to select verse
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const verse = verses[dayOfYear % verses.length];
  verseContainer.innerHTML = `<span class="verse-text">"${verse.text}"</span> <span class="verse-ref">— ${verse.ref}</span>`;
}

/* ===== Scroll Up Button ===== */
function initScrollUp() {
  const scrollUp = document.getElementById('scroll-up');
  if (!scrollUp) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY >= 400) {
      scrollUp.classList.add('show');
    } else {
      scrollUp.classList.remove('show');
    }
  });

  scrollUp.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Initialize FAQ, Daily Verse and Scroll Up on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  initFAQ();
  initDailyVerse();
  initScrollUp();
});

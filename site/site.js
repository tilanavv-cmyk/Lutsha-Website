const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="/assets/icons.svg#${name}"></use></svg>`;

const navItems = [
  ['Home', '/'],
  ['Solutions', '/solutions/'],
  ['Lutsha Beyond', '/lutsha-beyond/'],
  ['Enrolments', '/enrolments/'],
  ['Join Us', '/join-us/'],
  ['Contact Us', '/contact/'],
];

function normalisePath(path) {
  if (!path.endsWith('/')) return `${path}/`;
  return path;
}

function ensureOfficialFavicon() {
  const href = '/assets/lutsha-favicon.png';
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.type = 'image/png';
  favicon.href = href;

  let appleTouch = document.querySelector('link[rel="apple-touch-icon"]');
  if (!appleTouch) {
    appleTouch = document.createElement('link');
    appleTouch.rel = 'apple-touch-icon';
    document.head.appendChild(appleTouch);
  }
  appleTouch.href = href;
}

function renderHeader() {
  const target = document.querySelector('[data-site-header]');
  if (!target) return;
  const current = normalisePath(window.location.pathname);
  const nav = navItems.map(([label, path]) => {
    const active = current === path || (path !== '/' && current.startsWith(path));
    return `<a class="nav-link ${active ? 'nav-link--active' : ''}" href="${path}">${label}</a>`;
  }).join('');
  const mobile = navItems.map(([label, path]) => {
    const active = current === path || (path !== '/' && current.startsWith(path));
    return `<a class="mobile-nav-link ${active ? 'mobile-nav-link--active' : ''}" href="${path}">${label}</a>`;
  }).join('');

  target.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="trust-bar">
      <div class="container trust-bar__inner">
        <span>QCTO-accredited Skills Development Provider</span>
        <span class="trust-bar__number">Accreditation: 05-QCTO/SDP170326123055</span>
        <div class="trust-bar__links">
          <a href="mailto:study@lutsha.org.za">${icon('mail','icon--small')} study@lutsha.org.za</a>
          <a href="tel:+27731789245">${icon('phone','icon--small')} 073 178 9245</a>
          <div class="trust-bar__social" aria-label="Lutsha social media">
            <a href="https://www.instagram.com/lutsha_training/" target="_blank" rel="noreferrer" aria-label="Lutsha Training on Instagram" title="Instagram">${icon('instagram','icon--small')}</a>
            <a href="https://www.facebook.com/people/Lutsha-Empowerment/61579402142779/" target="_blank" rel="noreferrer" aria-label="Lutsha Empowerment on Facebook" title="Facebook">${icon('facebook','icon--small')}</a>
          </div>
        </div>
      </div>
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="Lutsha home"><img src="/assets/lutsha-logo.png" alt="Lutsha Institute of Professional Learning"></a>
        <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="header-actions">
          <a class="button button--ghost button--small hide-tablet" href="https://bookings.lutsha.org.za/" target="_blank" rel="noreferrer">${icon('calendar','icon--small')} Book assessment</a>
          <a class="button button--portal button--small" href="https://study.lutsha.org.za/" target="_blank" rel="noreferrer">${icon('book','icon--small')} Programmes & Apply</a>
          <button class="menu-button" type="button" aria-expanded="false" aria-label="Open navigation">${icon('menu')}</button>
        </div>
      </div>
      <div class="mobile-nav-panel" hidden>
        <div class="container"><a class="mobile-nav-link mobile-nav-link--portal" href="https://study.lutsha.org.za/" target="_blank" rel="noreferrer">Explore all programmes & apply ${icon('arrow-right','icon--small')}</a>${mobile}<a class="mobile-nav-link" href="https://bookings.lutsha.org.za/" target="_blank" rel="noreferrer">Book an assessment ${icon('arrow-right','icon--small')}</a></div>
      </div>
    </header>`;

  const button = target.querySelector('.menu-button');
  const panel = target.querySelector('.mobile-nav-panel');
  button?.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    button.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    button.innerHTML = open ? icon('menu') : icon('close');
    panel.hidden = open;
  });
}

function renderFooter() {
  const target = document.querySelector('[data-site-footer]');
  if (!target) return;
  target.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <img src="/assets/lutsha-logo.png" alt="Lutsha Institute of Professional Learning">
          <p>Practical, accessible and industry-linked learning pathways that help people build confident futures.</p>
          <div class="accreditation-badge"><img src="/assets/qcto-logo.webp" alt="Quality Council for Trades and Occupations"><span>SDP accreditation<br><strong>05-QCTO/SDP170326123055</strong></span></div>
        </div>
        <div><h3>Explore</h3><div class="footer-links"><a class="footer-portal-link" href="https://study.lutsha.org.za/" target="_blank" rel="noreferrer">${icon('book','icon--small')} All programmes & apply</a>${navItems.map(([label,path]) => `<a href="${path}">${label}</a>`).join('')}<a href="https://bookings.lutsha.org.za/" target="_blank" rel="noreferrer">Assessment booking portal</a></div></div>
        <div><h3>Contact</h3><div class="footer-contact"><a href="tel:+27731789245">${icon('phone')} 073 178 9245</a><a href="mailto:study@lutsha.org.za">${icon('mail')} study@lutsha.org.za</a><a href="mailto:info@lutsha.org.za">${icon('mail')} info@lutsha.org.za</a><span>${icon('map-pin')} 53 Marine Drive, First Floor, Tiger Wheel &amp; Tyre Building, Shelly Beach, 4265</span></div></div>
        <div><h3>Follow Lutsha</h3><div class="footer-social"><a href="https://www.instagram.com/lutsha_training/" target="_blank" rel="noreferrer">${icon('instagram')}<span><strong>Instagram</strong><small>@lutsha_training</small></span></a><a href="https://www.facebook.com/people/Lutsha-Empowerment/61579402142779/" target="_blank" rel="noreferrer">${icon('facebook')}<span><strong>Facebook</strong><small>Lutsha Empowerment</small></span></a></div></div>
      </div>
      <div class="footer-bottom"><div class="container footer-bottom__inner"><span>© ${new Date().getFullYear()} Lutsha Empowerment (Pty) Ltd. All rights reserved.</span><span>Learn today. Lead tomorrow. Make an impact.</span></div></div>
    </footer>`;
}

function setupFaqs() {
  document.querySelectorAll('.faq-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const open = item.classList.toggle('faq-item--open');
      button.setAttribute('aria-expanded', String(open));
      answer.hidden = !open;
    });
  });
}

function setupForms() {
  document.querySelectorAll('form[data-netlify-function], form[data-api-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      const original = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.formType = form.dataset.apiForm || form.dataset.netlifyFunction;
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Submission failed.');
        form.reset();
        status.className = 'form-status form-status--success';
        status.textContent = form.dataset.success || 'Thank you. Your message has been sent.';
      } catch (error) {
        status.className = 'form-status form-status--error';
        status.textContent = error.message || 'We could not send your message. Please email info@lutsha.org.za.';
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  });
}

function setupBeyondAudienceLinks() {
  const select = document.querySelector('#connect select[name="audience"]');
  if (!select) return;
  document.querySelectorAll('[data-beyond-audience]').forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.beyondAudience;
      const option = [...select.options].find((item) => item.value === value || item.text === value);
      if (option) select.value = option.value;
    });
  });
}

function setupBeyondVisualEnhancements() {
  if (!document.body.classList.contains('beyond-page')) return;

  if (!document.querySelector('link[data-beyond-enhancements]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/lutsha-beyond-enhancements.css';
    stylesheet.dataset.beyondEnhancements = 'true';
    document.head.appendChild(stylesheet);
  }

  const gradientHeadings = [
    ['#model h2', 'Four ways to <span class="beyond-gradient-text">go beyond.</span>'],
    ['#pathways h2', 'In-demand skills. <span class="beyond-gradient-text">Real-world exposure.</span> African impact.'],
    ['#partners h2', 'Let’s build <span class="beyond-gradient-text">global pathways</span> together.'],
    ['#resources h2', 'Need the full <span class="beyond-gradient-text">Lutsha Beyond pack?</span>'],
  ];
  gradientHeadings.forEach(([selector, html]) => {
    const heading = document.querySelector(selector);
    if (heading) heading.innerHTML = html;
  });

  const passportNote = document.querySelector('.beyond-journey-section .beyond-passport-note');
  if (passportNote && !passportNote.closest('.beyond-passport-wrap')) {
    passportNote.outerHTML = `
      <div class="beyond-passport-wrap">
        <div class="beyond-passport-card" aria-hidden="true">
          <div class="beyond-passport-card__logo">
            <img src="/assets/lutsha-favicon.png" alt="" />
          </div>
          <div class="beyond-passport-card__eyebrow">LUTSHA BEYOND</div>
          <div class="beyond-passport-card__title">Beyond Passport</div>
          <div class="beyond-passport-card__meta">
            <span>Skills</span><span>Mobility</span><span>Exchange</span>
          </div>
          <div class="beyond-passport-card__stamp">GO BEYOND.</div>
          <div class="beyond-passport-card__swoosh"></div>
        </div>
        <div class="beyond-passport-note">
          ${icon('file')}
          <div>
            <strong>The Beyond Passport</strong>
            <span>A developing record of international learning, projects, reflections, evidence and achievements that sits alongside the learner’s formal qualification journey.</span>
          </div>
        </div>
      </div>`;
  }

  const globe = document.querySelector('.beyond-feature-visual--learners .beyond-mini-globe');
  if (globe) {
    globe.outerHTML = `
      <div class="beyond-globe-art" aria-hidden="true">
        <div class="beyond-globe-art__halo"></div>
        <div class="beyond-globe-art__sphere">
          <span class="beyond-globe-art__continent beyond-globe-art__continent--africa"></span>
          <span class="beyond-globe-art__continent beyond-globe-art__continent--europe"></span>
          <span class="beyond-globe-art__continent beyond-globe-art__continent--asia"></span>
          <span class="beyond-globe-art__continent beyond-globe-art__continent--americas"></span>
        </div>
        <div class="beyond-globe-art__meridian"></div>
        <div class="beyond-globe-art__orbit"></div>
        <div class="beyond-globe-art__marker beyond-globe-art__marker--sa"></div>
        <div class="beyond-globe-art__marker beyond-globe-art__marker--eu"></div>
        <div class="beyond-globe-art__marker beyond-globe-art__marker--asia"></div>
        <div class="beyond-globe-art__label beyond-globe-art__label--sa">SOUTH AFRICA</div>
        <div class="beyond-globe-art__label beyond-globe-art__label--global">GLOBAL PATHWAYS</div>
      </div>`;
  }
}

ensureOfficialFavicon();
renderHeader();
renderFooter();
setupFaqs();
setupForms();
setupBeyondAudienceLinks();
setupBeyondVisualEnhancements();

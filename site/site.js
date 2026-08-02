const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="/assets/icons.svg#${name}"></use></svg>`;

const navItems = [
  ['Home', '/'],
  ['Solutions', '/solutions/'],
  ['Enrolments', '/enrolments/'],
  ['Join Us', '/join-us/'],
  ['Contact Us', '/contact/'],
];

function normalisePath(path) {
  if (!path.endsWith('/')) return `${path}/`;
  return path;
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
  document.querySelectorAll('form[data-netlify-function]').forEach((form) => {
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
        payload.formType = form.dataset.netlifyFunction;
        const response = await fetch('/.netlify/functions/submit-form', {
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

renderHeader();
renderFooter();
setupFaqs();
setupForms();

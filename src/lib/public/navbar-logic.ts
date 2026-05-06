export function initNavbar() {
  const btn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-overlay');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const nav = document.getElementById('main-nav');

  if (!btn || !overlay) return;

  // Mobile menu toggle
  const toggle = () => {
    overlay.classList.toggle('hidden');
    menuIcon?.classList.toggle('hidden');
    closeIcon?.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  };

  btn.addEventListener('click', toggle);
  mobileLinks.forEach(l => l.addEventListener('click', toggle));

  // Desktop dropdown
  const dropdownBtn = document.getElementById('nav-dropdown-btn');
  const dropdownMenu = document.getElementById('nav-dropdown-menu');
  const chevron = document.getElementById('dropdown-chevron');

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', () => {
      dropdownMenu.classList.toggle('hidden');
      chevron?.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('nav-dropdown-wrapper');
      if (wrapper && !wrapper.contains(e.target as Node)) {
        dropdownMenu.classList.add('hidden');
        chevron?.classList.remove('open');
      }
    });
  }

  // Smooth scroll for same-page section links
  const anchorLinks = document.querySelectorAll('a[data-section]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const sectionId = link.getAttribute('data-section');
      if (!sectionId) return;

      const target = document.getElementById(sectionId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', `/#${sectionId}`);
      }
    });
  });

  // Scroll effect
  const onScroll = () => {
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link highlighting
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['keahlian', 'karya', 'pengalaman', 'sertifikasi'];

  const highlightActive = () => {
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html';
    let activeId = '';

    if (isHome) {
      // Scroll-based detection for Home Page
      // Using a slightly larger offset for better UX
      const scrollPos = window.scrollY + 200;
      
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          // getBoundingClientRect is more reliable with transformed parents
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (top <= scrollPos) {
            activeId = id;
          }
        }
      });
    } else {
      // Path-based detection for Sub-pages
      if (path.includes('/proyek')) activeId = 'karya';
      else if (path.includes('/pengalaman')) activeId = 'pengalaman';
      else if (path.includes('/sertifikat')) activeId = 'sertifikasi';
    }

    const allLinks = document.querySelectorAll('.nav-link, .mobile-link');
    allLinks.forEach(link => {
      const section = link.getAttribute('data-section') || '';
      if (activeId && section === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();

  // Theme logic
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  
  // Sync icons with initial state
  if (document.documentElement.classList.contains('light-theme')) {
    sunIcon?.classList.add('hidden');
    moonIcon?.classList.remove('hidden');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-theme');
      if (document.documentElement.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
      } else {
        localStorage.setItem('theme', 'dark');
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
      }
    });
  }
}

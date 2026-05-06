export function getSkillLevel(pct: number): { label: string; rank: string } {
  if (pct >= 90) return { label: 'Master', rank: 'S' };
  if (pct >= 75) return { label: 'Expert', rank: 'A' };
  if (pct >= 60) return { label: 'Advanced', rank: 'B' };
  if (pct >= 40) return { label: 'Intermediate', rank: 'C' };
  return { label: 'Beginner', rank: 'D' };
}

export function initSkillAnimations() {
  const section = document.getElementById('statistik-keahlian');
  if (!section) return;

  const items = section.querySelectorAll('.skill-bar-item');
  const catBars = section.querySelectorAll('.cat-bar');
  const radialRing = section.querySelector('.radial-ring') as SVGCircleElement;
  const radialNumber = section.querySelector('.radial-number') as HTMLElement;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateAll();
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);

  function animateCounter(el: HTMLElement, target: number, duration: number, suffix = '') {
    let current = 0;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;

    const counter = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(counter);
      }
      el.textContent = `${Math.round(current)}${suffix}`;
    }, stepTime);
  }

  function animateAll() {
    items.forEach((item, idx) => {
      const bar = item.querySelector('.skill-bar') as HTMLElement;
      const glow = item.querySelector('.skill-bar-glow') as HTMLElement;
      const percentEl = item.querySelector('.skill-percent') as HTMLElement;
      if (!bar || !percentEl) return;

      const targetWidth = Number(bar.dataset.width || 0);
      const targetPercent = Number(percentEl.dataset.target || 0);

      setTimeout(() => {
        bar.style.transition = 'width 1.4s cubic-bezier(0.22, 1, 0.36, 1)';
        bar.style.width = `${targetWidth}%`;

        if (glow) {
          glow.style.transition = 'width 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s';
          glow.style.width = `${targetWidth}%`;
          glow.style.opacity = '0.4';
        }

        animateCounter(percentEl, targetPercent, 1400, '%');
      }, idx * 120);
    });

    catBars.forEach((bar, idx) => {
      const el = bar as HTMLElement;
      const target = Number(el.dataset.width || 0);
      setTimeout(() => {
        el.style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.width = `${target}%`;
      }, 300 + idx * 100);
    });

    if (radialRing) {
      setTimeout(() => {
        radialRing.classList.add('animate');
      }, 200);
    }

    if (radialNumber) {
      const target = Number(radialNumber.dataset.target || 0);
      setTimeout(() => {
        animateCounter(radialNumber, target, 2000);
      }, 200);
    }
  }

  const carousel = document.getElementById('kategori-carousel');
  if (carousel) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollSnapType = 'none';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    
    const stopDrag = () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      carousel.style.scrollSnapType = 'x mandatory';
    };

    carousel.addEventListener('mouseleave', stopDrag);
    carousel.addEventListener('mouseup', stopDrag);
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });
    
    carousel.style.cursor = 'grab';
  }
}

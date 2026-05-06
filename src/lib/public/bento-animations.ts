import { gsap } from 'gsap';

export function initMagicBento() {
  const grid = document.getElementById('projectGrid');
  const spotlight = document.getElementById('global-spotlight');
  const cards = document.querySelectorAll('.project-card');
  
  if (!grid || !spotlight) return;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const PARTICLE_COUNT = isMobile ? 0 : 8; // No particles on mobile, fewer on desktop
  const GLOW_COLOR = "132, 0, 255";


  const cardData = new Map();

  cards.forEach((card: any) => {
    cardData.set(card, {
      particles: [],
      timeouts: [],
      isHovered: false
    });

    const createParticle = (x: number, y: number) => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      return el;
    };

    const animateParticles = () => {
      const data = cardData.get(card);
      if (!data.isHovered) return;

      const container = card.querySelector('.particle-container');
      const rect = card.getBoundingClientRect();

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = setTimeout(() => {
          if (!data.isHovered) return;

          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;
          const p = createParticle(x, y);
          container.appendChild(p);
          data.particles.push(p);

          gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
          
          gsap.to(p, {
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360,
            duration: 2 + Math.random() * 2,
            ease: 'none',
            repeat: -1,
            yoyo: true
          });

          gsap.to(p, {
            opacity: 0.3,
            duration: 1.5,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true
          });
        }, i * 100);
        data.timeouts.push(t);
      }
    };

    const clearParticles = () => {
      const data = cardData.get(card);
      data.timeouts.forEach(clearTimeout);
      data.timeouts = [];
      
      data.particles.forEach((p: any) => {
        gsap.to(p, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          onComplete: () => p.remove()
        });
      });
      data.particles = [];
    };

    card.addEventListener('mouseenter', () => {
      const data = cardData.get(card);
      data.isHovered = true;
      animateParticles();
      gsap.to(card, { y: -2, duration: 0.3 });
    });

    card.addEventListener('mouseleave', () => {
      const data = cardData.get(card);
      data.isHovered = false;
      clearParticles();
      gsap.to(card, { y: 0, duration: 0.5 });
      card.style.setProperty('--glow-intensity', '0');
    });

    card.addEventListener('click', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDist = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y - rect.height));

      const ripple = document.createElement('div');
      ripple.style.cssText = `position: absolute; width: ${maxDist * 2}px; height: ${maxDist * 2}px; border-radius: 50%; background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, transparent 70%); left: ${x - maxDist}px; top: ${y - maxDist}px; pointer-events: none; z-index: 100;`;
      card.appendChild(ripple);

      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, onComplete: () => ripple.remove() });
    });
  });

  const handleMouseMove = (e: MouseEvent) => {
    const rect = grid.getBoundingClientRect();
    const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (!isInside) {
      gsap.to(spotlight, { opacity: 0, duration: 0.3 });
      return;
    }

    gsap.to(spotlight, { x: e.clientX, y: e.clientY, opacity: 0.8, duration: 0.1 });


    cards.forEach((card: any) => {
      const cardRect = card.getBoundingClientRect();
      const x = e.clientX - cardRect.left;
      const y = e.clientY - cardRect.top;
      const centerX = cardRect.width / 2;
      const centerY = cardRect.height / 2;

      const distance = Math.hypot(e.clientX - (cardRect.left + centerX), e.clientY - (cardRect.top + centerY)) - Math.max(cardRect.width, cardRect.height) / 2;
      const proximity = 150;
      const fadeDistance = 225;
      
      let glowIntensity = 0;
      if (distance <= proximity) glowIntensity = 1;
      else if (distance <= fadeDistance) glowIntensity = (fadeDistance - distance) / (fadeDistance - proximity);

      card.style.setProperty('--glow-x', `${(x / cardRect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${(y / cardRect.height) * 100}%`);
      card.style.setProperty('--glow-intensity', Math.max(0, glowIntensity).toString());
    });
  };

  window.addEventListener('mousemove', handleMouseMove);
}

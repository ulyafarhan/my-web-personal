import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from 'lenis';


// Initialize ScrollTrigger and export to window for CDN compatibility
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function initPageAnimations() {
  // 0. Scroll Progress Bar (Premium Touch)
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(to right, #22d3ee, #818cf8);z-index:1000;transition:width 0.1s ease-out;';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  }, { passive: true });

  // 1. Reveal Animations (Aggressively Optimized)
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      { 
        opacity: 0, 
        y: 20, // Minimal movement for maximum speed feel
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, // Fast reveal
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 94%", // Start sooner
          toggleActions: "play none none none"
        }
      }
    );
  });

  // 2. Staggered Animation for Bento Grids / Lists
  const staggerContainers = document.querySelectorAll('.stagger-reveal');
  staggerContainers.forEach((container) => {
    const children = container.querySelectorAll('.stagger-item');
    if (!children.length) return;

    gsap.fromTo(children,
      { 
        opacity: 0, 
        y: 20,
        scale: 0.98
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08, // Very fast stagger
        ease: "power1.out",
        scrollTrigger: {
          trigger: container,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    );
  });


  // 3. Staggered reveal for standard grid items
  const staggerItems = document.querySelectorAll('.stagger-item');
  // Logic already handled by container triggers in most cases
}

// 4. Lenis Smooth Scroll Integration (Optimized)
export function initLenis() {
  if (typeof window === 'undefined') return;

  // Cleanup existing instance if any
  if ((window as any).lenis) {
    (window as any).lenis.destroy();
  }

  const lenis = new Lenis({
    duration: 0.8, // Faster, more responsive duration
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Critical: Sync ScrollTrigger with Lenis using the same GSAP instance
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
  (window as any).lenis = lenis;
  
  return lenis;
}


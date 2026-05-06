import { gsap } from "gsap";

export function initHero3D() {
  const card = document.getElementById("heroCard");
  const container = card?.parentElement;

  if (!card || !container) return;

  const setRotateX = gsap.quickSetter(card, "rotateX", "deg");
  const setRotateY = gsap.quickSetter(card, "rotateY", "deg");

  const handleMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20; // Reduced intensity for stability
    const rotateY = (centerX - x) / 20;

    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const handleMouseLeave = () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: "power2.out",
      overwrite: true
    });
  };

  container.addEventListener("mousemove", handleMouseMove, { passive: true });
  container.addEventListener("mouseleave", handleMouseLeave);
}

let typingInitialized = false;

export function initHeroTyping() {
  const target = document.getElementById('hero-typing-target');
  const cursor = document.getElementById('hero-typing-cursor');
  if (!target || !cursor || typingInitialized) return;

  typingInitialized = true;
  
  const fullHTML = 'Ulya <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Farhan</span>';
  const plainText = "Ulya Farhan";
  
  let isDeleting = false;
  let charIndex = 0;
  let timeoutId: any;

  function type() {
    let htmlToShow = "";
    let currentPlainTextCount = 0;
    let inTag = false;
    let i = 0;

    while (currentPlainTextCount < charIndex && i < fullHTML.length) {
      if (fullHTML[i] === '<') inTag = true;
      htmlToShow += fullHTML[i];
      if (!inTag) currentPlainTextCount++;
      if (fullHTML[i] === '>') inTag = false;
      i++;
    }

    if (inTag) {
      while (i < fullHTML.length && inTag) {
        htmlToShow += fullHTML[i];
        if (fullHTML[i] === '>') inTag = false;
        i++;
      }
    }

    if (target) {
      target.innerHTML = htmlToShow;
    }

    let delay = isDeleting ? 40 : Math.random() * 80 + 50;

    if (!isDeleting && charIndex === plainText.length) {
      delay = 3000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      delay = 1000; // Pause at start
    }

    if (!isDeleting && charIndex < plainText.length) {
      charIndex++;
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
    }

    timeoutId = setTimeout(type, delay);
  }

  const cursorInterval = setInterval(() => {
    if (cursor) {
      cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
    }
  }, 500);

  // Reset flag on page transition to allow re-init
  document.addEventListener('astro:before-preparation', () => {
    typingInitialized = false;
    clearTimeout(timeoutId);
    clearInterval(cursorInterval);
  }, { once: true });

  type();
}

import { gsap } from "gsap";

/**
 * Advanced 3D Tilt effect for cards
 */
export function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  
  cards.forEach((card: any) => {
    // Optimization: Use quickSetter for high-frequency updates
    const setRotateX = gsap.quickSetter(card, "rotateX", "deg");
    const setRotateY = gsap.quickSetter(card, "rotateY", "deg");
    const setScale = gsap.quickSetter(card, "scale");

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (centerY - y) / 10;
      const rotateY = (x - centerX) / 10;
      
      setRotateX(rotateX);
      setRotateY(rotateY);
      setScale(1.02);
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        overwrite: true
      });
    });
  });
}

/**
 * Text Splitting Animation
 */
export function initTextReveals() {
  const texts = document.querySelectorAll('.text-reveal');
  texts.forEach((text: any) => {
    const content = text.textContent;
    text.innerHTML = '';
    
    content.split(' ').forEach((word: string) => {
      const span = document.createElement('span');
      span.textContent = word + '\u00A0';
      span.style.display = 'inline-block';
      text.appendChild(span);
    });


    gsap.from(text.children, {
      opacity: 0,
      y: 20,
      rotateX: -90,
      stagger: 0.02,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: text,
        start: "top 90%",
      }
    });
  });
}

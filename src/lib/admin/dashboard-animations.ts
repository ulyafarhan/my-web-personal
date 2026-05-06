import { gsap } from 'gsap';

export function initDashboardAnimations() {
  // Target containers
  const statsCards = document.querySelectorAll('.stats-card');
  const activitySection = document.querySelector('.recent-activity-section');
  const sidebarSection = document.querySelector('.dashboard-sidebar-section');

  if (!statsCards.length && !activitySection && !sidebarSection) return;

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.8 }
  });

  // Initial state
  gsap.set([statsCards, activitySection, sidebarSection], { 
    opacity: 0, 
    y: 20 
  });

  // Animation sequence
  if (statsCards.length) {
    tl.to(statsCards, {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6
    });
  }

  if (activitySection) {
    tl.to(activitySection, {
      opacity: 1,
      y: 0,
    }, statsCards.length ? "-=0.4" : "0");
  }

  if (sidebarSection) {
    tl.to(sidebarSection, {
      opacity: 1,
      y: 0,
    }, activitySection ? "-=0.6" : "-=0.4");
  }
}

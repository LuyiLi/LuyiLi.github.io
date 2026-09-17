(() => {
  const root = document.getElementById('hongyi-research-subtle');
  if (!root) return;

  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const sectionSelector = '.hy-chapter';
  let pointer = null;
  let activeSection = null;
  let frame = 0;

  const paint = () => {
    frame = 0;
    if (!pointer || !enabled.matches) return;

    // Hit-test again after scrolling so the light stays beneath a stationary cursor.
    const target = document.elementFromPoint(pointer.x, pointer.y);
    const section = target?.closest(sectionSelector);
    const nextSection = section && root.contains(section) ? section : null;
    const bounds = nextSection?.getBoundingClientRect();
    const headerBounds = nextSection?.querySelector('.hy-chapter-header')?.getBoundingClientRect();

    if (activeSection !== nextSection) {
      activeSection?.classList.remove('is-pointer-within');
      activeSection = nextSection;
    }
    if (!nextSection) return;

    const work = target?.closest('.hy-work-entry');
    if (work && root.contains(work)) {
      const workBounds = work.getBoundingClientRect();
      const glowLeft = parseFloat(getComputedStyle(work, '::before').left) || 0;
      work.style.setProperty('--hy-work-x', `${pointer.x - workBounds.left - glowLeft}px`);
      work.style.setProperty('--hy-work-y', `${pointer.y - workBounds.top}px`);
    }

    nextSection.style.setProperty('--hy-glow-x', `${pointer.x - bounds.left}px`);
    nextSection.style.setProperty('--hy-glow-y', `${pointer.y - bounds.top}px`);
    nextSection.style.setProperty('--hy-glow-section-height', `${bounds.height}px`);
    nextSection.style.setProperty('--hy-glow-header-offset', `${headerBounds ? headerBounds.top - bounds.top : 0}px`);
    nextSection.classList.add('is-pointer-within');
  };

  const schedule = () => {
    if (pointer && enabled.matches && !frame) frame = requestAnimationFrame(paint);
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    activeSection?.classList.remove('is-pointer-within');
    activeSection = null;
  };

  root.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });
  root.addEventListener('pointerleave', reset, { passive: true });
  root.addEventListener('pointercancel', reset, { passive: true });
  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
  enabled.addEventListener('change', reset);

  // Disclosures can move section boundaries without a scroll or pointer event.
  const observer = new ResizeObserver(schedule);
  root.querySelectorAll(sectionSelector).forEach(section => observer.observe(section));
})();

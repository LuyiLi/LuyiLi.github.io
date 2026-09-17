(() => {
  const root = document.getElementById('hongyi-research-subtle');
  if (!root) return;
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...root.querySelectorAll('.hy-hero, .hy-chapter')];
  const regions = [...root.querySelectorAll('.hy-work-entry, .hy-school, .hy-experience-grid > article, .hy-hero-copy, .hy-contact-content')];
  regions.forEach(region => region.classList.add('hy-hover-region'));
  let frame = 0;
  let latest = null;
  let activeSection = null;
  const paint = () => {
    frame = 0;
    if (!latest) return;
    const { section, region, x, y } = latest;
    if (activeSection !== section) {
      activeSection?.classList.remove('is-pointer-within');
      activeSection = section;
      activeSection?.classList.add('is-pointer-within');
    }
    if (reduced.matches) return;
    for (const [element, prefix] of [[section, '--hy-section'], [region, '--hy-pointer']]) {
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(prefix + '-x', `${x - rect.left}px`);
      element.style.setProperty(prefix + '-y', `${y - rect.top}px`);
    }
  };
  root.addEventListener('pointermove', event => {
    if (!pointer.matches || event.pointerType === 'touch') return;
    latest = {
      section: event.target.closest('.hy-hero, .hy-chapter'),
      region: event.target.closest('.hy-hover-region'),
      x: event.clientX,
      y: event.clientY
    };
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    latest = null;
    activeSection?.classList.remove('is-pointer-within');
    activeSection = null;
    for (const section of sections) {
      section.style.removeProperty('--hy-section-x');
      section.style.removeProperty('--hy-section-y');
    }
    for (const region of regions) {
      region.style.removeProperty('--hy-pointer-x');
      region.style.removeProperty('--hy-pointer-y');
    }
  };
  root.addEventListener('pointerleave', reset, { passive: true });
  root.addEventListener('pointercancel', reset, { passive: true });
  pointer.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
})();

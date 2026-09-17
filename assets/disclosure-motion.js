(() => {
  const root = document.getElementById('hongyi-research-subtle');
  if (!root) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const easing = 'cubic-bezier(.22, .7, .28, 1)';

  function disclosure({ container, control, content, isOpen, setOpen, label }) {
    let expanded = isOpen();
    let expectedNativeState = expanded;
    let heightAnimation = null;
    let contentAnimations = [];

    const setVisible = value => {
      expectedNativeState = value;
      setOpen(value);
    };
    const updateControl = () => {
      control.setAttribute('aria-expanded', String(expanded));
      container.dataset.disclosureExpanded = String(expanded);
      content.forEach(element => { element.inert = !expanded; });
      if (label) control.setAttribute('aria-label', label.replace(/^Show|^Hide/, expanded ? 'Hide' : 'Show'));
    };
    const cancelAnimations = () => {
      if (heightAnimation) {
        heightAnimation.onfinish = null;
        heightAnimation.cancel();
        heightAnimation = null;
      }
      contentAnimations.forEach(animation => animation.cancel());
      contentAnimations = [];
    };
    const settle = () => {
      setVisible(expanded);
      cancelAnimations();
      container.removeAttribute('data-disclosure-animating');
      active.delete(controller);
      updateControl();
    };
    const change = next => {
      const startHeight = container.getBoundingClientRect().height;
      const startOpacity = content.map(element => isOpen() ? Number(getComputedStyle(element).opacity) : 0);
      cancelAnimations();
      expanded = next;
      updateControl();
      if (reducedMotion.matches || !container.animate) {
        settle();
        return;
      }

      // Measure the destination in normal flow, then reveal the content for
      // both directions so a closing disclosure does not disappear early.
      setVisible(expanded);
      const endHeight = container.getBoundingClientRect().height;
      setVisible(true);
      container.dataset.disclosureAnimating = '';
      active.add(controller);

      heightAnimation = container.animate(
        { height: [`${startHeight}px`, `${endHeight}px`] },
        { duration: expanded ? 340 : 280, easing, fill: 'both' }
      );
      contentAnimations = content.map((element, index) => element.animate(
        { opacity: [startOpacity[index], expanded ? 1 : 0] },
        { duration: expanded ? 260 : 220, easing, fill: 'both' }
      ));
      heightAnimation.onfinish = settle;
    };

    const controller = { settle };
    updateControl();
    control.addEventListener('click', event => {
      event.preventDefault();
      change(!expanded);
    });

    if (container.tagName === 'DETAILS') {
      container.addEventListener('toggle', () => {
        // Native find-in-page and the All publications link can also open it.
        const actual = isOpen();
        if (actual === expectedNativeState) return;
        setVisible(expanded);
        change(actual);
      });
    }
  }

  root.querySelectorAll('details').forEach(container => {
    const control = container.querySelector(':scope > summary');
    if (!control) return;
    const content = [...container.children].filter(element => element !== control);
    disclosure({
      container, control, content,
      isOpen: () => container.open,
      setOpen: value => { container.open = value; }
    });
  });

  root.querySelectorAll('[data-work-toggle]').forEach(control => {
    const panel = root.querySelector('#' + control.getAttribute('aria-controls'));
    const container = control.closest('.hy-work-entry');
    if (!panel || !container) return;
    disclosure({
      container, control, content: [panel],
      isOpen: () => !panel.hidden,
      setOpen: value => { panel.hidden = !value; },
      label: control.getAttribute('aria-label')
    });
  });

  // Restore intrinsic sizing after a viewport or motion preference change.
  window.addEventListener('resize', () => [...active].forEach(item => item.settle()), { passive: true });
  reducedMotion.addEventListener('change', () => [...active].forEach(item => item.settle()));
})();

(() => {
  const root = document.getElementById('hongyi-research-subtle');
  const dialog = document.getElementById('hy-cite-dialog');
  const data = document.getElementById('hy-citations-data');
  if (!root || !dialog || !data) return;

  const citations = JSON.parse(data.textContent);
  const heading = dialog.querySelector('#hy-cite-heading');
  const title = dialog.querySelector('#hy-cite-title');
  const code = dialog.querySelector('#hy-cite-code');
  const source = dialog.querySelector('.hy-cite-source');
  const copy = dialog.querySelector('.hy-cite-copy');
  const status = dialog.querySelector('.hy-cite-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let opener = null;
  let closing = false;
  let backdropPress = false;
  let session = 0;
  let animation = null;

  const animate = opening => {
    animation?.cancel();
    if (reduced.matches || !dialog.animate) return null;
    animation = dialog.animate(
      opening
        ? { opacity: [0, 1], transform: ['translateY(8px) scale(.99)', 'none'] }
        : { opacity: [1, 0], transform: ['none', 'translateY(4px) scale(.995)'] },
      { duration: opening ? 200 : 140, easing: 'cubic-bezier(.22, .7, .28, 1)' }
    );
    return animation;
  };

  const close = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    session++;
    const exit = animate(false);
    if (exit) await exit.finished.catch(() => {});
    dialog.close();
    closing = false;
    opener?.focus({ preventScroll: true });
  };

  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-cite]');
    if (!trigger || !root.contains(trigger)) return;
    const citation = citations[trigger.dataset.cite];
    if (!citation) return;
    opener = trigger;
    session++;
    heading.textContent = citation.name;
    title.textContent = citation.title;
    code.textContent = citation.bibtex;
    source.href = citation.source;
    source.textContent = citation.sourceLabel + ' ↗';
    copy.textContent = 'Copy BibTeX';
    copy.disabled = false;
    status.textContent = '';
    backdropPress = false;
    dialog.showModal();
    dialog.scrollTop = 0;
    code.parentElement.scrollTop = 0;
    animate(true);
  });

  dialog.querySelector('.hy-cite-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  const outside = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outside(event)) close();
    backdropPress = false;
  });

  // Keep the fallback inside the modal: the rest of the page is inert while open.
  const legacyCopy = value => {
    const field = document.createElement('textarea');
    field.value = value;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;opacity:0;pointer-events:none;inset:0;width:1px;height:1px;';
    dialog.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { field.remove(); copy.focus({ preventScroll: true }); }
    return copied;
  };

  copy.addEventListener('click', async () => {
    const current = session;
    const value = code.textContent;
    copy.disabled = true;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    } catch { /* Try the selection-based fallback below. */ }
    if (current !== session || !dialog.open) return;
    if (!copied) {
      try { copied = legacyCopy(value); } catch { copied = false; }
    }
    copy.disabled = false;
    copy.focus({ preventScroll: true });
    copy.textContent = copied ? 'Copied' : 'Copy BibTeX';
    status.textContent = copied ? 'Citation copied to clipboard.' : 'Select the BibTeX above and copy it with Ctrl+C or ⌘C.';
  });
})();

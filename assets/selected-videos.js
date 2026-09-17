(() => {
  const root = document.getElementById('hongyi-research-subtle');
  if (!root) return;

  root.querySelectorAll('.hy-story-disclosure').forEach(disclosure => {
    const player = disclosure.querySelector('.hy-story-video');
    const template = player?.querySelector('template');
    if (!template) return;

    const sync = () => {
      const expanded = disclosure.dataset.disclosureExpanded === undefined
        ? disclosure.open
        : disclosure.dataset.disclosureExpanded === 'true';
      const frame = player.querySelector('iframe');
      if (expanded && !frame) {
        player.append(template.content.cloneNode(true));
      } else if (!disclosure.open && frame) {
        // Let the closing animation finish, then stop playback and release it.
        frame.remove();
      }
    };

    new MutationObserver(sync).observe(disclosure, {
      attributes: true,
      attributeFilter: ['open', 'data-disclosure-expanded']
    });
    sync();
  });
})();

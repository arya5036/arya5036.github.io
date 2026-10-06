'use strict';
(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const art = document.getElementById('wave-art');
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1500 850');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const defs = document.createElementNS(ns, 'defs');
  const palettes = [['#4754d8', '#8079ee', '#72cce8'], ['#6950b7', '#d3698e', '#de916d'], ['#3e64bf', '#7791e6', '#7686c8']];
  palettes.forEach((colors, index) => {
    const gradient = document.createElementNS(ns, 'linearGradient');
    gradient.id = `wave-gradient-${index}`;
    gradient.setAttribute('x1', '0%'); gradient.setAttribute('x2', '100%');
    colors.forEach((color, i) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', `${i * 50}%`); stop.setAttribute('stop-color', color);
      gradient.append(stop);
    }); defs.append(gradient);
  });
  svg.append(defs);
  // Original procedural ribbons: 78 paths, animated as three groups.
  for (let band = 0; band < 3; band++) {
    const group = document.createElementNS(ns, 'g');
    group.setAttribute('class', `wave-stream ${['first', 'second', 'third'][band]}`);
    group.setAttribute('stroke', `url(#wave-gradient-${band})`);
    group.setAttribute('stroke-width', band === 2 ? '.7' : '.95');
    group.setAttribute('opacity', ['.68', '.45', '.28'][band]);
    for (let line = 0; line < 26; line++) {
      const t = line / 25;
      let d = '';
      for (let step = 0; step <= 88; step++) {
        const x = -80 + step * 19;
        const u = x / 1500;
        const envelope = .6 + .4 * Math.sin(u * Math.PI);
        const center = 420 + Math.sin(u * Math.PI * 2.1 + band * 1.35) * (140 + band * 25);
        const twist = Math.sin(u * Math.PI * 3.2 + band * 1.7);
        const y = center + (t - .5) * (230 + band * 50) * twist * envelope + Math.sin(u * Math.PI * 4 + t * 1.4 + band) * 24;
        d += `${step ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      }
      const path = document.createElementNS(ns, 'path');path.setAttribute('d', d);group.append(path);
    }
    svg.append(group);
  }
  art.append(svg);

  const shortcut = document.querySelector('.qr-shortcut');
  shortcut.addEventListener('click', () => {document.getElementById('share').open = true;});

  if ('IntersectionObserver' in window && !reducedMotion.matches && finePointer.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {if (entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
    }, {threshold: .08});
    document.querySelectorAll('.reveal').forEach(section => {section.classList.add('reveal-enhanced');observer.observe(section);});
  }
  let frame = 0;
  let latestEvent;
  const resetParallax = () => {root.style.removeProperty('--px');root.style.removeProperty('--py');};
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || window.innerWidth < 900) return;
    latestEvent = event;
    if (!frame) frame = requestAnimationFrame(() => {
      root.style.setProperty('--px', `${((latestEvent.clientX / innerWidth - .5) * 10).toFixed(1)}px`);
      root.style.setProperty('--py', `${((latestEvent.clientY / innerHeight - .5) * 8).toFixed(1)}px`);
      frame = 0;
    });
  }, {passive: true});
  document.addEventListener('pointerleave', resetParallax);
  reducedMotion.addEventListener('change', resetParallax);
  document.addEventListener('visibilitychange', () => {root.classList.toggle('motion-paused', document.hidden);});
})();

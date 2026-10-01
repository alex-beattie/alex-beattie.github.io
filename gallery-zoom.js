document.querySelectorAll('.gallery').forEach(gallery => {
  const main = gallery.querySelector('.gallery-main');
  const caption = gallery.querySelector('.gallery-caption');
  const thumbs = [...gallery.querySelectorAll('.gallery-thumbs img')];
  if (!main || !thumbs.length) return;
  let current = Math.max(0, thumbs.findIndex(image => image.src === main.src));
  const buttons = thumbs.map((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `View image ${index + 1}: ${image.alt}`);
    image.before(button);
    button.append(image);
    button.addEventListener('click', () => select(index));
    return button;
  });
  function description() {
    return thumbs[current].dataset.caption || thumbs[current].alt;
  }
  function select(index) {
    current = (index + thumbs.length) % thumbs.length;
    main.src = thumbs[current].src;
    main.alt = thumbs[current].alt;
    if (caption) caption.textContent = description();
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  }
  select(current);
  main.tabIndex = 0;
  main.setAttribute('role', 'button');
  main.setAttribute('aria-label', 'Enlarge project image');
  const hint = document.createElement('p');
  hint.className = 'gallery-help';
  hint.textContent = 'Select a thumbnail to browse. Select the large image to enlarge.';
  gallery.append(hint);
  function openImage() {
    const dialog = document.createElement('dialog');
    dialog.className = 'image-dialog';
    dialog.setAttribute('aria-label', 'Project image viewer');
    dialog.innerHTML = '<div class="dialog-toolbar"><strong>Project images</strong><button type="button" data-action="previous" aria-label="Previous image">←</button><button type="button" data-action="next" aria-label="Next image">→</button><button type="button" data-action="zoom" aria-pressed="false">Zoom</button><button type="button" data-action="close">Close ×</button></div><div class="dialog-image-area"><img class="dialog-image" alt=""></div><p class="dialog-caption" aria-live="polite"></p>';
    document.body.append(dialog);
    const image = dialog.querySelector('.dialog-image');
    const zoom = dialog.querySelector('[data-action="zoom"]');
    function update() {
      image.src = main.src;
      image.alt = main.alt;
      image.classList.remove('zoomed');
      zoom.setAttribute('aria-pressed', 'false');
      dialog.querySelector('.dialog-caption').textContent = `${current + 1} / ${thumbs.length} · ${description()}`;
    }
    function move(delta) { select(current + delta); update(); }
    dialog.querySelector('[data-action="previous"]').onclick = () => move(-1);
    dialog.querySelector('[data-action="next"]').onclick = () => move(1);
    zoom.onclick = () => zoom.setAttribute('aria-pressed', String(image.classList.toggle('zoomed')));
    dialog.querySelector('[data-action="close"]').onclick = () => dialog.close();
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { dialog.remove(); main.focus(); });
    update();
    dialog.showModal();
  }
  main.addEventListener('click', openImage);
  main.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openImage(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      select(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
});

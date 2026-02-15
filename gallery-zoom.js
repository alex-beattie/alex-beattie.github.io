// This script enables fullscreen, zoom, captions, and arrow-key navigation for project image galleries.
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.gallery').forEach(function(gallery) {
    const mainImg = gallery.querySelector('.gallery-main');
    if (!mainImg) return;

    // Add zoom cursor
    mainImg.style.cursor = 'zoom-in';

    const captionEl = gallery.querySelector('.gallery-caption');
    const thumbs = Array.from(gallery.querySelectorAll('.gallery-thumbs img'));

    function setCaptionFromThumb(thumb) {
      if (!captionEl) return;
      const cap = thumb.getAttribute('data-caption') || thumb.alt || '';
      captionEl.textContent = cap;
    }

    function setMainByIndex(idx) {
      if (!thumbs[idx]) return;
      mainImg.src = thumbs[idx].src;
      mainImg.setAttribute('data-gallery-idx', String(idx));
      setCaptionFromThumb(thumbs[idx]);
    }

    // Initialize index + caption
    let initialIdx = thumbs.findIndex(t => t.src === mainImg.src);
    if (initialIdx === -1) initialIdx = 0;
    mainImg.setAttribute('data-gallery-idx', String(initialIdx));
    if (thumbs[initialIdx]) setCaptionFromThumb(thumbs[initialIdx]);

    // Thumb clicks
    thumbs.forEach(function(thumb, idx) {
      thumb.addEventListener('click', function() {
        setMainByIndex(idx);
      });
      thumb.style.cursor = 'pointer';
    });

    // Keyboard navigation (left/right arrows) for this gallery's main image
    document.addEventListener('keydown', function(e) {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      let idx = parseInt(mainImg.getAttribute('data-gallery-idx') || '0', 10);
      if (Number.isNaN(idx)) idx = 0;

      if (e.key === 'ArrowRight') {
        idx = (idx + 1) % thumbs.length;
        setMainByIndex(idx);
      } else if (e.key === 'ArrowLeft') {
        idx = (idx - 1 + thumbs.length) % thumbs.length;
        setMainByIndex(idx);
      }
    });

    // Create overlay for fullscreen/zoom
    mainImg.addEventListener('click', function() {
      let overlay = document.createElement('div');
      overlay.className = 'gallery-zoom-overlay';
      overlay.innerHTML = `
        <img src="${mainImg.src}" class="gallery-zoomed" alt="Zoomed image">
        <div class="gallery-zoom-caption"></div>
        <button class="gallery-zoom-close" title="Close">&times;</button>
        <button class="gallery-zoom-in" title="Zoom in">+</button>
        <button class="gallery-zoom-out" title="Zoom out">-</button>
      `;
      document.body.appendChild(overlay);

      const zoomed = overlay.querySelector('.gallery-zoomed');
      const overlayCaption = overlay.querySelector('.gallery-zoom-caption');

      function syncOverlayCaption() {
        const idx = thumbs.findIndex(t => t.src === zoomed.src);
        if (idx >= 0) {
          const cap = thumbs[idx].getAttribute('data-caption') || thumbs[idx].alt || '';
          overlayCaption.textContent = cap;
        } else {
          overlayCaption.textContent = '';
        }
      }
      syncOverlayCaption();

      let scale = 1;
      function setScale(s) {
        scale = Math.max(1, Math.min(s, 5));
        zoomed.style.transform = `scale(${scale})`;
      }

      function closeOverlay() {
        overlay.remove();
        document.removeEventListener('keydown', overlayNavHandler);
      }

      overlay.querySelector('.gallery-zoom-close').onclick = closeOverlay;
      overlay.onclick = e => { if (e.target === overlay) closeOverlay(); };
      overlay.querySelector('.gallery-zoom-in').onclick = e => { e.stopPropagation(); setScale(scale + 0.25); };
      overlay.querySelector('.gallery-zoom-out').onclick = e => { e.stopPropagation(); setScale(scale - 0.25); };
      setScale(1);

      // Arrow key navigation in overlay
      function overlayNavHandler(e) {
        let idx = thumbs.findIndex(t => t.src === zoomed.src);
        if (idx < 0) idx = 0;

        if (e.key === 'ArrowRight') {
          idx = (idx + 1) % thumbs.length;
          zoomed.src = thumbs[idx].src;
          syncOverlayCaption();
        } else if (e.key === 'ArrowLeft') {
          idx = (idx - 1 + thumbs.length) % thumbs.length;
          zoomed.src = thumbs[idx].src;
          syncOverlayCaption();
        } else if (e.key === 'Escape') {
          closeOverlay();
        }
      }
      document.addEventListener('keydown', overlayNavHandler);
    });
  });
});

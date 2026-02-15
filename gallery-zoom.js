// This script enables fullscreen, zoom, and arrow-key navigation for all .gallery-main images on any project page.
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.gallery-main').forEach(function(mainImg) {
    // Add zoom cursor
    mainImg.style.cursor = 'zoom-in';

    // Gather all gallery thumbs in the same gallery
    const gallery = mainImg.closest('.gallery');
    const thumbs = gallery ? Array.from(gallery.querySelectorAll('.gallery-thumbs img')) : [mainImg];

    // Keyboard navigation for gallery (left/right arrows)
    function setMainByIndex(idx) {
      if (thumbs[idx]) {
        mainImg.src = thumbs[idx].src;
        mainImg.setAttribute('data-gallery-idx', idx);
      }
    }
    // Set initial index
    let initialIdx = thumbs.findIndex(t => t.src === mainImg.src);
    if (initialIdx === -1) initialIdx = 0;
    mainImg.setAttribute('data-gallery-idx', initialIdx);

    document.addEventListener('keydown', function(e) {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      let idx = parseInt(mainImg.getAttribute('data-gallery-idx'));
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
        <button class="gallery-zoom-close" title="Close">&times;</button>
        <button class="gallery-zoom-in" title="Zoom in">+</button>
        <button class="gallery-zoom-out" title="Zoom out">-</button>
      `;
      document.body.appendChild(overlay);
      const zoomed = overlay.querySelector('.gallery-zoomed');
      let scale = 1;
      function setScale(s) {
        scale = Math.max(1, Math.min(s, 5));
        zoomed.style.transform = `scale(${scale})`;
      }
      overlay.querySelector('.gallery-zoom-close').onclick = () => overlay.remove();
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector('.gallery-zoom-in').onclick = e => { e.stopPropagation(); setScale(scale + 0.25); };
      overlay.querySelector('.gallery-zoom-out').onclick = e => { e.stopPropagation(); setScale(scale - 0.25); };
      setScale(1);

      // Arrow key navigation in overlay
      function overlayNavHandler(e) {
        let idx = thumbs.findIndex(t => t.src === zoomed.src);
        if (e.key === 'ArrowRight') {
          idx = (idx + 1) % thumbs.length;
          zoomed.src = thumbs[idx].src;
        } else if (e.key === 'ArrowLeft') {
          idx = (idx - 1 + thumbs.length) % thumbs.length;
          zoomed.src = thumbs[idx].src;
        } else if (e.key === 'Escape') {
          overlay.remove();
        }
      }
      document.addEventListener('keydown', overlayNavHandler);
      overlay.onremove = () => document.removeEventListener('keydown', overlayNavHandler);
      // Remove event on close
      overlay.querySelector('.gallery-zoom-close').onclick = () => {
        overlay.remove();
        document.removeEventListener('keydown', overlayNavHandler);
      };
    });
  });
});

/* ===== GALLERY.JS - Lightbox Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryLightbox();
});

function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  
  if (!galleryItems.length || !lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentIndex = 0;
  const images = [];

  // Extract data from gallery items
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      images.push({
        src: img.src,
        alt: img.alt || '',
        caption: item.dataset.caption || img.alt || ''
      });

      item.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
      });
    }
  });

  function openLightbox() {
    if (!images[currentIndex]) return;
    updateLightboxImage(false); // false means no delay for the first load
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage(true);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage(true);
  }

  function updateLightboxImage(withTransition = true) {
    if (withTransition) {
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        setLightboxData();
        lightboxImg.style.opacity = '1';
      }, 300);
    } else {
      setLightboxData();
      lightboxImg.style.opacity = '1';
    }
  }

  function setLightboxData() {
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = images[currentIndex].caption;
    }
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}


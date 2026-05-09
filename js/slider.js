/* ===== SLIDER.JS - Carousels & Sliders ===== */

document.addEventListener('DOMContentLoaded', () => {
  initTestimonialSlider();
  initImageCarousel();
});

/* ----- Testimonial Slider ----- */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.slider-dot');
  if (!track || !dots.length) return;

  let currentSlide = 0;
  const slideCount = dots.length;
  let autoplayInterval;

  function goToSlide(index) {
    if (index < 0) index = slideCount - 1;
    if (index >= slideCount) index = 0;
    
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  // Event Listeners for Dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoplay();
    });
  });

  // Autoplay functionality
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  startAutoplay();

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
  track.addEventListener('mouseleave', startAutoplay);
}

/* ----- Generic Image Carousel / Slider (e.g., Room Details) ----- */
function initImageCarousel() {
  const slides = document.querySelectorAll('.room-slide');
  const thumbs = document.querySelectorAll('.slider-thumb');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  
  // If the carousel elements don't exist on this page, exit
  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval;

  function goToCarouselSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (thumbs[currentSlide]) thumbs[currentSlide].classList.remove('active');
    
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    slides[currentSlide].classList.add('active');
    if (thumbs[currentSlide]) thumbs[currentSlide].classList.add('active');
  }

  function nextCarouselSlide() { goToCarouselSlide(currentSlide + 1); }
  function prevCarouselSlide() { goToCarouselSlide(currentSlide - 1); }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextCarouselSlide();
      resetInterval();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevCarouselSlide();
      resetInterval();
    });
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      goToCarouselSlide(index);
      resetInterval();
    });
  });

  function startInterval() {
    slideInterval = setInterval(nextCarouselSlide, 5000);
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  startInterval();
}


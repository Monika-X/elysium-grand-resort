/* ===== MAIN.JS - Global Website Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initNavbar(); // Always init navbar logic (handles both inlined and dynamic)
  initPreloader();
  initScrollAnimations();
  initScrollToTop();
  initSmoothScrolling();
  initLazyLoading();
  initFaqAccordion();
  initVideoModal();
});

/* ----- Load Header & Footer Components ----- */
async function loadComponents() {
  const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
  
  // Load Navbar
  const loadNavbar = async () => {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
    try {
      const res = await fetch(basePath + 'components/navbar.html?v=' + Date.now());
      if (res.ok) {
        let html = await res.text();
        if (window.location.pathname.includes('/pages/')) {
          html = html.replace(/href="index\.html"/g, 'href="../index.html"');
          html = html.replace(/href="pages\//g, 'href=""');
        }
        placeholder.innerHTML = html;
        initNavbar();
      }
    } catch (e) { console.error('Navbar error:', e); }
  };

  // Load Footer
  const loadFooter = async () => {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    try {
      const res = await fetch(basePath + 'components/footer.html?v=' + Date.now());
      if (res.ok) {
        let html = await res.text();
        if (window.location.pathname.includes('/pages/')) {
          // Adjust links for sub-pages
          html = html.replace(/href="index\.html"/g, 'href="../index.html"');
          // For links starting with pages/, remove the prefix since we're already in /pages/
          html = html.replace(/href="pages\//g, 'href="');
          // For other local links (like assets or css), add ../
          // (Only if they don't start with http, #, or ../ or are a known page name)
          html = html.replace(/href="(?!http|\#|\.\.\/|about|rooms|booking|gallery|contact|privacy-policy|terms-conditions|404)/g, 'href="../');
        }
        placeholder.innerHTML = html;
        console.log("ELYSALUM GRAND: Footer Loaded");
        initScrollAnimations();
        
        // Update year
        const yr = document.getElementById('current-year');
        if(yr) yr.textContent = new Date().getFullYear();
      }
    } catch (e) { console.error('Footer error:', e); }
  };

  loadNavbar();
  loadFooter();

  // Always update year if element exists
  const yr = document.getElementById('current-year');
  if(yr) yr.textContent = new Date().getFullYear();
}

/* ----- Preloader ----- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 800);
      }, 500); // Small delay to let animations sync
    });
  }
}

/* ----- Navbar & Mobile Menu ----- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar || navbar.dataset.initialized) return;
  navbar.dataset.initialized = "true";
  
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  // Sticky Navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Menu
  if (hamburger && navMenu && navOverlay) {
    function toggleMenu() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);
    
    // Close menu when a link is clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) toggleMenu();
      });
    });
  }

  highlightActiveNavLink();
}

/* ----- Active Navigation Highlighting ----- */
function highlightActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-menu a');
  const currentPath = window.location.pathname;
  // Normalize path and get filename
  const fileName = currentPath.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    
    const linkFile = href.split('/').pop();
    
    // Check if filenames match
    if (fileName === linkFile) {
      link.classList.add('active');
    }
    
    // special case: keep 'Rooms' active on room details
    if (fileName.includes('room-details') && linkFile.includes('rooms')) {
      link.classList.add('active');
    }
  });
}

/* ----- Scroll Reveal Animations ----- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: Stop observing after it becomes visible once
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ----- Scroll To Top Button ----- */
function initScrollToTop() {
  const scrollTopBtn = document.getElementById('scroll-top');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ----- Smooth Scrolling for Anchor Links ----- */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = document.querySelector('.navbar') ? document.querySelector('.navbar').offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ----- Lazy Loading Images ----- */
function initLazyLoading() {
  const images = document.querySelectorAll('img:not([loading="lazy"])');
  
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: "50px" });

    images.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback
    images.forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
    });
  }
}

/* ----- FAQ Accordion (used in contact.html) ----- */
function initFaqAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  if (!accordionHeaders.length) return;

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      
      const currentlyActive = document.querySelector('.accordion-item.active');
      if (currentlyActive && currentlyActive !== item) {
        currentlyActive.classList.remove('active');
        currentlyActive.querySelector('.accordion-content').style.maxHeight = null;
      }
      
      if (item.classList.contains('active')) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}
/* ----- Video Modal ----- */
function initVideoModal() {
  const playBtns = document.querySelectorAll('.play-btn');
  
  if (!playBtns.length) return;

  // Create Modal element if it doesn't exist
  let videoModal = document.getElementById('video-modal');
  if (!videoModal) {
    videoModal = document.createElement('div');
    videoModal.id = 'video-modal';
    videoModal.className = 'video-modal';
    videoModal.innerHTML = `
      <div class="video-modal-content">
        <button class="video-modal-close">&times;</button>
        <div class="video-container">
          <iframe src="" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(videoModal);
  }

  const iframe = videoModal.querySelector('iframe');
  const closeBtn = videoModal.querySelector('.video-modal-close');

  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // High-quality luxury resort cinematic video
      const videoSrc = "https://www.youtube.com/embed/T6ZAnC5B-fI?autoplay=1&mute=0&rel=0"; 
      iframe.src = videoSrc;
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  closeBtn.addEventListener('click', () => {
    videoModal.classList.remove('active');
    iframe.src = "";
    document.body.style.overflow = '';
  });

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeBtn.click();
    }
  });
}


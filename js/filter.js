/* ===== FILTER.JS - Dynamic Filtering & Sorting ===== */

document.addEventListener('DOMContentLoaded', () => {
  initRoomFilters();
  initGalleryFilters();
  initRoomSearch();
});

function updateRoomVisibility() {
  const activeCategory = document.querySelector('.room-filter-btn.active')?.dataset.filter || 'all';
  const searchTerm = (document.getElementById('roomSearch')?.value || '').toLowerCase();
  const roomCards = document.querySelectorAll('.room-card');

  roomCards.forEach(card => {
    const category = card.dataset.category;
    const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

    const matchesCategory = activeCategory === 'all' || category === activeCategory;
    const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

    const match = matchesCategory && matchesSearch;

    // Clear any existing timeouts to prevent race conditions
    if (card.filterTimeout) {
      clearTimeout(card.filterTimeout);
    }

    if (match) {
      card.style.display = '';
      card.filterTimeout = setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 10);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      card.filterTimeout = setTimeout(() => {
        card.style.display = 'none';
      }, 300);
    }
  });
}

function initRoomFilters() {
  const filterBtns = document.querySelectorAll('.room-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateRoomVisibility();
    });
  });
}

function initRoomSearch() {
  const searchInput = document.getElementById('roomSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', updateRoomVisibility);
}

// Exposed sorting function for the select dropdown in rooms.html
window.sortRooms = function(sortBy) {
  const grid = document.querySelector('.rooms-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.room-card'));

  cards.sort((a, b) => {
    const priceA = parseInt(a.dataset.price) || 0;
    const priceB = parseInt(b.dataset.price) || 0;
    const nameA = (a.dataset.name || '').toLowerCase();
    const nameB = (b.dataset.name || '').toLowerCase();

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'name') return nameA.localeCompare(nameB);
    return 0; // default
  });

  // Reattach sorted elements to the DOM with a slight fade
  cards.forEach(card => {
    card.style.opacity = '0';
    grid.appendChild(card);
    
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.5s ease';
      card.style.opacity = '1';
    });
  });
};

/* ----- Gallery Category Filtering ----- */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item[data-category]');

  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.filter;

      galleryItems.forEach(item => {
        const match = category === 'all' || item.dataset.category === category;
        
        // Clear any existing timeouts to prevent race conditions
        if (item.filterTimeout) {
          clearTimeout(item.filterTimeout);
        }
        
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        if (match) {
          item.style.display = '';
          // Small delay before fading in to ensure display change registers
          item.filterTimeout = setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          // Wait for fade out to complete before setting display none
          item.filterTimeout = setTimeout(() => {
            item.style.display = 'none';
          }, 400);
        }
      });
    });
  });
}


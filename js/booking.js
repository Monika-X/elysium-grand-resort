/* ===== BOOKING.JS - Reservation Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters if arriving from the homepage quick booking bar
  const urlParams = new URLSearchParams(window.location.search);
  const checkInParam = urlParams.get('check-in');
  const checkOutParam = urlParams.get('check-out');
  const guestsParam = urlParams.get('guests');
  
  if (checkInParam) {
    const checkInInput = document.getElementById('check-in');
    if (checkInInput) checkInInput.value = checkInParam;
  }
  
  if (checkOutParam) {
    const checkOutInput = document.getElementById('check-out');
    if (checkOutInput) checkOutInput.value = checkOutParam;
  }
  
  if (guestsParam) {
    const guestsInput = document.getElementById('guests');
    if (guestsInput) guestsInput.value = guestsParam;
  }
  
  initBookingForm();
  initDatePickers();
  initGuestSelector();
  initRoomSelection();
  
  // Initial summary update
  updateBookingSummary();
});

/* ----- Date Pickers Validation ----- */
function initDatePickers() {
  const checkIn = document.getElementById('check-in');
  const checkOut = document.getElementById('check-out');

  if (checkIn && checkOut) {
    const today = new Date().toISOString().split('T')[0];
    checkIn.setAttribute('min', today);
    
    if (!checkIn.value) checkIn.value = today;

    checkIn.addEventListener('change', () => {
      const nextDay = new Date(checkIn.value);
      nextDay.setDate(nextDay.getDate() + 1);
      const minOutDate = nextDay.toISOString().split('T')[0];
      
      checkOut.setAttribute('min', minOutDate);
      
      if (!checkOut.value || new Date(checkOut.value) <= new Date(checkIn.value)) {
        checkOut.value = minOutDate;
      }
      updateBookingSummary();
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkOut.setAttribute('min', tomorrow.toISOString().split('T')[0]);
    if (!checkOut.value) checkOut.value = tomorrow.toISOString().split('T')[0];
    
    checkOut.addEventListener('change', updateBookingSummary);
  }
}

/* ----- Guest Counter ----- */
function initGuestSelector() {
  const guestBtns = document.querySelectorAll('.guest-btn');
  guestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      
      const action = btn.dataset.action;
      let value = parseInt(input.value) || 1;
      const min = parseInt(input.min) || 1;
      const max = parseInt(input.max) || 10;

      if (action === 'increase' && value < max) value++;
      if (action === 'decrease' && value > min) value--;

      input.value = value;
      updateBookingSummary();
    });
  });
}

/* ----- Interactive Room Selection ----- */
function initRoomSelection() {
  const roomCards = document.querySelectorAll('.room-select-card');
  roomCards.forEach(card => {
    card.addEventListener('click', () => {
      roomCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      
      updateBookingSummary();
    });
  });
}

/* ----- Form Validation & Submission ----- */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateBookingForm(form)) return;

    // Collect data for confirmation
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Check extra services if they exist (checkboxes might not have names in the simple setup, but we'll capture them if they do)
    
    showBookingConfirmation(data);
  });
}

function validateBookingForm(form) {
  let valid = true;
  const required = form.querySelectorAll('[required]');

  required.forEach(field => {
    const group = field.closest('.form-group');
    if (!field.value.trim()) {
      valid = false;
      if (group) group.classList.add('error');
    } else {
      if (group) group.classList.remove('error');
    }
  });

  const email = form.querySelector('[type="email"]');
  if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    valid = false;
    const group = email.closest('.form-group');
    if (group) group.classList.add('error');
  }

  const phone = form.querySelector('[type="tel"]');
  if (phone && phone.value && phone.value.replace(/\D/g,'').length < 10) {
    // Simple 10 digit check
    valid = false;
    const group = phone.closest('.form-group');
    if (group) group.classList.add('error');
  }

  return valid;
}

/* ----- Dynamic Summary Calculation ----- */
function updateBookingSummary() {
  const checkIn = document.getElementById('check-in');
  const checkOut = document.getElementById('check-out');
  const summaryNights = document.getElementById('summary-nights');
  const summaryTotal = document.getElementById('summary-total');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryRoom = document.getElementById('summary-room');
  const summaryRate = document.getElementById('summary-rate');

  if (!checkIn || !checkOut || !checkIn.value || !checkOut.value) return;

  // Calculate Nights
  const dateIn = new Date(checkIn.value);
  const dateOut = new Date(checkOut.value);
  let nights = Math.ceil((dateOut - dateIn) / (1000 * 60 * 60 * 24));
  if (nights < 1) nights = 1;

  if (summaryNights) summaryNights.textContent = nights + (nights === 1 ? ' Night' : ' Nights');

  // Get Room Price
  let pricePerNight = 299; // Default fallback
  const selectedRoomCard = document.querySelector('.room-select-card.selected');
  
  if (selectedRoomCard) {
    pricePerNight = parseInt(selectedRoomCard.dataset.price) || 299;
    if (summaryRoom) summaryRoom.textContent = selectedRoomCard.dataset.name || 'Selected Room';
  }

  // Get Guests
  const guestInput = document.getElementById('guests');
  const guestCount = guestInput ? parseInt(guestInput.value) || 1 : 1;

  if (summaryRate) summaryRate.textContent = `₹${pricePerNight} × ${nights} nights × ${guestCount} guests`;

  // Total Calculation
  const subtotal = nights * pricePerNight * guestCount;
  // Let's assume taxes are included in total for simplicity or explicitly show them
  // If we had extra services, we would add them here.
  
  if (summarySubtotal) summarySubtotal.textContent = '₹' + subtotal.toLocaleString();
  if (summaryTotal) summaryTotal.textContent = '₹' + subtotal.toLocaleString();
}

/* ----- Confirmation Popup Modal ----- */
function showBookingConfirmation(data) {
  const modal = document.createElement('div');
  modal.className = 'booking-modal';
  
  const roomName = document.querySelector('.room-select-card.selected')?.dataset.name || 'Premium Room';
  const total = document.getElementById('summary-total')?.textContent || '₹0';

  modal.innerHTML = `
    <div class="booking-modal-overlay"></div>
    <div class="booking-modal-content animate-scale-in">
      <div class="booking-modal-icon">✓</div>
      <h2 style="font-family: var(--font-heading); color: var(--navy); margin-bottom: 0.5rem; font-size: 2rem;">Booking Confirmed</h2>
      <p style="color: var(--text-muted); margin-bottom: 2rem;">Thank you, ${data['full-name'] || 'Guest'}. Your luxury escape awaits.</p>
      
      <div style="background: var(--beige); padding: 1.5rem; border-radius: var(--radius-sm); margin-bottom: 2rem; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem;">
          <span style="color: var(--text-muted);">Room</span>
          <span style="font-weight: 600; color: var(--navy);">${roomName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem;">
          <span style="color: var(--text-muted);">Check-in</span>
          <span style="font-weight: 600; color: var(--navy);">${data['check-in']}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 0.5rem;">
          <span style="color: var(--text-muted);">Check-out</span>
          <span style="font-weight: 600; color: var(--navy);">${data['check-out']}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Total</span>
          <span style="font-weight: 600; color: var(--gold); font-size: 1.25rem;">${total}</span>
        </div>
      </div>
      
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 2rem; font-style: italic;">
        A detailed itinerary has been sent to ${data['email'] || 'your email'}.
      </p>
      
      <button class="btn btn-primary btn-sweep" style="width: 100%; justify-content: center;" onclick="window.location.href='../index.html'">Return to Home</button>
    </div>
  `;

  // Inject modal CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .booking-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .booking-modal-overlay { position: absolute; inset: 0; background: rgba(11,29,38,0.8); backdrop-filter: blur(8px); }
    .booking-modal-content { position: relative; background: var(--white); padding: 3rem; border-radius: var(--radius-lg); text-align: center; max-width: 500px; width: 100%; box-shadow: var(--shadow-premium); }
    .booking-modal-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--gold); color: var(--white); font-size: 2.5rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(modal);
}


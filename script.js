// Annabel's Pet Care — Interactive Features

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 2. Booking Form Submission Handling
  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');

  // Static site — there is no server to post to, so the form hands the
  // enquiry to the visitor's SMS app pre-filled. Never claim it "sent".
  const ANNA_SMS = '+19139405855';

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const val = (id) => (document.getElementById(id)?.value || '').trim();
      const serviceEl = document.getElementById('service');
      const serviceLabel = serviceEl?.selectedOptions?.[0]?.text || '';

      const lines = [
        `Hi Anna! I'd like to book ${serviceLabel || 'pet care'}.`,
        '',
        `Name: ${val('ownerName')}`,
        `Phone: ${val('phone')}`,
        `Pet(s): ${val('petName')}`,
        val('dates') ? `When: ${val('dates')}` : '',
        val('notes') ? `Notes: ${val('notes')}` : ''
      ].filter(Boolean);

      const href = `sms:${ANNA_SMS}${/iPhone|iPad|Mac/i.test(navigator.userAgent) ? '&' : '?'}body=`
        + encodeURIComponent(lines.join('\n'));

      formStatus.className = 'form-status success';
      formStatus.innerHTML = 'Opening your messages app… if nothing happens, text Anna directly at '
        + `<a href="tel:${ANNA_SMS}">(913) 940-5855</a>.`;

      window.location.href = href;
    });
  }

});

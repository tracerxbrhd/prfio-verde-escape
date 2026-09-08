import { cabins, calculateStay, localDate } from './booking.js';
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
});
const booking = document.querySelector('#booking-dialog');
const form = document.querySelector('#booking-form');
const arrival = document.querySelector('#arrival');
const departure = document.querySelector('#departure');
arrival.min = localDate();
arrival.value = localDate(new Date(Date.now() + 7 * 86400000));
departure.value = localDate(new Date(Date.now() + 9 * 86400000));
function readStay() {
  return {
    cabin: form.elements.cabin.value,
    arrival: arrival.value,
    departure: departure.value,
    guests: Number(form.elements.guests.value),
    dog: form.elements.dog.checked,
  };
}
function updatePrice() {
  departure.min = arrival.value || localDate();
  const stay = readStay();
  const result = calculateStay(stay);
  document.querySelector('#booking-error').textContent = result.error || '';
  document.querySelector('.save-plan').disabled = Boolean(result.error);
  document.querySelector('#booking-success').textContent = '';
  document.querySelector('#stay-length').textContent = result.error
    ? 'Adjust your stay above'
    : result.nights +
      ' nights · ' +
      stay.guests +
      (stay.guests === 1 ? ' guest' : ' guests');
  document.querySelector('#stay-total').textContent = result.error
    ? '—'
    : '€' + result.total.toLocaleString('en-IE');
  document.querySelector('#stay-breakdown').textContent = result.error
    ? 'Your price will appear when the details are valid.'
    : '€' +
      result.nightly +
      ' × ' +
      result.nights +
      ' nights' +
      (stay.dog ? ' + €25 dog supplement' : '') +
      ' · taxes & cleaning included';
}
form.addEventListener('input', updatePrice);
document.querySelectorAll('[data-book]').forEach((button) =>
  button.addEventListener('click', () => {
    if (button.dataset.cabin) {
      form.elements.cabin.value = button.dataset.cabin;
      form.elements.guests.value = '2';
      form.elements.dog.checked = false;
    }
    updatePrice();
    booking.showModal();
  }),
);
document
  .querySelector('.close-dialog')
  .addEventListener('click', () => booking.close());
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const stay = readStay();
  const quote = calculateStay(stay);
  if (quote.error) {
    updatePrice();
    return;
  }
  const text =
    'VERDE ESCAPE — YOUR STAY PLAN\n\n' +
    cabins[stay.cabin].name +
    '\nArrival: ' +
    stay.arrival +
    ' (from 15:00)\nDeparture: ' +
    stay.departure +
    ' (by 11:00)\nGuests: ' +
    stay.guests +
    '\nNights: ' +
    quote.nights +
    '\nDog: ' +
    (stay.dog ? 'Yes' : 'No') +
    '\nIndicative total: EUR ' +
    quote.total +
    '\nTaxes and standard cleaning included.\n\nThis is a locally generated stay plan, not a reservation or confirmation of availability. No payment has been taken.';
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/plain;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'verde-stay-plan.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#booking-success').textContent =
    'Your stay plan is saved. This is a plan to keep, not a confirmed reservation.';
});
const gallery = [
  {
    src: './media/forest-cabin.webp',
    caption: 'The Lake House, just before the day begins.',
  },
  {
    src: './media/oak-interior.webp',
    caption: 'The Woodland Suite. A window worth sitting beside.',
  },
];
let current = 0;
const lightbox = document.querySelector('#lightbox');
function updateGallery() {
  const item = gallery[current];
  for (const selector of ['#gallery-image', '#lightbox-image']) {
    const img = document.querySelector(selector);
    img.src = item.src;
    img.alt = item.caption;
  }
  document.querySelector('#gallery-count').textContent =
    String(current + 1).padStart(2, '0') + ' / 02';
  document.querySelector('#gallery-caption').textContent = item.caption;
  document.querySelector('#lightbox-caption').textContent = item.caption;
}
function moveGallery(direction) {
  current = (current + direction + gallery.length) % gallery.length;
  updateGallery();
}
document
  .querySelector('#gallery-prev')
  .addEventListener('click', () => moveGallery(-1));
document
  .querySelector('#gallery-next')
  .addEventListener('click', () => moveGallery(1));
document
  .querySelector('#lightbox-prev')
  .addEventListener('click', () => moveGallery(-1));
document
  .querySelector('#lightbox-next')
  .addEventListener('click', () => moveGallery(1));
document.querySelector('#gallery-open').addEventListener('click', () => {
  updateGallery();
  lightbox.showModal();
});
document.querySelectorAll('[data-gallery]').forEach((button) =>
  button.addEventListener('click', () => {
    current = Number(button.dataset.gallery);
    updateGallery();
    lightbox.showModal();
  }),
);
document
  .querySelector('#lightbox-close')
  .addEventListener('click', () => lightbox.close());
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.05 },
);
document
  .querySelectorAll(
    '.intro h2,.intro>p,.section-heading,.principle,.experiences article',
  )
  .forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
let pending = false;
window.addEventListener(
  'scroll',
  () => {
    if (pending || reducedMotion.matches || innerWidth < 768) return;
    pending = true;
    requestAnimationFrame(() => {
      const offset = Math.min(scrollY, 800) * 0.025;
      document.querySelector('.hero-image').style.objectPosition =
        '50% calc(54% + ' + offset + 'px)';
      pending = false;
    });
  },
  { passive: true },
);

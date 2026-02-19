const RENTER_STORAGE_KEY = 'rental-reviews';
const LANDLORD_STORAGE_KEY = 'landlord-renter-reviews';

const renterForm = document.getElementById('renter-review-form');
const landlordForm = document.getElementById('landlord-review-form');

const renterReviewsContainer = document.getElementById('renter-reviews');
const landlordReviewsContainer = document.getElementById('landlord-reviews');

const renterStatsContainer = document.getElementById('renter-stats');
const landlordStatsContainer = document.getElementById('landlord-stats');

const clearRenterButton = document.getElementById('clear-renter-reviews');
const clearLandlordButton = document.getElementById('clear-landlord-reviews');

const renterTemplate = document.getElementById('renter-review-template');
const landlordTemplate = document.getElementById('landlord-review-template');

const renterLabels = {
  propertyRating: 'Property',
  neighborhoodRating: 'Neighborhood',
  amenitiesRating: 'Amenities',
  neighborsRating: 'Neighbors',
  landlordRating: 'Landlord',
};

const landlordLabels = {
  paymentRating: 'Payment',
  careRating: 'Property care',
  communicationRating: 'Communication',
  considerationRating: 'Consideration',
  complianceRating: 'Compliance',
};

let renterReviews = loadReviews(RENTER_STORAGE_KEY);
let landlordReviews = loadReviews(LANDLORD_STORAGE_KEY);
renderAll();

renterForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const review = {
    property: document.getElementById('property').value.trim(),
    neighborhood: document.getElementById('neighborhood').value.trim(),
    state: document.getElementById('state').value.trim().toUpperCase(),
    year: document.getElementById('year').value.trim(),
    propertyRating: Number(document.getElementById('property-rating').value),
    neighborhoodRating: Number(document.getElementById('neighborhood-rating').value),
    amenitiesRating: Number(document.getElementById('amenities-rating').value),
    neighborsRating: Number(document.getElementById('neighbors-rating').value),
    landlordRating: Number(document.getElementById('landlord-rating').value),
    comment: document.getElementById('comment').value.trim(),
    createdAt: new Date().toISOString(),
  };

  renterReviews.unshift(review);
  persistReviews(RENTER_STORAGE_KEY, renterReviews);
  renderAll();
  renterForm.reset();
});

landlordForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const review = {
    renterName: document.getElementById('renter-name').value.trim(),
    property: document.getElementById('renter-property').value.trim(),
    state: document.getElementById('renter-state').value.trim().toUpperCase(),
    leaseEndYear: document.getElementById('lease-end-year').value.trim(),
    paymentRating: Number(document.getElementById('payment-rating').value),
    careRating: Number(document.getElementById('care-rating').value),
    communicationRating: Number(document.getElementById('communication-rating').value),
    considerationRating: Number(document.getElementById('consideration-rating').value),
    complianceRating: Number(document.getElementById('compliance-rating').value),
    comment: document.getElementById('landlord-comment').value.trim(),
    createdAt: new Date().toISOString(),
  };

  landlordReviews.unshift(review);
  persistReviews(LANDLORD_STORAGE_KEY, landlordReviews);
  renderAll();
  landlordForm.reset();
});

clearRenterButton.addEventListener('click', () => {
  if (!renterReviews.length) {
    return;
  }

  if (!window.confirm('Delete all renter reviews? This cannot be undone.')) {
    return;
  }

  renterReviews = [];
  persistReviews(RENTER_STORAGE_KEY, renterReviews);
  renderAll();
});

clearLandlordButton.addEventListener('click', () => {
  if (!landlordReviews.length) {
    return;
  }

  if (!window.confirm('Delete all landlord reviews? This cannot be undone.')) {
    return;
  }

  landlordReviews = [];
  persistReviews(LANDLORD_STORAGE_KEY, landlordReviews);
  renderAll();
});

function loadReviews(storageKey) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistReviews(storageKey, reviews) {
  localStorage.setItem(storageKey, JSON.stringify(reviews));
}

function renderAll() {
  renderStats(renterReviews, renterLabels, renterStatsContainer, 'No renter ratings yet.');
  renderStats(landlordReviews, landlordLabels, landlordStatsContainer, 'No landlord ratings yet.');
  renderRenterReviews();
  renderLandlordReviews();
}

function renderStats(reviews, labels, container, emptyText) {
  if (!reviews.length) {
    container.innerHTML = `<p>${emptyText}</p>`;
    return;
  }

  const averages = Object.keys(labels).reduce((acc, key) => {
    acc[key] = average(reviews, key);
    return acc;
  }, {});

  container.innerHTML = [
    statCard('Total reviews', String(reviews.length)),
    ...Object.entries(averages).map(([key, value]) => statCard(labels[key], `${value.toFixed(1)} / 5`)),
  ].join('');
}

function renderRenterReviews() {
  if (!renterReviews.length) {
    renterReviewsContainer.innerHTML = '<p>No renter reviews posted yet.</p>';
    return;
  }

  renterReviewsContainer.innerHTML = '';
  renterReviews.forEach((review) => {
    const card = renterTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector('.review-title').textContent = review.property;

    const yearText = review.year ? ` · Moved in: ${review.year}` : '';
    const dateText = new Date(review.createdAt).toLocaleDateString();
    card.querySelector('.review-meta').textContent = `${review.neighborhood}, ${review.state}${yearText} · Posted: ${dateText}`;

    const badges = card.querySelector('.badge-row');
    badges.innerHTML = [
      badge('Property', review.propertyRating),
      badge('Neighborhood', review.neighborhoodRating),
      badge('Amenities', review.amenitiesRating),
      badge('Neighbors', review.neighborsRating),
      badge('Landlord', review.landlordRating),
      textBadge('State', review.state),
    ].join('');

    card.querySelector('.review-comment').textContent = review.comment;
    renterReviewsContainer.appendChild(card);
  });
}

function renderLandlordReviews() {
  if (!landlordReviews.length) {
    landlordReviewsContainer.innerHTML = '<p>No landlord reviews posted yet.</p>';
    return;
  }

  landlordReviewsContainer.innerHTML = '';
  landlordReviews.forEach((review) => {
    const card = landlordTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector('.review-title').textContent = `Renter: ${review.renterName}`;

    const yearText = review.leaseEndYear ? ` · Lease ended: ${review.leaseEndYear}` : '';
    const dateText = new Date(review.createdAt).toLocaleDateString();
    card.querySelector('.review-meta').textContent = `${review.property}, ${review.state}${yearText} · Posted: ${dateText}`;

    const badges = card.querySelector('.badge-row');
    badges.innerHTML = [
      badge('Payment', review.paymentRating),
      badge('Property care', review.careRating),
      badge('Communication', review.communicationRating),
      badge('Consideration', review.considerationRating),
      badge('Compliance', review.complianceRating),
      textBadge('State', review.state),
    ].join('');

    card.querySelector('.review-comment').textContent = review.comment;
    landlordReviewsContainer.appendChild(card);
  });
}

function average(reviews, field) {
  const total = reviews.reduce((sum, review) => sum + (Number(review[field]) || 0), 0);
  return total / reviews.length;
}

function statCard(label, value) {
  return `<article class="stat-card"><p class="stat-label">${label}</p><p class="stat-value">${value}</p></article>`;
}

function badge(label, value) {
  return `<span class="badge">${label}: ${value}/5</span>`;
}

function textBadge(label, value) {
  return `<span class="badge">${label}: ${value}</span>`;
}

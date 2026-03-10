/* === Local Images Config ===
 * Drop your photos into the images/ folder, organized by category.
 * Name each file to match the slug below, e.g.:
 *   images/destinations/coral-triangle.jpg
 *   images/fish/whale-shark.jpg
 *
 * Change IMAGES_EXT if your files are .png or .webp
 */
const IMAGES_PATH = 'images';
const IMAGES_EXT  = 'jpg'; // default extension

function localUrl(publicId) {
  /* If the publicId already has an extension, use it as-is */
  return /\.\w+$/.test(publicId)
    ? `${IMAGES_PATH}/${publicId}`
    : `${IMAGES_PATH}/${publicId}.${IMAGES_EXT}`;
}

/* Sync sticky filter offset to actual header height */
function syncHeaderOffset() {
  const h = document.querySelector('.site-header').offsetHeight;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
syncHeaderOffset();
window.addEventListener('resize', syncHeaderOffset);

/* Inject images into gallery items */
document.querySelectorAll('.gallery-item[data-cld-id]').forEach(item => {
  const img = document.createElement('img');
  img.src = localUrl(item.dataset.cldId);
  img.alt = item.dataset.title;
  img.className = 'item-photo';
  img.loading = 'lazy';
  /* Hide broken images — gradient placeholder shows through */
  img.onerror = () => { img.style.display = 'none'; };
  item.querySelector('.item-img').appendChild(img);
});


/* === Filter === */
const filterBtns   = document.querySelectorAll('.filter-btn');
const subBtns      = document.querySelectorAll('.filter-sub-btn');
const destBtn      = document.getElementById('destBtn');
const destDropdown = document.getElementById('destDropdown');
const filterSection = document.querySelector('.filter-section');
const items        = document.querySelectorAll('.gallery-item');

let activeCategory    = 'all';
let activeSubLocation = '';

function positionDropdown() {
  const btnRect     = destBtn.getBoundingClientRect();
  const sectionRect = filterSection.getBoundingClientRect();
  destDropdown.style.left = (btnRect.left - sectionRect.left) + 'px';
}

function openDropdown() {
  positionDropdown();
  destDropdown.classList.add('open');
  destBtn.classList.add('open');
}

function closeDropdown() {
  destDropdown.classList.remove('open');
  destBtn.classList.remove('open');
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const filter = btn.dataset.filter;

    if (filter === 'destinations') {
      // Activate destinations; toggle dropdown
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = 'destinations';
      destDropdown.classList.contains('open') ? closeDropdown() : openDropdown();
    } else {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = filter;
      activeSubLocation = '';
      subBtns.forEach(b => b.classList.remove('active'));
      destDropdown.querySelector('[data-sublocation=""]').classList.add('active');
      closeDropdown();
    }
    applyFilter();
  });
});

subBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    subBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeSubLocation = btn.dataset.sublocation;
    closeDropdown();
    applyFilter();
  });
});

document.addEventListener('click', () => closeDropdown());

function applyFilter() {
  items.forEach(item => {
    const catMatch = activeCategory === 'all' || item.dataset.category === activeCategory;
    const locMatch = !activeSubLocation || item.dataset.location.includes(activeSubLocation);
    item.classList.toggle('hidden', !(catMatch && locMatch));
  });
}

function filterGallery(filter) {
  filterBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  activeCategory = filter;
  activeSubLocation = '';
  closeDropdown();
  applyFilter();
}


/* === Lightbox === */
const lightbox = document.getElementById('lightbox');
const lbImage  = document.getElementById('lbImage');
const lbTitle  = document.getElementById('lbTitle');
const lbLoc    = document.getElementById('lbLoc');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');

let visibleItems = [];
let currentIndex = 0;

function openLightbox(item) {
  visibleItems = [...document.querySelectorAll('.gallery-item:not(.hidden)')];
  currentIndex = visibleItems.indexOf(item);
  showLightboxItem(currentIndex);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function showLightboxItem(index) {
  const item = visibleItems[index];
  const cldId = item.dataset.cldId;

  lbImage.innerHTML = '';

  if (cldId) {
    const img = document.createElement('img');
    img.src = localUrl(cldId);
    img.alt = item.dataset.title;
    img.onerror = () => {
      /* Fall back to gradient if image not found */
      lbImage.removeChild(img);
      lbImage.style.background = item.querySelector('.item-img').style.getPropertyValue('--g');
    };
    lbImage.appendChild(img);
    lbImage.style.background = '';
  } else {
    lbImage.style.background = item.querySelector('.item-img').style.getPropertyValue('--g');
  }

  lbTitle.textContent = item.dataset.title;
  lbLoc.textContent   = item.dataset.location;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

items.forEach(item => {
  item.addEventListener('click', () => openLightbox(item));
});

lbClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

lbPrev.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showLightboxItem(currentIndex);
});

lbNext.addEventListener('click', e => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showLightboxItem(currentIndex);
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showLightboxItem(currentIndex); }
  if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; showLightboxItem(currentIndex); }
});

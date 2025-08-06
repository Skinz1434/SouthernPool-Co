/**
 * SOUTHERN POOL CO - MAIN JAVASCRIPT
 * Ultra-modern interactions and animations
 */

// === GLOBAL STATE ===
let testimonialIndex = 0;
let testimonialsPerView = 3; // Default for desktop
let testimonials = [];
let galleryImages = [];
let isDarkMode = localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  loadTestimonials();
  generateGallery();
  initializeScrollAnimations();
  initializeLottieAnimations();
  initializeFormValidation();
  initializeTimelineAnimation();
  preloadCriticalAssets();
  
  // Initialize carousel after testimonials are loaded
  setTimeout(initializeTestimonialCarousel, 100);
  
  // Update testimonials per view on resize
  window.addEventListener('resize', updateTestimonialsPerView);
  updateTestimonialsPerView();
});

// === THEME MANAGEMENT ===
function initializeTheme() {
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  }
  
  // Smooth transition effect
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 300);
}

// === TESTIMONIALS CAROUSEL 2.0 ===
function updateTestimonialsPerView() {
  const width = window.innerWidth;
  if (width <= 768) {
    testimonialsPerView = 1; // Mobile
  } else if (width <= 1024) {
    testimonialsPerView = 2; // Tablet
  } else {
    testimonialsPerView = 3; // Desktop
  }
  
  // Update display if testimonials are already loaded
  if (testimonials.length > 0) {
    // Reset index to stay within bounds
    const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);
    testimonialIndex = Math.min(testimonialIndex, maxIndex);
    
    updatePaginationDots();
    updateTestimonialDisplay();
  }
}

async function loadTestimonials() {
  try {
    const response = await fetch('testimonials.json');
    testimonials = await response.json();
    renderTestimonials();
  } catch (error) {
    console.warn('Failed to load testimonials, using fallback data');
    testimonials = getFallbackTestimonials();
    renderTestimonials();
  }
}

function getFallbackTestimonials() {
  return [
    {
      name: "Sarah Martinez",
      city: "Baton Rouge",
      quote: "SouthernPool transformed our backyard into a paradise. The kids haven't stopped smiling since!",
      rating: 5,
      avatar: "photos/kiddos.jpg"
    },
    {
      name: "Mike Thompson", 
      city: "Lafayette",
      quote: "Professional, punctual, and the quality is outstanding. Worth every penny!",
      rating: 5,
      avatar: "photos/Fam1.jpg"
    },
    {
      name: "Jennifer Davis",
      city: "New Orleans", 
      quote: "They treated us like family from day one. The attention to detail is incredible!",
      rating: 5,
      avatar: "photos/fam2.jpg"
    },
    {
      name: "Robert Johnson",
      city: "Shreveport",
      quote: "The smart pool technology is amazing. Everything is automated and crystal clear!",
      rating: 5,
      avatar: "photos/augpool2.jpg"
    },
    {
      name: "Lisa Chen",
      city: "Metairie",
      quote: "From consultation to completion, the entire process was seamless. Highly recommend!",
      rating: 5,
      avatar: "photos/maypool1.jpg"
    }
  ];
}

function renderTestimonials() {
  const track = document.getElementById('testimonialTrack');
  const pagination = document.getElementById('carouselPagination');
  
  if (!track || !pagination) return;
  
  track.innerHTML = '';
  pagination.innerHTML = '';
  
  testimonials.forEach((testimonial, index) => {
    // Create testimonial slide
    const slide = document.createElement('div');
    slide.className = 'testimonial-slide';
    slide.innerHTML = `
      <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar" loading="lazy">
      <blockquote class="testimonial-quote">"${testimonial.quote}"</blockquote>
      <div class="testimonial-author">${testimonial.name}, ${testimonial.city}</div>
      <div class="testimonial-rating" aria-label="${testimonial.rating} out of 5 stars">
        ${generateStars(testimonial.rating)}
      </div>
    `;
    track.appendChild(slide);
  });
  
  // Create pagination dots based on groups of testimonials
  updatePaginationDots();
}

function updatePaginationDots() {
  const pagination = document.getElementById('carouselPagination');
  if (!pagination) return;
  
  pagination.innerHTML = '';
  
  // Calculate number of pages needed
  const totalPages = Math.ceil(testimonials.length / testimonialsPerView);
  
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to testimonials page ${i + 1}`);
    dot.onclick = () => goToTestimonial(i * testimonialsPerView);
    pagination.appendChild(dot);
  }
}

function generateStars(rating) {
  return Array(5).fill(0).map((_, i) => 
    `<span class="star" aria-hidden="true">${i < rating ? '★' : '☆'}</span>`
  ).join('');
}

function initializeTestimonialCarousel() {
  if (testimonials.length === 0) return;
  
  updateTestimonialDisplay();
  
  // Auto-advance carousel
  setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    updateTestimonialDisplay();
  }, 6000);
}

function updateTestimonialDisplay() {
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (!track) return;
  
  // Calculate percentage based on testimonials per view
  const translateX = -(testimonialIndex * (100 / testimonialsPerView));
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update active page dot
  dots.forEach((dot, pageIndex) => {
    const isActivePage = pageIndex === Math.floor(testimonialIndex / testimonialsPerView);
    dot.classList.toggle('active', isActivePage);
  });
}

function goToTestimonial(index) {
  // Ensure we don't go past available testimonials
  const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);
  testimonialIndex = Math.min(index, maxIndex);
  updateTestimonialDisplay();
}

function prevTestimonial() {
  const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);
  if (testimonialIndex === 0) {
    testimonialIndex = maxIndex;
  } else {
    testimonialIndex = Math.max(0, testimonialIndex - testimonialsPerView);
  }
  updateTestimonialDisplay();
}

function nextTestimonial() {
  const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);
  testimonialIndex = testimonialIndex >= maxIndex ? 0 : 
                    Math.min(maxIndex, testimonialIndex + testimonialsPerView);
  updateTestimonialDisplay();
}

// === DYNAMIC GALLERY GENERATION ===
function generateGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;
  
  // Pool image filenames from the photos directory
  galleryImages = [
    { src: 'photos/augpool1.jpg', title: 'Modern Pool Paradise' },
    { src: 'photos/augpool2.jpg', title: 'Family Fun Zone' }, 
    { src: 'photos/augpool3.jpg', title: 'Luxury Resort Style' },
    { src: 'photos/augpool4.jpg', title: 'Evening Elegance' },
    { src: 'photos/augpool5.jpg', title: 'Natural Integration' },
    { src: 'photos/augpool6.jpg', title: 'Contemporary Design' },
    { src: 'photos/augpool7.jpg', title: 'Backyard Oasis' },
    { src: 'photos/decpool1rainbow.jpg', title: 'Rainbow Lighting Magic' },
    { src: 'photos/decpool2rainbow.jpg', title: 'Colorful Nights' },
    { src: 'photos/decpool3.jpg', title: 'Winter Beauty' },
    { src: 'photos/julypool1.jpg', title: 'Summer Perfection' },
    { src: 'photos/julpool2.jpg', title: 'Crystal Clear Waters' },
    { src: 'photos/julypool3.jpg', title: 'Premium Craftsmanship' },
    { src: 'photos/maypool1.jpg', title: 'Spring Serenity' },
    { src: 'photos/maypool2.jpg', title: 'Landscaped Beauty' },
    { src: 'photos/octpool1.jpg', title: 'Autumn Elegance' }
  ];
  
  // Shuffle for variety
  shuffleArray(galleryImages);
  
  galleryImages.forEach((image, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item reveal-item';
    galleryItem.setAttribute('role', 'listitem');
    galleryItem.style.animationDelay = `${index * 0.1}s`;
    
    galleryItem.innerHTML = `
      <img src="${image.src}" alt="${image.title}" loading="lazy">
      <div class="gallery-overlay">
        <div class="gallery-title">${image.title}</div>
      </div>
    `;
    
    // Add click handler for lightbox effect
    galleryItem.addEventListener('click', () => openLightbox(index));
    
    galleryGrid.appendChild(galleryItem);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function openLightbox(index) {
  // Simple lightbox implementation
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = galleryImages[index].src;
  img.alt = galleryImages[index].title;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  `;
  
  lightbox.appendChild(img);
  document.body.appendChild(lightbox);
  
  // Close on click or ESC
  lightbox.addEventListener('click', () => {
    document.body.removeChild(lightbox);
  });
  
  document.addEventListener('keydown', function closeLightbox(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(lightbox);
      document.removeEventListener('keydown', closeLightbox);
    }
  });
}

// === SCROLL ANIMATIONS ===
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all reveal elements
  document.querySelectorAll('.reveal, .reveal-item').forEach(el => {
    revealObserver.observe(el);
  });
  
  // Parallax scrolling for hero
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
  
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    
    if (hero && scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    
    ticking = false;
  }
}

// === LOTTIE ANIMATIONS ===
function initializeLottieAnimations() {
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    const icon = card.querySelector('.service-icon');
    const lottieUrl = icon.getAttribute('data-lottie');
    
    if (lottieUrl) {
      // Create lottie player
      const lottiePlayer = document.createElement('lottie-player');
      lottiePlayer.setAttribute('src', lottieUrl);
      lottiePlayer.setAttribute('background', 'transparent');
      lottiePlayer.setAttribute('speed', '1');
      lottiePlayer.style.width = '60px';
      lottiePlayer.style.height = '60px';
      lottiePlayer.loop = false;
      lottiePlayer.autoplay = false;
      
      icon.appendChild(lottiePlayer);
      
      // Play on hover
      card.addEventListener('mouseenter', () => {
        lottiePlayer.play();
      });
      
      card.addEventListener('mouseleave', () => {
        lottiePlayer.stop();
      });
    }
  });
}

// === TIMELINE ANIMATION ===
function initializeTimelineAnimation() {
  const timelineContainer = document.querySelector('.timeline-container');
  if (!timelineContainer) return;
  
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateTimelineProgress();
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  timelineObserver.observe(timelineContainer);
}

function animateTimelineProgress() {
  const progressPath = document.querySelector('.timeline-progress');
  const steps = document.querySelectorAll('.timeline-step');
  const stepIcons = document.querySelectorAll('.step-icon');
  
  // Start the SVG path animation
  if (progressPath) {
    progressPath.style.animation = 'timelineProgress 2s ease-out forwards';
    progressPath.style.animationDelay = '0.5s';
  }
  
  // Animate steps with staggered delays
  steps.forEach((step, index) => {
    setTimeout(() => {
      step.classList.add('show');
      
      // Add pulse animation to step markers
      const marker = step.querySelector('.step-marker');
      if (marker) {
        marker.style.animation = 'markerPulse 0.6s ease-out forwards';
        marker.style.animationDelay = '0.2s';
      }
      
      // Animate individual step icons
      const icon = step.querySelector('.step-icon');
      if (icon) {
        setTimeout(() => {
          icon.style.animation = 'drawIcon 1s ease-out forwards';
        }, 300);
      }
    }, 800 + (index * 300)); // Staggered animation with 300ms between steps
  });
  
  // Add hover interactions after animation completes
  setTimeout(() => {
    addTimelineInteractivity();
  }, 3000);
}

function addTimelineInteractivity() {
  const steps = document.querySelectorAll('.timeline-step');
  
  steps.forEach((step, index) => {
    step.addEventListener('mouseenter', () => {
      // Highlight the step and add subtle scaling
      step.style.transform = 'translateY(-10px) scale(1.05)';
      step.style.transition = 'all 0.3s var(--ease-premium)';
      
      // Add glow effect to the step marker
      const marker = step.querySelector('.step-marker');
      if (marker) {
        marker.style.boxShadow = 'var(--shadow-premium), 0 0 20px rgba(240, 179, 95, 0.4)';
      }
    });
    
    step.addEventListener('mouseleave', () => {
      step.style.transform = 'translateY(0) scale(1)';
      
      const marker = step.querySelector('.step-marker');
      if (marker) {
        marker.style.boxShadow = 'var(--shadow-elevated)';
      }
    });
  });
}

// === FORM VALIDATION ===
function initializeFormValidation() {
  const form = document.getElementById('quoteForm');
  if (!form) return;
  
  const inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
  
  form.addEventListener('submit', handleFormSubmit);
}

function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  const errorElement = document.getElementById(`${fieldName}Error`);
  
  if (!errorElement) return true;
  
  let isValid = true;
  let errorMessage = '';
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = `${field.labels[0].textContent.replace('*', '')} is required`;
  }
  
  // Email validation
  if (fieldName === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Phone validation
  if (fieldName === 'phone' && value) {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
  }
  
  if (isValid) {
    field.classList.remove('error');
    errorElement.textContent = '';
  } else {
    field.classList.add('error');
    errorElement.textContent = errorMessage;
  }
  
  return isValid;
}

function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.name}Error`);
  if (errorElement) {
    field.classList.remove('error');
    errorElement.textContent = '';
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const formData = new FormData(form);
  
  // Validate all fields
  let isFormValid = true;
  const inputs = form.querySelectorAll('input[required], textarea[required]');
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });
  
  if (!isFormValid) return;
  
  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful submission
    showFormSuccess();
    form.reset();
    
    // Track conversion (analytics would go here)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        event_category: 'engagement',
        event_label: 'quote_request'
      });
    }
    
  } catch (error) {
    showFormError('Something went wrong. Please try again or call us directly.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function showFormSuccess() {
  const card = document.querySelector('.quote-card');
  const successMessage = document.createElement('div');
  successMessage.className = 'form-success';
  successMessage.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
      <h3 style="color: var(--cypress-green); margin-bottom: 1rem;">Thank You!</h3>
      <p>We've received your request and will contact you within 24 hours to discuss your dream pool.</p>
    </div>
  `;
  
  card.style.transform = 'scale(0.9)';
  card.style.opacity = '0';
  
  setTimeout(() => {
    card.innerHTML = '';
    card.appendChild(successMessage);
    card.style.transform = 'scale(1)';
    card.style.opacity = '1';
    
    // Reset form after 5 seconds
    setTimeout(() => {
      location.reload();
    }, 5000);
  }, 300);
}

function showFormError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error-banner';
  errorDiv.style.cssText = `
    background: #fee;
    color: #c53030;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    text-align: center;
  `;
  errorDiv.textContent = message;
  
  const form = document.getElementById('quoteForm');
  form.insertBefore(errorDiv, form.firstChild);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// === UTILITY FUNCTIONS ===
function scrollToQuote() {
  document.getElementById('quote').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

function preloadCriticalAssets() {
  const criticalImages = [
    'photos/logo2.png',
    'photos/augpool1.jpg',
    'photos/kiddos.jpg'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// === PERFORMANCE OPTIMIZATIONS ===
// Lazy load images
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src || img.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  imageObserver.observe(img);
});

// Reduce motion for accessibility
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--ease', 'linear');
  document.documentElement.style.setProperty('--ease-bounce', 'linear');
}

// === GLOBAL EXPORTS ===
window.toggleTheme = toggleTheme;
window.scrollToQuote = scrollToQuote;
window.goToTestimonial = goToTestimonial;
window.prevTestimonial = prevTestimonial;
window.nextTestimonial = nextTestimonial;
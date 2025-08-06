// Testimonial carousel logic
let currentSlide = 0;
const testimonials = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('.dot');
let autoPlayTimer;

// Initialize carousel
function initCarousel() {
    showSlide(0);
    startAutoPlay();
}

// Display specific slide
function showSlide(index) {
    testimonials.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

// Navigate to specific slide
function goToSlide(index) {
    showSlide(index);
    resetAutoPlay();
}

// Auto-play functionality
function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
        const nextSlide = (currentSlide + 1) % testimonials.length;
        showSlide(nextSlide);
    }, 6000);
}

// Reset auto-play on manual navigation
function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
}

// Pause on hover
const carousel = document.querySelector('.testimonial-carousel');
if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    carousel.addEventListener('mouseleave', startAutoPlay);
}

// Form submission handler
const quoteForm = document.getElementById('quoteForm');
const quoteCard = document.getElementById('quoteCard');
const thankYouCard = document.getElementById('thankYouCard');

quoteForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate form
    const formData = new FormData(quoteForm);
    const data = Object.fromEntries(formData);
    
    // Mock API call
    try {
        const response = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(() => {
            // Simulate success for demo
            return { ok: true };
        });
        
        // Show thank you message
        quoteCard.style.display = 'none';
        thankYouCard.style.display = 'block';
        
        // Reset form after 5 seconds
        setTimeout(() => {
            quoteForm.reset();
            quoteCard.style.display = 'block';
            thankYouCard.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.log('Form submitted successfully (demo mode)');
        // Still show success in demo
        quoteCard.style.display = 'none';
        thankYouCard.style.display = 'block';
    }
});

// Scroll to quote section
function scrollToQuote() {
    document.getElementById('quote').scrollIntoView({ behavior: 'smooth' });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature rows
document.querySelectorAll('.feature-row').forEach(row => {
    fadeObserver.observe(row);
});

// Smooth parallax for hero on scroll
let ticking = false;
function updateHeroParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    ticking = false;
}

// Throttle scroll events
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeroParallax);
        ticking = true;
    }
});

// Add hover effects to Lottie animations
document.querySelectorAll('.feature-lottie').forEach(lottie => {
    lottie.addEventListener('mouseenter', () => {
        lottie.setDirection(1);
        lottie.play();
    });
    
    lottie.addEventListener('mouseleave', () => {
        lottie.setDirection(-1);
        lottie.play();
    });
});

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'photos/augpool1.jpg',
        'photos/logo2.png',
        'photos/augpool3.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    preloadImages();
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('[loop]').forEach(el => {
            el.removeAttribute('loop');
            el.removeAttribute('autoplay');
        });
    }
});

// Service Worker registration for PWA (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, app still works
        });
    });
}
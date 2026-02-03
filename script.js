document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Optional: Animate icon
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons(); // Re-render icon
        });
    }

    // Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Smooth Scrolling for Anchor Links (integrated with Lenis)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // Close mobile menu on click

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement);
            }
        });
    });

    // Scroll Animation (Fade In)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial Hide/Show Logic
    const sections = document.querySelectorAll('section, .project-card, .about-card, .timeline-item');
    sections.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // CSS for the visible class (dynamically added)
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // Particle Animation
    initParticles();
});

function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Initial resize
    resize();

    // Resize listener
    window.addEventListener('resize', () => {
        resize();
        init(); // Re-initialize particles on resize to adjust density
    });

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            // Burst particles are faster
            const velocityMultiplier = isBurst ? 2 : 0.2;
            this.vx = (Math.random() - 0.5) * velocityMultiplier;
            this.vy = (Math.random() - 0.5) * velocityMultiplier;
            this.size = Math.random() * 2 + 1;
            this.color = 'rgba(99, 102, 241, 0.3)';
            this.isBurst = isBurst;
            this.life = 1; // For burst particles
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.isBurst) {
                this.life -= 0.02;
                this.size *= 0.95; // Shrink
            } else {
                // Bounce off edges with damping
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
        }

        draw() {
            ctx.fillStyle = this.isBurst ? `rgba(99, 102, 241, ${this.life})` : this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        // Increased density slightly for better coverage
        const numberOfParticles = (canvas.width * canvas.height) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    // Click Event for Burst
    window.addEventListener('click', (e) => {
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(e.clientX, e.clientY, true));
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Remove dead burst particles
            if (particles[i].isBurst && particles[i].life <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }

            // Draw connections (skip burst particles for connections to keep it clean)
            if (!particles[i].isBurst) {
                for (let j = i; j < particles.length; j++) {
                    if (!particles[j].isBurst) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 100) {
                            ctx.beginPath();
                            // Softer line color matching particles
                            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - distance / 100) * 0.2})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

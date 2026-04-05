/**
 * $FACT Coin - Main JavaScript
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==========================================
    // Configuration
    // ==========================================
    const CONFIG = {
        PARTICLES: {
            MAX_COUNT: 100,
            LIFETIME: 100,
            SPAWN_RATE: 0.05
        },
        ANIMATION: {
            FPS: 60,
            COUNTER_DURATION: 2000
        },
        SECURITY: {
            KONAMI_CODE: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            MAX_PARTICLES_PER_CLICK: 50
        }
    };

    // ==========================================
    // State Management
    // ==========================================
    const state = {
        particles: [],
        konamiIndex: 0,
        isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isTouchDevice: window.matchMedia('(pointer: coarse)').matches,
        countersAnimated: new Set()
    };

    // ==========================================
    // DOM Elements
    // ==========================================
    const elements = {
        canvas: document.getElementById('confetti-canvas'),
        mobileToggle: document.querySelector('.mobile-menu-toggle'),
        navLinks: document.getElementById('nav-links'),
        statsBar: document.querySelector('.stats-bar')
    };

    // ==========================================
    // Canvas & Particle System
    // ==========================================
    const canvas = elements.canvas;
    const ctx = canvas.getContext('2d', { alpha: true });
    
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
    }

    class Particle {
        constructor() {
            this.reset(0, 0);
        }

        reset(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 6 + 2;
            this.speedX = (Math.random() - 0.5) * 6;
            this.speedY = Math.random() * -6 - 2;
            this.color = ['#ff006e', '#00f5ff', '#39ff14', '#ffff00', '#8338ec'][Math.floor(Math.random() * 5)];
            this.life = CONFIG.PARTICLES.LIFETIME;
            this.gravity = 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
            this.active = false;
        }

        update() {
            if (!this.active) return false;
            
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.rotation += this.rotationSpeed;
            this.life--;
            
            if (this.life <= 0 || this.y > window.innerHeight) {
                this.active = false;
                return false;
            }
            return true;
        }

        draw() {
            if (!this.active) return;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life / CONFIG.PARTICLES.LIFETIME;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    const particlePool = Array.from({ length: CONFIG.PARTICLES.MAX_COUNT }, () => new Particle());

    function spawnParticles(x, y, count) {
        const actualCount = Math.min(count, CONFIG.SECURITY.MAX_PARTICLES_PER_CLICK);
        let spawned = 0;
        
        for (let i = 0; i < particlePool.length && spawned < actualCount; i++) {
            if (!particlePool[i].active) {
                particlePool[i].reset(x, y);
                particlePool[i].active = true;
                spawned++;
            }
        }
    }

    let lastTime = 0;
    let frameCount = 0;
    
    function animate(currentTime) {
        if (currentTime - lastTime < 16) {
            requestAnimationFrame(animate);
            return;
        }
        
        lastTime = currentTime;
        frameCount++;
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        let activeCount = 0;
        particlePool.forEach(particle => {
            if (particle.update()) {
                particle.draw();
                activeCount++;
            }
        });
        
        if (!state.isTouchDevice && !state.isReducedMotion && frameCount % 3 === 0 && Math.random() < CONFIG.PARTICLES.SPAWN_RATE) {
            if (activeCount < CONFIG.PARTICLES.MAX_COUNT * 0.5) {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight + 10;
                spawnParticles(x, y, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }

    // ==========================================
    // Event Handlers
    // ==========================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 100);
    }, { passive: true });

    // Notification system
    function showNotification(message, duration = 3000) {
        const existing = document.querySelector('.fact-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'fact-notification';
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Button click handler (Buy/Chart buttons)
    function handleButtonClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        spawnParticles(x, y, 30);
        
        const action = e.currentTarget.dataset.action;
        const messages = {
            buy: '🚀 FACT: This is a demo! No real tokens exist yet.',
            chart: '📊 FACT: Charts require a token to exist first!'
        };
        showNotification(messages[action] || '🎉 Confetti deployed!');
    }

    // Social button click handler
    function handleSocialClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        spawnParticles(x, y, 40);
        
        const platform = e.currentTarget.dataset.platform;
        const messages = {
            Twitter: '🐦 This is a placeholder! No actual Twitter link exists.',
            Discord: '💬 This is a placeholder! No actual Discord server exists.',
            Telegram: '✈️ This is a placeholder! No actual Telegram group exists.',
            Reddit: '🤖 This is a placeholder! No actual subreddit exists.'
        };
        
        showNotification(messages[platform] || `🎉 ${platform} button clicked!`);
    }

    // Mobile menu
    function toggleMobileMenu() {
        const isExpanded = elements.mobileToggle.getAttribute('aria-expanded') === 'true';
        elements.mobileToggle.setAttribute('aria-expanded', !isExpanded);
        elements.navLinks.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    }

    function closeMobileMenu() {
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
        elements.navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ==========================================
    // Counter Animation
    // ==========================================
    function animateCounter(element) {
        const target = parseInt(element.dataset.target, 10);
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const duration = CONFIG.ANIMATION.COUNTER_DURATION;
        const startTime = performance.now();
        const startValue = 0;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * easeOut);
            
            let display = current.toLocaleString();
            if (target >= 1000000) {
                display = (current / 1000000).toFixed(2) + 'M';
            } else if (target >= 1000) {
                display = (current / 1000).toFixed(0) + 'K';
            }
            
            element.textContent = prefix + display + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ==========================================
    // Konami Code
    // ==========================================
    function handleKonami(e) {
        if (e.key === CONFIG.SECURITY.KONAMI_CODE[state.konamiIndex]) {
            state.konamiIndex++;
            if (state.konamiIndex === CONFIG.SECURITY.KONAMI_CODE.length) {
                activateRainbowMode();
                state.konamiIndex = 0;
            }
        } else {
            state.konamiIndex = 0;
        }
    }

    function activateRainbowMode() {
        document.body.classList.add('rainbow-mode');
        showNotification('🎮 KONAMI CODE ACTIVATED! Rainbow mode engaged.', 5000);
        
        setTimeout(() => {
            document.body.classList.remove('rainbow-mode');
        }, 10000);
    }

    // ==========================================
    // Initialization
    // ==========================================
    function init() {
        resizeCanvas();
        animate(0);
        
        // CTA buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', handleButtonClick);
        });
        
        // Social buttons (now trigger confetti instead of linking)
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', handleSocialClick);
        });
        
        // Mobile menu
        elements.mobileToggle?.addEventListener('click', toggleMobileMenu);
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Keyboard
        document.addEventListener('keydown', handleKonami);
        
        // Intersection Observer for counters
        if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !state.countersAnimated.has(entry.target)) {
                        state.countersAnimated.add(entry.target);
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
                counterObserver.observe(counter);
            });
        } else {
            document.querySelectorAll('.stat-number[data-target]').forEach(animateCounter);
        }
        
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Debug API (localhost only)
    if (location.hostname === 'localhost') {
        window.FACT = {
            spawnParticles,
            getState: () => ({ ...state, particleCount: particlePool.filter(p => p.active).length })
        };
    }
})();

/**
 * ============================================================================
 * CUSTOM 3D BCS COMPUTER SCIENCE PORTFOLIO JAVASCRIPT ENGINE
 * Separated JS File: app.js
 * Author: Rohit Sharma (BCS 2nd Year)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) window.lucide.createIcons();

    // 2. Initialize Core Subsystems
    init3DBackgroundCanvas();
    initHeroPhotoTilt();
    initAboutPhotoTilt();
    initImageUploaders();
    initCertificateLightbox();
    initResumeDownloader();
    initCustomMousePointer();
    initAudioSynthesizer();
    initContactForm();
    initTeamCarousel();
    initScrollNavigation();
});

/* ============================================================================
 * 1. THREE.JS 3D BACKGROUND CANVAS ENGINE
 * ============================================================================ */
let bgScene, bgCamera, bgRenderer;
let floating3DShapes = [];
let ambientStars;
let mouseOffset = { x: 0, y: 0 };

function init3DBackgroundCanvas() {
    const canvas = document.getElementById('three-bg-canvas');
    if (!canvas || !window.THREE) return;

    // 1. Scene & Camera
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgCamera.position.z = 28;

    // 2. WebGL Renderer
    bgRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    bgScene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 2.5, 45);
    cyanLight.position.set(12, 10, 10);
    bgScene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 45);
    purpleLight.position.set(-12, -10, 10);
    bgScene.add(purpleLight);

    // 4. Floating 3D Geometric Meshes
    const geometries = [
        new THREE.IcosahedronGeometry(2.0, 0),
        new THREE.OctahedronGeometry(1.6, 0),
        new THREE.TetrahedronGeometry(1.8, 0),
        new THREE.TorusGeometry(2.2, 0.35, 12, 32)
    ];

    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.25 }),
        new THREE.MeshStandardMaterial({ color: 0x00ff9d, wireframe: true, transparent: true, opacity: 0.22 }),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.25 }),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.2 })
    ];

    const positions = [
        { x: -16, y: 8, z: -5 },
        { x: 16, y: -6, z: -8 },
        { x: -12, y: -10, z: -6 },
        { x: 14, y: 10, z: -10 }
    ];

    for (let i = 0; i < 4; i++) {
        const mesh = new THREE.Mesh(geometries[i], materials[i]);
        mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
        mesh.userData = {
            rotX: 0.004 + Math.random() * 0.004,
            rotY: 0.005 + Math.random() * 0.005,
            initY: positions[i].y
        };
        bgScene.add(mesh);
        floating3DShapes.push(mesh);
    }

    // 5. 650 Ambient Star Dust Particles
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 75;
        starPos[i + 1] = (Math.random() - 0.5) * 75;
        starPos[i + 2] = (Math.random() - 0.5) * 45;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.12,
        transparent: true,
        opacity: 0.45
    });
    ambientStars = new THREE.Points(starGeo, starMat);
    bgScene.add(ambientStars);

    // Window Listeners
    window.addEventListener('resize', () => {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
        mouseOffset.x = (e.clientX - window.innerWidth / 2) * 0.001;
        mouseOffset.y = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    animate3DScene();
}

let clock = new THREE.Clock();
function animate3DScene() {
    requestAnimationFrame(animate3DScene);
    const elapsed = clock.getElapsedTime();

    // Rotate Polyhedrons
    floating3DShapes.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotX;
        mesh.rotation.y += mesh.userData.rotY;
        mesh.position.y = mesh.userData.initY + Math.sin(elapsed + mesh.position.x) * 1.2;
    });

    // Starfield Parallax
    if (ambientStars) {
        ambientStars.rotation.y = elapsed * 0.015 + mouseOffset.x;
        ambientStars.rotation.x = mouseOffset.y;
    }

    bgRenderer.render(bgScene, bgCamera);
}


/* ============================================================================
 * 2. 3D HERO PHOTO TILT & SATELLITE BADGES PARALLAX
 * ============================================================================ */
function initHeroPhotoTilt() {
    const stage = document.getElementById('hero-photo-stage');
    const card = document.getElementById('hero-photo-card');
    if (!stage || !card) return;

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / rect.width - 0.5;
        const yPct = mouseY / rect.height - 0.5;

        const rotX = yPct * -22; // Inverted for natural depth
        const rotY = xPct * 22;

        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;

        // Parallax Satellite Badges
        const satBadges = card.querySelectorAll('.sat-badge');
        satBadges.forEach(badge => {
            const transX = xPct * 25;
            const transY = yPct * 25;
            badge.style.transform = `translate3d(${transX}px, ${transY}px, 50px)`;
        });
    });

    stage.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        const satBadges = card.querySelectorAll('.sat-badge');
        satBadges.forEach(badge => {
            badge.style.transform = 'translate3d(0, 0, 50px)';
        });
    });
}


/* ============================================================================
 * 3. 3D ABOUT ME PHOTO TILT
 * ============================================================================ */
function initAboutPhotoTilt() {
    const aboutCard = document.getElementById('about-3d-card');
    if (!aboutCard) return;

    aboutCard.addEventListener('mousemove', (e) => {
        const rect = aboutCard.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotX = (y / (rect.height / 2)) * -12;
        const rotY = (x / (rect.width / 2)) * 12;

        aboutCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    aboutCard.addEventListener('mouseleave', () => {
        aboutCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
}


/* ============================================================================
 * 4. INSTANT IMAGE UPLOAD / LIVE PREVIEW ENGINE
 * ============================================================================ */
function initImageUploaders() {
    // Hero Photo Uploader
    const heroInput = document.getElementById('upload-hero-input');
    const heroImg = document.getElementById('hero-img-element');

    if (heroInput && heroImg) {
        heroInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    heroImg.src = event.target.result;
                    playTone(880, 0.1);
                    alert('Front Page 3D Photo Updated Successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // About Photo Uploader
    const aboutInput = document.getElementById('upload-about-input');
    const aboutImg = document.getElementById('about-img-element');

    if (aboutInput && aboutImg) {
        aboutInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    aboutImg.src = event.target.result;
                    playTone(880, 0.1);
                    alert('About Me 3D Photo Updated Successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Teammates Photo Uploaders
    const teamInputs = document.querySelectorAll('[id^="upload-team-"]');
    teamInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const targetId = input.getAttribute('data-target-img');
            const targetImg = document.getElementById(targetId);
            const file = e.target.files[0];
            if (file && targetImg) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    targetImg.src = event.target.result;
                    playTone(880, 0.1);
                    alert('Teammate Photo Updated Successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    });
}


/* ============================================================================
 * 5. CERTIFICATE 3D LIGHTBOX MODAL
 * ============================================================================ */
function initCertificateLightbox() {
    const modal = document.getElementById('cert-lightbox-modal');
    const closeBtn = document.getElementById('close-lightbox-btn');
    const titleEl = document.getElementById('lightbox-title');
    const issuerEl = document.getElementById('lightbox-issuer');
    const imgEl = document.getElementById('lightbox-img');
    const triggers = document.querySelectorAll('.cert-preview-trigger');

    if (!modal) return;

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const title = trigger.getAttribute('data-cert-title');
            const issuer = trigger.getAttribute('data-cert-issuer');
            const imgSrc = trigger.getAttribute('data-cert-img');
            const fallback = trigger.getAttribute('data-cert-fallback');

            titleEl.innerText = title;
            issuerEl.innerHTML = issuer;
            
            // Set image with fallback
            imgEl.src = imgSrc;
            imgEl.onerror = () => { imgEl.src = fallback; };

            modal.classList.add('active');
            playTone(650, 0.08);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}


/* ============================================================================
 * 6. REAL RESUME GENERATOR & DOWNLOADER
 * ============================================================================ */
function initResumeDownloader() {
    const resumeText = `===============================================================
ROHIT SHARMA | BCS SECOND YEAR (SY) DEVELOPER RESUME
Email: rohit.bcs.dev@gmail.com | Location: Pune, MH, India
GitHub: github.com/rohit | LinkedIn: linkedin.com/in/rohit-bcs
===============================================================

[ACADEMIC PROFILE]
Degree: Bachelor of Computer Science (BCS)
University: Savitribai Phule Pune University
Year: Second Year (SY) - Expected Graduation: 2027
Cumulative CGPA: 8.92 / 10.0

[TECHNICAL SKILLS]
• Programming Languages: C++, Java (Core & OOP), Python 3, C, SQL, JavaScript (ES6+)
• Web & 3D Technologies: Three.js, WebGL, React.js, Node.js, Express, HTML5/CSS3
• Databases: PostgreSQL, MySQL, MongoDB
• Core CS Fundamentals: Data Structures & Algorithms, OS, DBMS, Computer Networks
• Developer Tools: Git, GitHub, Linux/Bash, Postman, Docker (Basics)

[DSA & PROBLEM SOLVING]
• 320+ LeetCode problems solved (140 Easy, 150 Medium, 30 Hard)
• NPTEL Elite + Gold Certification in Data Structures & Algorithms

[FEATURED PROJECTS]
1. AlgoSphere 3D Graph Visualizer (Three.js, C++ DSA, WebGL)
   - Real-time 3D pathfinding simulator for Dijkstra, A*, and AVL self-balancing trees.

2. DevSync Collaborative Cloud IDE (React, Node.js, Socket.io)
   - Multi-user code editor with real-time cursor sync and code execution sandbox.

3. KernelOS CPU & Memory Scheduler (Java 17, JavaFX)
   - Operating System simulator for Round Robin, SJF, and Banker's Deadlock algorithm.

4. SmartCampus ERP Portal (PostgreSQL, Express, React)
   - College management system with role-based JWT auth and automatic marksheet generation.

[HONORS & ACHIEVEMENTS]
• 1st Runner Up - Smart City Hackathon 2025 (120+ Teams)
• LeetCode 100 Days Badge (2025)
===============================================================`;

    function triggerDownload() {
        const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Rohit_Sharma_BCS_Resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        playTone(950, 0.12);
        alert('Resume Downloaded Successfully!');
    }

    document.getElementById('top-resume-btn')?.addEventListener('click', triggerDownload);
    document.getElementById('hero-download-cv')?.addEventListener('click', triggerDownload);
    document.getElementById('about-download-resume-btn')?.addEventListener('click', triggerDownload);
}


/* ============================================================================
 * 7. CUSTOM MOUSE POINTER
 * ============================================================================ */
function initCustomMousePointer() {
    const dot = document.getElementById('mouse-dot');
    const ring = document.getElementById('mouse-ring');
    if (!dot || !ring) return;

    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let ringX = targetX, ringY = targetY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.style.left = `${targetX}px`;
        dot.style.top = `${targetY}px`;
    });

    function renderRing() {
        ringX += (targetX - ringX) * 0.18;
        ringY += (targetY - ringY) * 0.18;

        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        requestAnimationFrame(renderRing);
    }
    renderRing();

    const hoverables = document.querySelectorAll('a, button, input, textarea, .glass-box, .cert-item-card');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.transform = 'translate(-50%, -50%) scale(1.6)';
            ring.style.borderColor = '#00ff9d';
            ring.style.backgroundColor = 'rgba(0, 255, 157, 0.08)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.transform = 'translate(-50%, -50%) scale(1.0)';
            ring.style.borderColor = '#00f0ff';
            ring.style.backgroundColor = 'transparent';
        });
    });
}


/* ============================================================================
 * 8. WEB AUDIO SYNTHESIZER
 * ============================================================================ */
let audioCtx = null;
let soundEnabled = true;

function playTone(freq = 520, duration = 0.08, type = 'sine') {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function initAudioSynthesizer() {
    const btn = document.getElementById('audio-toggle-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = document.getElementById('audio-icon');
        if (soundEnabled) {
            btn.style.color = '#00f0ff';
            playTone(880, 0.1);
            if (icon) icon.setAttribute('data-lucide', 'volume-2');
        } else {
            btn.style.color = '#64748b';
            if (icon) icon.setAttribute('data-lucide', 'volume-x');
        }
        if (window.lucide) window.lucide.createIcons();
    });
}


/* ============================================================================
 * 9. CONTACT FORM & EMAIL CLIPBOARD
 * ============================================================================ */
function initContactForm() {
    const copyBtn = document.getElementById('copy-email-btn');
    const form = document.getElementById('contact-form');
    const statusBox = document.getElementById('form-status-alert');

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('rohit.bcs.dev@gmail.com').then(() => {
                playTone(920, 0.08);
                const prev = copyBtn.innerHTML;
                copyBtn.innerHTML = `Copied to Clipboard! <i data-lucide="check"></i>`;
                if (window.lucide) window.lucide.createIcons();
                setTimeout(() => {
                    copyBtn.innerHTML = prev;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
            });
        });
    }

    if (form && statusBox) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('send-form-btn');
            btn.disabled = true;
            btn.innerHTML = `<span>Sending...</span>`;
            playTone(520, 0.1);

            setTimeout(() => {
                statusBox.style.color = '#00ff9d';
                statusBox.innerHTML = `Transmission received! I will reply to you within 24 hours.`;
                form.reset();
                btn.disabled = false;
                btn.innerHTML = `<span>Send Message</span> <i data-lucide="send"></i>`;
                if (window.lucide) window.lucide.createIcons();
                playTone(1050, 0.15, 'triangle');
            }, 1200);
        });
    }
}


/* ============================================================================
 * 10. SCROLL SPY & MOBILE MENU
 * ============================================================================ */
function initScrollNavigation() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 140;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}


/* ============================================================================
 * 11. TEAM MATES INTERACTIVE SLIDER CAROUSEL ENGINE (WITH AUTO-SLIDE)
 * ============================================================================ */
function initTeamCarousel() {
    const track = document.getElementById('team-carousel-track');
    const viewport = document.getElementById('team-carousel-viewport');
    const wrapper = document.querySelector('.team-slider-wrapper');
    const prevBtn = document.getElementById('team-prev-btn');
    const nextBtn = document.getElementById('team-next-btn');
    const dots = document.querySelectorAll('.slider-dot');
    const slides = document.querySelectorAll('.team-slide');

    if (!track || slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval = null;

    function getVisibleSlides() {
        if (window.innerWidth <= 680) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getMaxIndex() {
        return Math.max(0, totalSlides - getVisibleSlides());
    }

    function updateCarousel() {
        const visible = getVisibleSlides();
        const maxIndex = getMaxIndex();

        if (currentSlide > maxIndex) currentSlide = maxIndex;
        if (currentSlide < 0) currentSlide = 0;

        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 24; // gap between slides
        const moveAmount = currentSlide * (slideWidth + gap);

        track.style.transform = `translateX(-${moveAmount}px)`;

        // Update Dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });

        // Update Arrows state
        if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
        if (nextBtn) nextBtn.style.opacity = currentSlide >= maxIndex ? '0.4' : '1';
    }

    function nextSlide() {
        const maxIndex = getMaxIndex();
        if (currentSlide < maxIndex) {
            currentSlide++;
        } else {
            currentSlide = 0; // Loop seamlessly back to start
        }
        updateCarousel();
    }

    function prevSlide() {
        const maxIndex = getMaxIndex();
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = maxIndex; // Loop to end
        }
        updateCarousel();
    }

    // Auto-Slide Engine (Auto transitions every 2.8 seconds)
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 2800);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            playTone(600, 0.05);
            startAutoSlide(); // Reset auto timer
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            playTone(600, 0.05);
            startAutoSlide(); // Reset auto timer
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = Math.min(index, getMaxIndex());
            playTone(550, 0.05);
            updateCarousel();
            startAutoSlide();
        });
    });

    // Pause on Mouse Hover, Resume on Leave
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoSlide);
        wrapper.addEventListener('mouseleave', startAutoSlide);
    }

    window.addEventListener('resize', updateCarousel);

    // Touch / Swipe Support for Mobile
    let startX = 0;
    let endX = 0;

    track.addEventListener('touchstart', (e) => {
        stopAutoSlide();
        startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 40) {
            if (diff > 0 && currentSlide < getMaxIndex()) {
                currentSlide++;
                playTone(600, 0.05);
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
                playTone(600, 0.05);
            }
            updateCarousel();
        }
        startAutoSlide();
    }, { passive: true });

    // Initialize Layout & Start Auto-Slide
    updateCarousel();
    startAutoSlide();
}


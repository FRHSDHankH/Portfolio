/* ============================================================
   Hank Habashy — App logic
   - Vue 3 app fetches projects.json + ai-usage.json
   - GSAP ScrollTrigger powers reveal + parallax animations
   - Custom cursor + magnetic links + 3D tilt on cards
   - Everything is namespaced and respects reduced-motion
   ============================================================ */

(() => {
  const { createApp, ref, computed, onMounted, nextTick } = Vue;

  // -----------------------------------------
  // Vue app
  // -----------------------------------------
  const app = createApp({
    setup() {
      const years = ref([]);                 // raw year groups from projects.json
      const images = ref({ portrait: null, camaro: [] });
      const activeYear = ref('Senior');      // which year tab is open
      const loading = ref(true);
      const navOpen = ref(false);

      // featuredProjects: flat list of every project flagged featured: true
      const featuredProjects = computed(() =>
        years.value.flatMap(y => y.projects.filter(p => p.featured))
      );

      // currentYear: full object for the selected tab
      const currentYear = computed(() =>
        years.value.find(y => y.year === activeYear.value)
      );

      // stats for the hero meta block
      const stats = computed(() => ({
        totalProjects: years.value.reduce((sum, y) => sum + y.projects.length, 0),
      }));

      // Doubled photo list so the marquee loops seamlessly
      const galleryLoop = computed(() => {
        const list = images.value.camaro || [];
        return list.concat(list);
      });

      // Build a thum.io screenshot URL for any project URL.
      // thum.io is a free public service that returns a live screenshot of any page.
      // Pass a `wait` (seconds) when the page has an intro animation that needs to settle.
      function shotUrl(url, width = 800, wait = 0) {
        if (!url) return '';
        const w = wait > 0 ? `wait/${Math.min(wait, 30)}/` : '';
        return `https://image.thum.io/get/width/${width}/${w}noanimate/${url}`;
      }

      // Visible debugging hooks for the screenshot images.
      function onShotError(e) {
        const img = e.target;
        console.warn('[habashy] screenshot failed:', img.src);
        img.parentElement?.classList.add('shot-failed');
      }
      function onShotLoad(e) {
        e.target.parentElement?.classList.add('shot-loaded');
      }

      // Load projects JSON
      onMounted(async () => {
        try {
          const [projectsRes, imagesRes] = await Promise.all([
            fetch('data/projects.json'),
            fetch('data/images.json'),
          ]);
          if (!projectsRes.ok) throw new Error('Failed to load projects.json');
          const projectsData = await projectsRes.json();
          years.value = projectsData.years;
          if (imagesRes.ok) images.value = await imagesRes.json();
        } catch (err) {
          console.error('[habashy] data load failed:', err);
        } finally {
          loading.value = false;
          // Wait for DOM to render new project cards before wiring up
          // animations / interactions that depend on them.
          await nextTick();
          initAnimations();
          initInteractions();
        }
      });

      return { years, images, activeYear, loading, navOpen, featuredProjects, currentYear, stats, galleryLoop, shotUrl, onShotError, onShotLoad };
    },
  });

  app.mount('#app');

  // Kick the preloader and particle canvas immediately — they don't depend on Vue data.
  document.body.classList.add('is-loading');
  initPreloader();
  initParticles();
  initRotator();

  // -----------------------------------------
  // Animations (GSAP + ScrollTrigger)
  // -----------------------------------------
  function initAnimations() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // Just unhide everything if user prefers reduced motion.
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('is-visible'));
      return;
    }

    if (!window.gsap) {
      // GSAP failed to load (offline?) — still reveal content via fallback observer.
      fallbackReveal();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.hero .reveal').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.6 + i * 0.08,
          onComplete: () => el.classList.add('is-visible') }
      );
    });

    // Section reveals — anything outside the hero
    gsap.utils.toArray('.section .reveal').forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onComplete: () => el.classList.add('is-visible'),
        }
      );
    });

    // Subtle parallax on the floating background blobs
    gsap.utils.toArray('.blob').forEach((b, i) => {
      gsap.to(b, {
        yPercent: (i + 1) * -8,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    // Scroll progress bar
    const bar = document.getElementById('scroll-progress');
    if (bar) {
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => { bar.style.width = (self.progress * 100) + '%'; },
      });
    }

    // Pinned horizontal scroll for featured (desktop only)
    initHorizontalScroll();

    // Scroll-scrubbed reflection words
    initScrubReflection();

    // Mega footer headline reveal
    initFooterMega();
  }

  // Pure-IntersectionObserver fallback if GSAP can't load
  function fallbackReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-stagger');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  }

  // -----------------------------------------
  // Interactions: cursor, magnetic, tilt
  // -----------------------------------------
  function initInteractions() {
    const isTouch = window.matchMedia('(hover: none), (max-width: 768px)').matches;
    if (isTouch) return; // skip pointer-effects on touch devices

    // --- Custom cursor (rAF-throttled for smoothness) ---
    const cursor = document.getElementById('cursor');
    const dot    = document.getElementById('cursor-dot');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;

    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const animateCursor = () => {
      // Lerp the outer ring toward the cursor for a slight drag effect
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      dot.style.transform    = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Grow ring when over interactive elements
    document.querySelectorAll('a, button, [data-magnetic], [data-magnetic-strong]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // --- Cursor spotlight on magnetic targets (no movement — just a follow-glow) ---
    document.querySelectorAll('[data-magnetic], [data-magnetic-strong]').forEach(el => attachSpotlight(el));

    // --- 3D tilt on featured cards ---
    document.querySelectorAll('.tilt').forEach(el => attachTilt(el));
  }

  function attachSpotlight(el) {
    el.classList.add('has-spotlight');
    let raf = null;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
        raf = null;
      });
    };
    el.addEventListener('mousemove', onMove);
  }

  function attachTilt(el) {
    let raf = null;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0..1
      const py = (e.clientY - r.top)  / r.height;  // 0..1
      const rx = (py - 0.5) * -5; // softer tilt degrees
      const ry = (px - 0.5) *  5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        raf = null;
      });
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  }

  // -----------------------------------------
  // Preloader: fake-but-fun progress, then curtain
  // -----------------------------------------
  function initPreloader() {
    const root    = document.getElementById('preloader');
    const count   = document.getElementById('preloader-count');
    const fill    = document.getElementById('preloader-fill');
    const curtain = document.getElementById('preloader-curtain');
    if (!root) return;

    let n = 0;
    const tick = () => {
      // Random easing toward 100 — feels organic
      const step = Math.max(1, Math.round((100 - n) * 0.08 + Math.random() * 4));
      n = Math.min(100, n + step);
      if (count) count.textContent = n;
      if (fill)  fill.style.width = n + '%';
      if (n < 100) {
        setTimeout(tick, 70 + Math.random() * 120);
      } else {
        // Hold a beat, then sweep curtain UP and reveal site
        setTimeout(() => {
          root.classList.add('is-done');
          if (window.gsap && curtain) {
            gsap.fromTo(curtain,
              { yPercent: 100 },
              { yPercent: -100, duration: 1.0, ease: 'power4.inOut',
                onComplete: () => { root.remove(); document.body.classList.remove('is-loading'); }
              });
          } else {
            root.remove(); document.body.classList.remove('is-loading');
          }
        }, 280);
      }
    };
    setTimeout(tick, 200);
  }

  // -----------------------------------------
  // Particle canvas: dots that connect lines + react to cursor
  // -----------------------------------------
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    // Skip the heavy canvas entirely on phones/tablets — the blobs + grain are enough.
    if (window.matchMedia('(hover: none), (max-width: 900px)').matches) return;

    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    let frameNo = 0;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Lower density — line-drawing is O(n²) so 50 is plenty.
      const target = Math.min(50, Math.floor((w * h) / 38000));
      particles = new Array(target).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.4,
      }));
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });
    resize();

    function frame() {
      frameNo++;
      ctx.clearRect(0, 0, w, h);

      // Draw + move particles
      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) { // within ~120px
          const f = (1 - d2 / 14400) * 0.6;
          p.vx += (dx / Math.sqrt(d2 || 1)) * f * 0.4;
          p.vy += (dy / Math.sqrt(d2 || 1)) * f * 0.4;
        }
        p.x += p.vx; p.y += p.vy;
        // Gentle damping
        p.vx *= 0.96; p.vy *= 0.96;
        // Wrap
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(245,239,228,0.55)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connecting lines for nearby pairs (every other frame to halve cost)
      if (frameNo % 2 === 0) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 12000) {
              const o = 1 - d2 / 12000;
              ctx.strokeStyle = `rgba(255,91,73,${o * 0.25})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // -----------------------------------------
  // Hero rotator: cycles identity words
  // -----------------------------------------
  function initRotator() {
    const root = document.getElementById('rotator');
    if (!root) return;
    const items = Array.from(root.children);
    if (items.length < 2) return;
    let i = 0;
    setInterval(() => {
      const cur = items[i];
      i = (i + 1) % items.length;
      const next = items[i];
      cur.classList.remove('is-active');
      cur.classList.add('is-out');
      next.classList.remove('is-out');
      next.classList.add('is-active');
      // Reset 'is-out' on the previous one after the transition completes
      setTimeout(() => cur.classList.remove('is-out'), 700);
    }, 2200);
  }

  // -----------------------------------------
  // Pinned horizontal scroll for featured (desktop only)
  // -----------------------------------------
  function initHorizontalScroll() {
    const wrap  = document.getElementById('hScrollWrap');
    const track = document.getElementById('hScrollTrack');
    if (!wrap || !track) return;
    if (window.innerWidth <= 900) return;        // mobile/tablet: vertical fallback (CSS)
    const panels = track.querySelectorAll('.h-panel');
    if (panels.length < 2) return;

    // How far to scroll horizontally: the track width minus the viewport width
    const getDistance = () => Math.max(0, track.scrollWidth - wrap.clientWidth + 80);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 10%',
        end:   () => '+=' + getDistance(),
        scrub: 1,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }

  // -----------------------------------------
  // Reflection: highlight words as you scroll through
  // -----------------------------------------
  function initScrubReflection() {
    const root = document.querySelector('.scrub-read[data-scrub]');
    if (!root) return;
    // Wrap each visible word in a span so we can color it as scroll progresses.
    root.querySelectorAll('p').forEach(p => {
      const words = p.textContent.trim().split(/\s+/);
      p.innerHTML = words.map(w => `<span class="word">${escapeHtml(w)}</span>`).join(' ');
    });
    const words = root.querySelectorAll('.word');
    ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: true,
      onUpdate: self => {
        const cutoff = Math.floor(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < cutoff));
      },
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // -----------------------------------------
  // Footer mega headline: rise into view on scroll
  // -----------------------------------------
  function initFooterMega() {
    const lines = document.querySelectorAll('.footer-mega-line span');
    if (!lines.length) return;
    gsap.to(lines, {
      yPercent: 0,
      ease: 'power4.out',
      duration: 1.1,
      stagger: 0.12,
      scrollTrigger: { trigger: '.footer-mega', start: 'top 80%', once: true },
    });
  }
})();

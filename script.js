const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: 0,
      pages: ['Home', 'Featured', 'Senior', 'Junior', 'Sophomore', 'About'],
      projects: {},
      lastScrollTime: 0,
      scrollCooldown: 800,
      isScrolling: false,
      touchStartY: 0
    };
  },
  computed: {
    featuredProjects() {
      return this.projects.featured || [];
    }
  },
  methods: {
    handleWheel(e) {
      e.preventDefault();
      
      const now = Date.now();
      if (now - this.lastScrollTime < this.scrollCooldown || this.isScrolling) {
        return;
      }

      this.lastScrollTime = now;

      if (e.deltaY > 0) {
        // Scroll down
        if (this.currentPage < this.pages.length - 1) {
          this.currentPage++;
          this.animatePage();
        }
      } else {
        // Scroll up
        if (this.currentPage > 0) {
          this.currentPage--;
          this.animatePage();
        }
      }
    },

    handleKeyDown(e) {
      const now = Date.now();
      if (now - this.lastScrollTime < this.scrollCooldown) {
        return;
      }

      switch(e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.lastScrollTime = Date.now();
            this.animatePage();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (this.currentPage > 0) {
            this.currentPage--;
            this.lastScrollTime = Date.now();
            this.animatePage();
          }
          break;
      }
    },

    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
    },

    handleTouchEnd(e) {
      const now = Date.now();
      if (now - this.lastScrollTime < this.scrollCooldown) {
        return;
      }

      const touchEndY = e.changedTouches[0].clientY;
      const diff = this.touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swiped up (scroll down)
          if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.lastScrollTime = Date.now();
            this.animatePage();
          }
        } else {
          // Swiped down (scroll up)
          if (this.currentPage > 0) {
            this.currentPage--;
            this.lastScrollTime = Date.now();
            this.animatePage();
          }
        }
      }
    },

    animatePage() {
      this.isScrolling = true;
      setTimeout(() => {
        this.isScrolling = false;
      }, 800);

      // GSAP animations for page content
      const currentSection = document.querySelectorAll('.page')[this.currentPage];
      if (currentSection) {
        const cards = currentSection.querySelectorAll('.featured-card, .project-card');
        const content = currentSection.querySelectorAll('.page-title, .error-container, .about-content, .hero-text');
        
        // Animate main content
        gsap.fromTo(
          content,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.1 }
        );

        // Stagger cards
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, rotateY: -10 },
          { 
            opacity: 1, 
            y: 0, 
            rotateY: 0,
            duration: 0.5, 
            stagger: 0.08, 
            delay: 0.2,
            ease: 'power2.out'
          }
        );
      }
    },

    setupCardHoverEffects() {
      const cards = document.querySelectorAll('.featured-card, .project-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { 
            scale: 1.02, 
            duration: 0.3, 
            overwrite: 'auto' 
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { 
            scale: 1, 
            duration: 0.3, 
            overwrite: 'auto' 
          });
        });
      });
    },

    async loadProjects() {
      try {
        const response = await fetch('projects.json');
        this.projects = await response.json();
        
        // Setup card effects after projects load
        this.$nextTick(() => {
          this.setupCardHoverEffects();
        });
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  },

  watch: {
    currentPage() {
      this.$nextTick(() => {
        this.setupCardHoverEffects();
      });
    }
  },

  mounted() {
    this.loadProjects();

    // Scroll and keyboard listeners
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);

    // Initial animation
    this.$nextTick(() => {
      this.animatePage();
    });
  },

  beforeUnmount() {
    window.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
  }
}).mount('#app');

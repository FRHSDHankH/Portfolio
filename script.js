const { createApp } = Vue;

createApp({
  data() {
    return {
      currentPage: 0,
      pages: ['Home', 'Featured', 'Senior', 'Junior', 'Sophomore', 'About'],
      projects: {},
      projectsLoaded: false,
      seniorFilter: null,
      juniorFilter: null,
      lastScrollTime: 0,
      scrollCooldown: 800,
      isScrolling: false,
      touchStartY: 0
    };
  },
  computed: {
    featuredProjects() {
      return this.projects.featured || [];
    },
    filteredSenior() {
      if (!this.seniorFilter) return this.projects.senior || [];
      return (this.projects.senior || []).filter(p => p.difficulty === this.seniorFilter);
    },
    filteredJunior() {
      if (!this.juniorFilter) return this.projects.junior || [];
      return (this.projects.junior || []).filter(p => p.difficulty === this.juniorFilter);
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
        case 'End':
          e.preventDefault();
          this.currentPage = this.pages.length - 1;
          this.lastScrollTime = Date.now();
          this.animatePage();
          break;
        case 'Home':
          e.preventDefault();
          this.currentPage = 0;
          this.lastScrollTime = Date.now();
          this.animatePage();
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
        // Fade out previous content
        gsap.to('.page:not(:nth-child(' + (this.currentPage + 1) + '))', {
          opacity: 0,
          duration: 0.3,
          pointerEvents: 'none'
        });

        const cards = currentSection.querySelectorAll('.featured-card, .project-card');
        const content = currentSection.querySelectorAll('.page-title, .error-container, .about-content, .hero-text');
        
        // Animate main content with stagger
        gsap.fromTo(
          content,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
        );

        // Stagger cards with rotation
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, rotateY: -10, rotateX: 5 },
          { 
            opacity: 1, 
            y: 0, 
            rotateY: 0,
            rotateX: 0,
            duration: 0.5, 
            stagger: 0.08, 
            delay: 0.2,
            ease: 'power2.out'
          }
        );

        // Add a subtle parallax effect to page backgrounds
        gsap.fromTo(
          currentSection,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, delay: 0 }
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
        this.projectsLoaded = true;
        
        // Setup card effects after projects load
        this.$nextTick(() => {
          this.setupCardHoverEffects();
        });
      } catch (error) {
        console.error('Error loading projects:', error);
        this.projectsLoaded = true; // Show portfolio even if load fails
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

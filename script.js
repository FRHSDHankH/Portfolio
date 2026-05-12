console.log('script.js loaded');

const { createApp } = Vue;

console.log('Vue createApp:', typeof createApp);
  data() {
    return {
      currentPage: 0,
      pages: ['Home', 'Featured', 'Senior', 'Junior', 'Sophomore', 'About'],
      projects: {
        featured: [],
        senior: [],
        junior: [],
        sophomore: null
      },
      projectsLoaded: false,
      seniorFilter: null,
      juniorFilter: null,
      lastScrollTime: 0,
      scrollCooldown: 1200, // Increased for longer flying animations
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
    },
    pageClasses() {
      return this.pages.map((page, index) => ({
        active: index === this.currentPage
      }));
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
      }, 1200); // Match scroll cooldown

      // Remove active class from all pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });

      // Add active class to current page
      const currentSection = document.querySelectorAll('.page')[this.currentPage];
      if (currentSection) {
        currentSection.classList.add('active');
        
        // Create flying entrance animation based on page type
        this.animatePageEntrance(currentSection, this.pages[this.currentPage]);
      }
    },

    animatePageEntrance(pageElement, pageName) {
      console.log('Animating page:', pageName);
      const cards = pageElement.querySelectorAll('.featured-card, .project-card');
      const content = pageElement.querySelectorAll('.page-title, .error-container, .about-content, .hero-text');

      // Simple animation for testing
      gsap.fromTo(content, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 }
      );

      gsap.fromTo(cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.2 }
      );
    }

// animateHomePage(content, cards) {
    //   // Hero text flies in from top with rotation
    //   gsap.fromTo(content, 
    //     { y: -100, rotation: -15, opacity: 0, scale: 0.8 },
    //     { y: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
    //   );
    // },

    // animateFeaturedPage(content, cards) {
    //   // Title flies in from left
    //   gsap.fromTo(content,
    //     { x: -200, opacity: 0, rotationY: -90 },
    //     { x: 0, opacity: 1, rotationY: 0, duration: 0.6, ease: 'power3.out' }
    //   );
      
    //   // Cards fly in from different directions with stagger
    //   cards.forEach((card, index) => {
    //     const directions = [
    //       { x: -300, y: -100, rotation: -45 },
    //       { x: 300, y: -100, rotation: 45 },
    //       { x: -300, y: 100, rotation: -45 }
    //     ];
    //     const dir = directions[index % directions.length];
        
    //     gsap.fromTo(card,
    //       { x: dir.x, y: dir.y, rotation: dir.rotation, opacity: 0, scale: 0.5 },
    //       { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.2 + index * 0.1, ease: 'back.out(1.5)' }
    //     );
    //   });
    // },

    // animateSeniorPage(content, cards) {
    //   // Title bounces in from bottom
    //   gsap.fromTo(content, 
    //     { y: 150, opacity: 0, scaleY: 0.3 },
    //     { y: 0, opacity: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' }
    //   );
      
    //   // Cards spiral in
    //   cards.forEach((card, index) => {
    //     gsap.fromTo(card,
    //       { 
    //         x: Math.cos(index * 0.5) * 400, 
    //         y: Math.sin(index * 0.5) * 400, 
    //         rotation: index * 45, 
    //         opacity: 0,
    //         scale: 0.3
    //       },
    //       { 
    //         x: 0, 
    //         y: 0, 
    //         rotation: 0, 
    //         opacity: 1, 
    //         scale: 1, 
    //         duration: 0.8, 
    //         delay: 0.3 + index * 0.05, 
    //         ease: 'power4.out' 
    //       }
    //     );
    //   });
    // },

    // animateJuniorPage(content, cards) {
    //   // Title zooms in with 3D effect
    //   gsap.fromTo(content, 
    //     { scale: 3, rotationX: -180, opacity: 0, z: -500 },
    //     { scale: 1, rotationX: 0, opacity: 1, z: 0, duration: 0.8, ease: 'power3.out' }
    //   );
      
    //   // Cards fly in from corners
    //   const corners = [
    //     { x: -400, y: -300 },
    //     { x: 400, y: -300 },
    //     { x: -400, y: 300 },
    //     { x: 400, y: 300 }
    //   ];
      
    //   cards.forEach((card, index) => {
    //     const corner = corners[index % corners.length];
    //     gsap.fromTo(card,
    //       { x: corner.x, y: corner.y, rotation: 180, opacity: 0, scale: 0.2 },
    //       { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.4 + index * 0.08, ease: 'back.out(1.2)' }
    //     );
    //   });
    // },

    // animateSophomorePage(content) {
    //   // 404 error flies in with glitch effect
    //   gsap.fromTo(content, 
    //     { 
    //       x: () => Math.random() * 100 - 50, 
    //       y: () => Math.random() * 100 - 50,
    //       rotation: () => Math.random() * 20 - 10,
    //       opacity: 0,
    //       scale: 0.5
    //     },
    //     { 
    //       x: 0, 
    //       y: 0, 
    //       rotation: 0, 
    //       opacity: 1, 
    //       scale: 1, 
    //       duration: 0.5, 
    //       ease: 'power2.out',
    //       onComplete: () => {
    //         // Add subtle glitch animation
    //         gsap.to(content, {
    //           x: () => Math.random() * 4 - 2,
    //           y: () => Math.random() * 4 - 2,
    //           duration: 0.1,
    //           repeat: 5,
    //           yoyo: true,
    //           ease: 'power2.inOut',
    //           delay: 1
    //         });
    //       }
    //     }
    //   );
    // },

    // animateAboutPage(content) {
    //   // Content flies in from all sides
    //   const elements = Array.from(content);
    //   elements.forEach((element, index) => {
    //     const angle = (index / elements.length) * Math.PI * 2;
    //     const distance = 300;
    //     gsap.fromTo(element,
    //       { 
    //         x: Math.cos(angle) * distance, 
    //         y: Math.sin(angle) * distance,
    //         rotation: angle * 180 / Math.PI,
    //         opacity: 0,
    //         scale: 0.3
    //       },
    //       { 
    //         x: 0, 
    //         y: 0, 
    //         rotation: 0, 
    //         opacity: 1, 
    //         scale: 1, 
    //         duration: 0.7, 
    //         delay: index * 0.1, 
    //         ease: 'power3.out' 
    //       }
    //     );
    //   });
    // }

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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.projects = {
          featured: data.featured || [],
          senior: data.senior || [],
          junior: data.junior || [],
          sophomore: data.sophomore || null
        };
        this.projectsLoaded = true;
        
        // Setup card effects after projects load
        this.$nextTick(() => {
          this.setupCardHoverEffects();
        });
      } catch (error) {
        console.error('Error loading projects:', error);
        // Set default empty data to prevent errors
        this.projects = {
          featured: [],
          senior: [],
          junior: [],
          sophomore: null
        };
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
    console.log('Vue mounted');
    this.loadProjects();

    // Store bound methods for later removal
    this._handleWheelBound = (e) => this.handleWheel(e);
    this._handleKeyDownBound = (e) => this.handleKeyDown(e);
    this._handleTouchStartBound = (e) => this.handleTouchStart(e);
    this._handleTouchEndBound = (e) => this.handleTouchEnd(e);

    // Scroll and keyboard listeners
    window.addEventListener('wheel', this._handleWheelBound, { passive: false });
    window.addEventListener('keydown', this._handleKeyDownBound);
    window.addEventListener('touchstart', this._handleTouchStartBound);
    window.addEventListener('touchend', this._handleTouchEndBound);

    // Initial animation
    this.$nextTick(() => {
      this.animatePage();
    });
  },

  beforeUnmount() {
    window.removeEventListener('wheel', this._handleWheelBound);
    window.removeEventListener('keydown', this._handleKeyDownBound);
    window.removeEventListener('touchstart', this._handleTouchStartBound);
    window.removeEventListener('touchend', this._handleTouchEndBound);
  }
}).mount('#app');

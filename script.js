console.log('script.js loaded');

const { createApp } = Vue;

console.log('Vue createApp:', typeof createApp);

createApp({
  data() {
    return {
      currentPage: 0,
      pages: ['Home', 'Featured', 'Senior', 'Junior', 'Sophomore', 'About'],
      message: 'Vue is working!',
      projects: {
        featured: [],
        senior: [],
        junior: [],
        sophomore: null
      },
      projectsLoaded: false,
      seniorFilter: null,
      juniorFilter: null,
      isTransitioning: false
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
  watch: {
    currentPage() {
      this.animatePage();
    }
  },
  methods: {
    async loadProjects() {
      try {
        const response = await fetch('projects.json');
        const data = await response.json();
        this.projects = {
          featured: data.featured || [],
          senior: data.senior || [],
          junior: data.junior || [],
          sophomore: data.sophomore || {
            title: 'Sophomore Year Projects',
            message: 'Oops! Sophomore content unavailable.',
            description: 'The original sophomore year content did not load, but the page is still here.',
            subMessages: ['Data load issue', 'Please refresh or try again later', 'This page still exists!']
          }
        };
      } catch (error) {
        console.error('Error loading projects:', error);
        this.projects = {
          featured: [],
          senior: [],
          junior: [],
          sophomore: {
            title: 'Sophomore Year Projects',
            message: 'Oops! Sophomore content unavailable.',
            description: 'The original sophomore year content did not load, but the page is still here.',
            subMessages: ['Data load error', 'Try refreshing the page', 'If running locally, open via a web server']
          }
        };
      } finally {
        this.projectsLoaded = true;
      }
    },
    handleWheel(e) {
      if (this.isTransitioning) return;
      e.preventDefault();
      if (e.deltaY > 0 && this.currentPage < this.pages.length - 1) {
        this.currentPage++;
      } else if (e.deltaY < 0 && this.currentPage > 0) {
        this.currentPage--;
      }
    },
    handleKeyDown(e) {
      if (this.isTransitioning) return;
      if (e.key === 'ArrowDown' && this.currentPage < this.pages.length - 1) {
        this.currentPage++;
      } else if (e.key === 'ArrowUp' && this.currentPage > 0) {
        this.currentPage--;
      }
    },
    animatePage() {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      const currentSection = document.querySelectorAll('.page')[this.currentPage];
      if (currentSection) {
        currentSection.classList.add('active');
        const timeline = this.animatePageEntrance(currentSection, this.pages[this.currentPage]);
        if (timeline && typeof timeline.eventCallback === 'function') {
          timeline.eventCallback('onComplete', () => {
            this.isTransitioning = false;
          });
        } else {
          this.isTransitioning = false;
        }
      } else {
        this.isTransitioning = false;
      }
    },
    animatePageEntrance(pageElement, pageName) {
      const cards = Array.from(pageElement.querySelectorAll('.featured-card, .project-card'));
      const content = Array.from(pageElement.querySelectorAll('.page-title, .hero-text, .scroll-indicator, .filter-controls, .featured-grid, .projects-grid, .error-container, .about-content, .tech-stack'));
      gsap.set([...content, ...cards], { clearProps: 'all' });
      switch (pageName) {
        case 'Home':
          return this.animateHomePage(pageElement, content);
        case 'Featured':
          return this.animateFeaturedPage(pageElement, content, cards);
        case 'Senior':
          return this.animateSeniorPage(pageElement, content, cards);
        case 'Junior':
          return this.animateJuniorPage(pageElement, content, cards);
        case 'Sophomore':
          return this.animateSophomorePage(pageElement, content);
        case 'About':
          return this.animateAboutPage(pageElement, content);
      }
      return null;
    },
    animateHomePage(pageElement, content) {
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, scale: 0.95, y: -120 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.75, ease: 'power2.out' }
      );
      timeline.fromTo(content,
        {
          x: () => gsap.utils.random(-700, -200),
          y: () => gsap.utils.random(-120, 120),
          rotation: () => gsap.utils.random(-40, 40),
          opacity: 0,
          scale: 0.4
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.08
        },
        0.05
      );
      return timeline;
    },
    animateFeaturedPage(pageElement, content, cards) {
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.65, ease: 'power2.out' }
      );
      timeline.fromTo(content,
        { y: 80, opacity: 0, rotation: 15, scale: 0.85 },
        { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.75, ease: 'back.out(1.6)', stagger: 0.06 },
        0.05
      );
      timeline.fromTo(cards,
        {
          x: () => gsap.utils.random(-850, 850),
          y: () => gsap.utils.random(-500, 500),
          rotation: () => gsap.utils.random(-240, 240),
          opacity: 0,
          scale: 0.45
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          stagger: 0.05
        },
        0.1
      );
      return timeline;
    },
    animateSeniorPage(pageElement, content, cards) {
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, rotation: 6, scale: 0.94 },
        { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.7, ease: 'power2.out' }
      );
      timeline.fromTo(content,
        { y: 220, opacity: 0, rotation: 18, scale: 0.7 },
        { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
        0.05
      );
      timeline.fromTo(cards,
        {
          x: () => gsap.utils.random(-700, 700),
          y: () => gsap.utils.random(-450, 450),
          rotation: () => gsap.utils.random(-240, 240),
          opacity: 0,
          scale: 0.55
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          stagger: 0.04
        },
        0.1
      );
      return timeline;
    },
    animateJuniorPage(pageElement, content, cards) {
      gsap.set(pageElement, { perspective: 1200 });
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, rotationX: 60, rotationY: -40 },
        { autoAlpha: 1, rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power2.out' }
      );
      timeline.fromTo(content,
        { z: -240, opacity: 0, scale: 0.6, rotation: 20 },
        { z: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.5)' },
        0.05
      );
      timeline.fromTo(cards,
        {
          x: () => gsap.utils.random(-700, 700),
          y: () => gsap.utils.random(-500, 500),
          rotation: () => gsap.utils.random(-240, 240),
          opacity: 0,
          scale: 0.55
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.85,
          ease: 'power2.out',
          stagger: 0.04
        },
        0.1
      );
      return timeline;
    },
    animateSophomorePage(pageElement, content) {
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, scale: 0.82, rotation: -22 },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.75, ease: 'power2.out' }
      );
      timeline.fromTo(content,
        {
          x: () => gsap.utils.random(-700, 700),
          y: () => gsap.utils.random(-500, 500),
          rotation: () => gsap.utils.random(-80, 80),
          opacity: 0,
          scale: 0.45
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.06
        },
        0.1
      );
      return timeline;
    },
    animateAboutPage(pageElement, content) {
      const elements = Array.from(pageElement.querySelectorAll('.about-section, .tech-badge'));
      const timeline = gsap.timeline();
      timeline.fromTo(pageElement,
        { autoAlpha: 0, scale: 0.92, y: 40 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.65, ease: 'power2.out' }
      );
      timeline.fromTo(elements,
        {
          x: () => gsap.utils.random(-500, 500),
          y: () => gsap.utils.random(-400, 400),
          rotation: () => gsap.utils.random(-45, 45),
          opacity: 0,
          scale: 0.45
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: 0.75,
          ease: 'back.out(1.5)',
          stagger: 0.05
        },
        0.05
      );
      return timeline;
    }
  },
  mounted() {
    console.log('Vue mounted successfully!');
    this.loadProjects();

    window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    window.addEventListener('keydown', this.handleKeyDown.bind(this));

    this.$nextTick(() => {
      this.animatePage();
    });
  }
}).mount('#app');
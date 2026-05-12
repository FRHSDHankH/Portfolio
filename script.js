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
      juniorFilter: null
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
          sophomore: data.sophomore || null
        };
        this.projectsLoaded = true;
      } catch (error) {
        console.error('Error loading projects:', error);
        this.projectsLoaded = true; // Show portfolio even if load fails
      }
    },
    handleWheel(e) {
      e.preventDefault();
      if (e.deltaY > 0 && this.currentPage < this.pages.length - 1) {
        this.currentPage++;
      } else if (e.deltaY < 0 && this.currentPage > 0) {
        this.currentPage--;
      }
    },
    handleKeyDown(e) {
      if (e.key === 'ArrowDown' && this.currentPage < this.pages.length - 1) {
        this.currentPage++;
      } else if (e.key === 'ArrowUp' && this.currentPage > 0) {
        this.currentPage--;
      }
    },
    animatePage() {
      // Simple page switching for now
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      const currentSection = document.querySelectorAll('.page')[this.currentPage];
      if (currentSection) {
        currentSection.classList.add('active');
      }
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
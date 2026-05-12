console.log('script.js loaded');

const { createApp } = Vue;

console.log('Vue createApp:', typeof createApp);

createApp({
  data() {
    return {
      currentPage: 0,
      pages: ['Home', 'Featured', 'Senior', 'Junior', 'Sophomore', 'About'],
      message: 'Vue is working!'
    };
  },
  mounted() {
    console.log('Vue mounted successfully!');
  }
}).mount('#app');
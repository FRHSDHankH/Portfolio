# Hank's Portfolio Website

A beautiful, interactive full-page scroll portfolio showcasing web development projects from Junior through Senior year.

## 🎨 Features

### Navigation & Interactivity
- **Full-page scroll navigation** - Smooth page transitions with no traditional scrollbar
- **Multiple input methods** - Scroll wheel, arrow keys, spacebar, or click navigation dots
- **Keyboard shortcuts** - Home/End keys for quick navigation to first/last pages
- **Touch-friendly** - Swipe gestures support for mobile devices
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile

### Visual Effects
- **GSAP Animations** - Smooth 3D card animations with stagger effects
- **Gradient backgrounds** - Unique color scheme for each section
- **Progress bar** - Animated progress indicator at the top
- **Page counter** - Current page indicator in top-left
- **Navigation dots** - Visual indicators for all pages
- **Hover effects** - Interactive cards with smooth transitions

### Project Organization
- **Featured Projects** - Curated showcase of top 3 projects
- **Senior Year** - 12 advanced projects with difficulty levels
- **Junior Year** - 18 projects across the year
- **Sophomore Year** - Creative 404 error page
- **About Page** - Portfolio information and tech stack

### Filtering & Sorting
- **Difficulty levels** - Beginner, Intermediate, Advanced badges
- **Filter controls** - Filter Senior/Junior projects by difficulty
- **Project metadata** - Tags, descriptions, and difficulty indicators

## 🛠️ Technology Stack

- **Vue.js 3** - Progressive JavaScript framework for reactive UI
- **GSAP** - GreenSock Animation Platform for smooth animations
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with gradients, animations, and effects
- **JavaScript** - Vanilla JS for scroll handling and interactions
- **JSON** - Data structure for project information

## 📁 File Structure

```
Portfolio/
├── index.html          # Main HTML file
├── style.css           # Complete styling and animations
├── script.js           # Vue app and interactions
├── projects.json       # All project data
└── README.md           # This file
```

## 🚀 Getting Started

1. Open `index.html` in a web browser
2. Use any of these methods to navigate:
   - Scroll wheel (or touchpad)
   - Arrow up/down keys
   - Spacebar
   - Click on navigation dots
   - Swipe on mobile
3. Use Home/End keys to jump to first/last pages
4. Click on project cards to visit the project links

## 📊 Pages

1. **Home** - Welcome intro with animation
2. **Featured** - Top 3 showcase projects
3. **Senior Year** - Advanced projects with filters
4. **Junior Year** - Learning journey projects with filters
5. **Sophomore Year** - Creative 404 error page
6. **About** - Portfolio info and tech stack

## ✨ Notable Features

### Animations
- Page transition animations with 800ms smoothness
- Staggered card animations on page load
- Parallax effects on hover
- 3D rotation on cards (rotateY/rotateX)
- Floating animations and smooth scaling

### Responsive Design
- Desktop: Sidebar navigation dots
- Tablet (1024px): Bottom navigation dots
- Mobile (768px): Touch-optimized layout
- Extra small (480px): Compact design

### Interactivity
- Filter projects by difficulty level
- Click any dot to jump to that page instantly
- Smooth scroll with cooldown to prevent rapid changes
- Keyboard navigation with multiple options
- Touch swipe support

### Polish
- Loading screen with spinner
- Progress bar with animated gradient
- Page counter showing progress
- Keyboard shortcuts hint
- Hover tooltips
- Glowing effects on active states

## 🎯 Project Structure

### Senior Year (12 projects)
- JAMissions
- Parking Spots MHS
- Christmas CarolOke
- Movie Poster Gallery
- Vue Mastery
- Slideshow App
- JSON Schedules
- AJAX Basics
- Event Listeners Refresher
- Arrays and Loops
- Functions
- College Recruitment Website

### Junior Year (18 projects)
Including monthly projects, games, generators, and utilities:
- Little Bird Toy Company
- To-Do List
- Hangman Game (Hankman)
- Magic Eight Ball
- Rock Paper Scissors
- And 13 more...

### Sophomore Year
Creative 404 error page with fun messages about a dog eating homework.

## 🎮 Controls Reference

| Action | Result |
|--------|--------|
| Scroll wheel | Navigate pages |
| ↑ Arrow key | Previous page |
| ↓ Arrow key or Space | Next page |
| Home | First page |
| End | Last page |
| Click dot | Jump to page |
| Swipe (mobile) | Navigate pages |

## 💡 Customization

### Colors
Edit the gradient definitions in `style.css`:
- `.home-page` - Purple gradient
- `.featured-page` - Blue gradient
- `.senior-page` - Dark gray gradient
- `.junior-page` - Dark green gradient
- `.sophomore-page` - Red gradient
- `.about-page` - Gray gradient

### Projects
Edit `projects.json` to add/remove projects:
```json
{
  "id": "unique-id",
  "title": "Project Name",
  "url": "https://link-to-project.com",
  "tags": ["Tag1", "Tag2"],
  "description": "Short description",
  "difficulty": "Beginner|Intermediate|Advanced"
}
```

### Animation Timing
Adjust in `script.js`:
- `scrollCooldown: 800` - Milliseconds between page changes
- GSAP duration values in `animatePage()` method

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance

- Lazy loading of project data from JSON
- Efficient GSAP animations with GPU acceleration
- Smooth 60 FPS scrolling
- Optimized CSS with backdrop filters
- Minimal JavaScript overhead

## 🔧 Development Tips

1. **To add a new project:**
   - Add to `projects.json` in appropriate year
   - Add filtering works automatically
   - Animations apply via GSAP

2. **To change colors:**
   - Modify gradient values in CSS
   - Update difficulty badge colors
   - Adjust accent colors

3. **To adjust animations:**
   - Edit GSAP timeline in `animatePage()`
   - Modify CSS `@keyframes` animations
   - Change transition durations in CSS

## 📝 License

Portfolio website created as a senior year project showcase.

## 🎓 About

This portfolio demonstrates growth in web development from Junior through Senior year, featuring:
- Modern JavaScript frameworks (Vue.js)
- Advanced animations (GSAP)
- Responsive design principles
- Interactive user experiences
- Full-stack web development skills

---

**Built with ❤️ using Vue.js, GSAP, and modern CSS**

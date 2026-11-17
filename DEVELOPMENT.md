# Development Guide

This guide will help you understand and modify the VA ROVIENG website.

## Project Structure

```
va-rovieng-website/
├── index.html              # Main homepage
├── presentations.html      # Presentations page
├── script.js              # All JavaScript functionality
├── styles.css             # All CSS styling
├── service-worker.js      # PWA service worker
├── manifest.webmanifest   # Progressive Web App configuration
├── images/                # All image assets
│   ├── heroes/
│   ├── machinery/
│   ├── drilling/
│   ├── materials/
│   ├── icons/
│   └── samples/
└── vendor/
    └── bootstrap-5.3.9/   # Bootstrap framework
```

## Key Features & How They Work

### 1. Hero Slide Show
- Location: `index.html` - `.hero` section
- Functionality: `script.js` - `showSlide()` function
- Features:
  - Auto-rotates every 5 seconds
  - Manual navigation with buttons
  - Click to view full-size photo
  - Respects `prefers-reduced-motion` setting

### 2. Photo Carousels (Field Carousels)
- Multiple carousels throughout the page
- Swipe/drag to navigate on touch devices
- Keyboard arrow keys support
- Auto-play with pause/resume controls
- Smooth scrolling behavior

### 3. Photo Viewer Modal
- Full-screen photo viewing
- Click on any photo to view larger
- Use the zoom buttons, wheel, or pinch to zoom and drag to pan
- Use the arrow buttons or keyboard arrows to browse viewable images across the site
- Close with ESC key or click outside
- Maintains accessibility features

### 4. Custom Scrollbar
- Location: `.page-scrollbar` element
- Shows page position visually
- Clickable and draggable
- Keyboard accessible
- Keyboard shortcuts:
  - Arrow Up/Down: Small scroll
  - Page Up/Down: Large scroll
  - Home: Top of page
  - End: Bottom of page

### 5. Mobile Menu
- Hamburger menu on smaller screens (< 901px)
- Click toggles menu open/close
- ESC key closes menu
- Auto-closes when navigating
- Accessible with ARIA attributes

### 6. Service Worker (PWA)
- Enables offline functionality
- Caches assets for faster loading
- Automatically registers on page load
- Remove/update in `service-worker.js`

## Modifying Content

### Change Hero Images
1. Open `index.html`
2. Find `.hero-slide` elements around line 90-110
3. Update `src` attributes to point to your images
4. Update `data-caption` for photo captions

```html
<img
  class="hero-slide is-active"
  src="images/your-image.png"
  alt=""
  data-caption="Your caption"
/>
```

### Update Navigation Links
1. Open `index.html`
2. Find `<nav class="primary-nav">` (around line 70)
3. Update href attributes to match your sections

### Modify Colors & Styling
1. Open `styles.css`
2. Look for CSS variables at the top:
   - `--color-primary`: Main brand color
   - `--color-text`: Text color
   - `--color-background`: Background color
3. Update values as needed
4. Use browser dev tools to preview changes

### Add New Sections
1. Add HTML in `index.html`
2. Add CSS styling in `styles.css`
3. Add JavaScript functionality in `script.js` if needed
4. Test on mobile and desktop
5. Verify accessibility

## CSS Classes & Utilities

### Component Classes
- `.hero` - Hero section wrapper
- `.field-carousel` - Carousel container
- `.field-carousel-frame` - Scrollable carousel
- `.field-carousel-slide` - Individual carousel item
- `.photo-dialog` - Photo viewer modal
- `.page-scrollbar` - Custom scrollbar

### State Classes
- `.is-active` - Active/visible state
- `.is-open` - Menu open state
- `.is-dragging` - Dragging state
- `.is-visible` - Visibility animation state
- `.motion-reveal` - Animation class for reveal effect

### Bootstrap Classes
Bootstrap 5.3.9 utilities are available:
- Grid: `.container`, `.row`, `.col-*`
- Spacing: `.m-*`, `.p-*`
- Text: `.text-center`, `.text-muted`
- Display: `.d-flex`, `.d-none`, `.d-block`

## JavaScript Events

### Custom Events Handled
```javascript
// Menu toggle
menuToggle.addEventListener('click', ...)

// Photo viewer
heroPhotoTrigger.addEventListener('click', ...)
photoDialog.addEventListener('click', ...)
photoDialogClose.addEventListener('click', ...)

// Carousel navigation
frame.addEventListener('scroll', ...)
frame.addEventListener('keydown', ...)
frame.addEventListener('pointerdown', ...)

// Scrollbar interactions
pageScrollbarTrack.addEventListener('pointerdown', ...)
pageScrollbarTrack.addEventListener('keydown', ...)

// Window events
window.addEventListener('resize', ...)
window.addEventListener('scroll', ...)
document.addEventListener('keydown', ...)
```

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly
- Focus management
- `prefers-reduced-motion` support

To verify accessibility:
1. Use browser dev tools
2. Use Lighthouse audits
3. Test with keyboard navigation
4. Test with screen readers (NVDA, JAWS)

## Performance Tips

1. **Image Optimization**:
   - Use modern formats (WebP)
   - Compress images before uploading
   - Use appropriate image sizes

2. **Code Splitting**:
   - Keep separate files organized
   - Remove unused code
   - Minify for production

3. **Caching**:
   - Service worker caches static assets
   - Update cache version if changing files
   - Test offline functionality

## Testing Checklist

- [ ] Pages load without errors
- [ ] All links work (internal and external)
- [ ] Images display properly
- [ ] Carousels navigate smoothly
- [ ] Photos open in modal viewer
- [ ] Mobile menu functions correctly
- [ ] Keyboard navigation works
- [ ] Mobile responsive design
- [ ] Tablet view looks good
- [ ] Desktop view optimal
- [ ] Service worker registers
- [ ] Offline mode works (with PWA)

## Browser DevTools Tips

1. **Mobile Testing**:
   - F12 → Device Toolbar
   - Test on various screen sizes

2. **Console Errors**:
   - F12 → Console tab
   - Fix any red error messages

3. **Performance**:
   - F12 → Performance tab
   - Record and analyze loading

4. **Accessibility**:
   - F12 → Lighthouse
   - Run audit for accessibility

## Deployment Options

1. **GitHub Pages** (Recommended for GitHub repos):
   - Free hosting
   - Built-in with GitHub
   - Automatic deployment

2. **Netlify**:
   - Easy setup
   - Continuous deployment
   - Custom domain support

3. **Traditional Hosting**:
   - Upload files via FTP
   - Use hosting provider's tools
   - Manual updates

## Common Issues & Solutions

### Images not loading
- Check file paths are relative
- Ensure image files exist in images/ folder
- Use correct case (Linux servers are case-sensitive)

### JavaScript errors in console
- Check browser console (F12)
- Verify all elements exist in HTML
- Check for missing script references

### Styling issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check for conflicting CSS
- Use browser dev tools to inspect

### Mobile menu not working
- Check viewport meta tag exists
- Verify screen width breakpoint
- Test in actual mobile device

## Getting Help

- Check existing comments in code
- Review GitHub issues
- Search Stack Overflow
- Consult MDN Web Docs
- Post in GitHub Discussions

---

Happy developing! 🚀

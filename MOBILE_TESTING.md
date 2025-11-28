# 📱 Mobile Testing Guide

## Features to Test on Mobile

### 1. **Fullscreen Experience** ✅
- [ ] App fills entire screen (no browser chrome visible)
- [ ] No white spaces at top or bottom
- [ ] Proper safe area padding on notched devices
- [ ] No unwanted scrolling

**How to Test:**
1. Open on mobile browser
2. Add to home screen (iOS/Android)
3. Launch from home screen
4. Verify fullscreen experience

---

### 2. **Sidebar Toggle Button Behavior** ✅

#### **Should HIDE when:**
- [ ] Opening University
- [ ] Opening Theme Store
- [ ] Opening Premium/Upgrade modal
- [ ] Opening Language selector
- [ ] Any modal is active

#### **Should SHOW when:**
- [ ] On main screen with no modals
- [ ] After closing any modal
- [ ] When challenge viewer is open

**How to Test:**
1. Open app on mobile
2. Click "University" - toggle button should disappear
3. Close modal - toggle button should reappear
4. Repeat for Theme Store and other modals

---

### 3. **Tap to Dismiss Sidebar** ✅
- [ ] Sidebar is visible
- [ ] Tap anywhere on main content
- [ ] Sidebar smoothly slides away
- [ ] Toggle button shows collapsed state

**How to Test:**
1. Open sidebar using toggle button
2. Tap anywhere in the main content area
3. Sidebar should close automatically
4. Does NOT happen when sidebar is already closed

---

### 4. **University on Mobile** ✅
- [ ] Grid layout adapts to screen width
- [ ] Cards are touchable (not too small)
- [ ] Smooth scrolling
- [ ] "Play Challenge" buttons work
- [ ] Share functionality works (clipboard)

**How to Test:**
1. Share a challenge on desktop
2. Open University on mobile
3. Verify cards display properly
4. Tap a challenge to play it

---

### 5. **Theme Store on Mobile** ✅
- [ ] Themes fill entire modal height
- [ ] No weird scrollable box inside modal
- [ ] Grid adapts to screen width
- [ ] Themes are touchable
- [ ] Theme switching works

**How to Test:**
1. Open Theme Store
2. Verify themes fill the screen
3. Scroll through themes smoothly
4. Select and apply a theme

---

### 6. **Challenge Completion on Mobile** ✅
- [ ] All buttons visible (don't overflow)
- [ ] "Solve Differently" button works
- [ ] "Share with Community" button works
- [ ] Link copies to clipboard
- [ ] Share confirmation appears

**How to Test:**
1. Complete a challenge on mobile
2. Verify all 3 buttons are visible
3. Tap "Share with Community"
4. Check clipboard has the link

---

## Screen Size Breakpoints

| Device Type | Width | Layout Changes |
|-------------|-------|----------------|
| Small Phone | 320px - 480px | 2-column language grid, 3-column theme grid |
| Phone | 481px - 768px | 2-column language grid, 4-column theme grid |
| Tablet | 769px - 1024px | Desktop layout with mobile touches |
| Desktop | 1025px+ | Full desktop layout |

---

## Common Mobile Issues to Check

### ✅ **Fixed Issues:**
- [x] Viewport not fullscreen
- [x] Toggle button visible in modals
- [x] Theme store has scrollable box
- [x] Can't dismiss sidebar on mobile
- [x] Buttons too small to tap

### 🔍 **Things to Watch:**
- [ ] Landscape orientation
- [ ] Keyboard covering inputs
- [ ] Touch scrolling momentum
- [ ] Pinch to zoom (should be disabled)

---

## iOS-Specific Testing

**Test on:**
- [ ] Safari (main browser)
- [ ] Chrome iOS
- [ ] Home screen app

**Check:**
- [ ] Notch safe area
- [ ] Bottom home indicator clearance
- [ ] Status bar visibility
- [ ] Fullscreen on launch from home screen

---

## Android-Specific Testing

**Test on:**
- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Samsung Internet
- [ ] Home screen app

**Check:**
- [ ] System navigation bars
- [ ] Fullscreen mode
- [ ] Back button behavior
- [ ] Status bar

---

## Quick Mobile Checklist

### Before You Start:
```bash
npm start
# Note your local IP (e.g., 192.168.1.100)
# Access from mobile: http://192.168.1.100:3000
```

### Test Flow:
1. ✅ Open app - fullscreen?
2. ✅ Toggle sidebar - button shows/hides?
3. ✅ Open University - button hides?
4. ✅ Close University - button shows?
5. ✅ Tap main content with sidebar open - closes?
6. ✅ Open Theme Store - fills screen?
7. ✅ Complete challenge - all buttons visible?
8. ✅ Share challenge - link copies?

---

## Debugging Mobile Issues

### View Console on Mobile:

**iOS Safari:**
1. Connect device to Mac
2. Safari > Develop > [Your iPhone] > [Your Page]

**Android Chrome:**
1. Connect device via USB
2. Chrome > chrome://inspect
3. Find your device and page

### Common Fixes:

**If fullscreen not working:**
- Check viewport meta tag
- Verify body height CSS
- Check for overflow issues

**If toggle button not hiding:**
- Inspect `.hide-on-modal` class
- Check `updateToggleButtonVisibility()` function
- Verify modal `.active` class is being added

**If tap-to-dismiss not working:**
- Check if event listener is attached
- Verify window.innerWidth check
- Test touch vs click events

---

## Performance on Mobile

### Target Metrics:
- [ ] First paint < 1s
- [ ] Interactive < 2s
- [ ] Smooth 60fps animations
- [ ] No jank on scroll

### Optimize:
- ✅ Minimal JS on load
- ✅ Lazy load modals
- ✅ CSS animations (not JS)
- ✅ Debounced scroll handlers

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Safari iOS | 12+ | ✅ Supported |
| Chrome Mobile | Latest | ✅ Supported |
| Firefox Mobile | Latest | ✅ Supported |
| Samsung Internet | Latest | ✅ Supported |
| Edge Mobile | Latest | ✅ Supported |

---

**Happy Mobile Testing!** 📱✨

If you find any issues, check the console and verify:
1. Event listeners are attached
2. CSS classes are being applied
3. No JavaScript errors
4. Viewport meta tag is correct

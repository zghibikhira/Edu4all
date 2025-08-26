# 🎨 Design System - Edu4All Platform

## 📋 Overview

This document outlines the complete design system implementation for the Edu4All education platform, including color palette, typography, components, and accessibility features.

## 🎨 Color Palette

### Primary Colors

| Color              | Hex Code  | Usage                           | CSS Variable            |
| ------------------ | --------- | ------------------------------- | ----------------------- |
| **Bleu Confiance** | `#1E90FF` | Primary buttons, headers, links | `--color-primary`       |
| **Bleu Hover**     | `#0066CC` | Button hover states             | `--color-primary-dark`  |
| **Bleu Light**     | `#4DA6FF` | Secondary elements              | `--color-primary-light` |

### Background Colors

| Color           | Hex Code  | Usage                        | CSS Variable               |
| --------------- | --------- | ---------------------------- | -------------------------- |
| **Gris clair**  | `#F5F5F5` | Page backgrounds, light mode | `--color-background-light` |
| **Mode sombre** | `#181818` | Dark mode backgrounds        | `--color-background-dark`  |

### Text Colors

| Color           | Hex Code  | Usage                    | CSS Variable           |
| --------------- | --------- | ------------------------ | ---------------------- |
| **Noir doux**   | `#2B2B2B` | Primary text, light mode | `--color-text-primary` |
| **Texte clair** | `#ECECEC` | Primary text, dark mode  | `--color-text-light`   |

### Semantic Colors

| Color                   | Hex Code  | Usage                            | CSS Variable      |
| ----------------------- | --------- | -------------------------------- | ----------------- |
| **Vert succès**         | `#2ECC71` | Success states, positive actions | `--color-success` |
| **Rouge alerte**        | `#E74C3C` | Errors, danger states            | `--color-danger`  |
| **Jaune accessibilité** | `#FFB400` | Warnings, attention              | `--color-warning` |
| **Violet innovation**   | `#8E44AD` | AI features, advanced modules    | `--color-accent`  |

## 🔤 Typography

### Font Families

| Font        | Usage                  | Weight  | CSS Class      |
| ----------- | ---------------------- | ------- | -------------- |
| **Poppins** | Headings, titles       | 300-800 | `font-poppins` |
| **Inter**   | Body text, UI elements | 300-700 | `font-inter`   |
| **Nunito**  | Alternative, friendly  | 300-700 | `font-nunito`  |
| **Roboto**  | Technical content      | 300-700 | `font-roboto`  |
| **Lato**    | Body text alternative  | 300-700 | `font-lato`    |

### Typography Scale

```css
h1 {
  font-size: 2.25rem;
  line-height: 1.2;
} /* 36px */
h2 {
  font-size: 1.875rem;
  line-height: 1.3;
} /* 30px */
h3 {
  font-size: 1.5rem;
  line-height: 1.4;
} /* 24px */
h4 {
  font-size: 1.25rem;
  line-height: 1.5;
} /* 20px */
h5 {
  font-size: 1.125rem;
  line-height: 1.6;
} /* 18px */
h6 {
  font-size: 1rem;
  line-height: 1.6;
} /* 16px */
```

### Line Heights

- **Tight**: `1.2` - Headings
- **Normal**: `1.6` - Body text
- **Relaxed**: `1.8` - Long-form content

## 🧩 Component System

### Buttons

```css
.btn-primary {
  @apply bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-semibold font-inter shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus-ring;
}

.btn-secondary {
  @apply border-2 border-primary text-primary bg-transparent px-6 py-3 rounded-lg font-semibold font-inter hover:bg-primary hover:text-white transition-all duration-300 focus-ring;
}
```

### Cards

```css
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700;
}

.card-hover {
  @apply card hover:transform hover:-translate-y-1 hover:scale-[1.02];
}
```

### Inputs

```css
.input-field {
  @apply w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-text-light font-inter focus-ring transition-colors duration-200;
}
```

### Badges

```css
.badge-primary {
  @apply bg-primary/10 text-primary border border-primary/20;
}
.badge-success {
  @apply bg-success/10 text-success border border-success/20;
}
.badge-warning {
  @apply bg-warning/10 text-warning border border-warning/20;
}
.badge-danger {
  @apply bg-danger/10 text-danger border border-danger/20;
}
.badge-accent {
  @apply bg-accent/10 text-accent border border-accent/20;
}
```

## 🌙 Dark Mode Implementation

### Theme Context

The platform uses a React Context for theme management with three modes:

- **Light**: Default light theme
- **Dark**: Dark theme for reduced eye strain
- **Auto**: Follows system preference

### Dark Mode Colors

```css
.dark {
  --color-background: #181818;
  --color-surface: #1f1f1f;
  --color-text: #ececec;
  --color-text-secondary: #a0a0a0;
}
```

### Theme Toggle Component

```jsx
<ThemeToggle className="flex items-center gap-2" showLabels={true} />
```

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### Focus Management

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark;
}
```

### Skip Links

```html
<a href="#main-content" class="skip-link sr-only focus:not-sr-only">
  Passer au contenu principal
</a>
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎭 Animation System

### Transitions

- **Duration**: 150ms for micro-interactions, 300ms for major changes
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, natural motion
- **Properties**: Color, background, transform, opacity, shadow

### Keyframe Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### Animation Classes

- `.animate-fade-in` - Fade in from bottom
- `.animate-slide-in` - Slide in from left
- `.animate-slide-in-right` - Slide in from right
- `.animate-pulse-slow` - Slow pulse animation
- `.animate-bounce-slow` - Slow bounce animation

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Container System

```css
.container-responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
```

### Mobile Navigation

- **Hamburger Menu**: Collapsible navigation for mobile
- **Touch Targets**: Minimum 44px for touch interactions
- **Gesture Support**: Swipe gestures for mobile navigation

## 🎨 Design Tokens

### Spacing Scale

```css
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-full: 9999px; /* Full circle */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## 🔧 Implementation Guide

### 1. Theme Provider Setup

```jsx
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return <ThemeProvider>{/* Your app components */}</ThemeProvider>;
}
```

### 2. Using Design System Classes

```jsx
// Button with primary styling
<button className="btn-primary">Primary Action</button>

// Card with hover effects
<div className="card-hover">
  <h3 className="font-poppins text-xl">Card Title</h3>
  <p className="font-inter text-gray-600 dark:text-gray-300">
    Card content
  </p>
</div>

// Input field with proper styling
<input
  type="text"
  className="input-field"
  placeholder="Enter text..."
/>
```

### 3. Dark Mode Usage

```jsx
import { useTheme } from "./contexts/ThemeContext";

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800">
      <button onClick={toggleTheme}>{isDark ? "☀️" : "🌙"}</button>
    </div>
  );
}
```

## 📊 Design Principles

### 1. **Accessibility First**

- All components must be keyboard accessible
- Proper color contrast ratios
- Screen reader friendly markup

### 2. **Mobile First**

- Design for mobile devices first
- Progressive enhancement for larger screens
- Touch-friendly interface elements

### 3. **Consistency**

- Consistent spacing and typography
- Unified color palette across components
- Standardized interaction patterns

### 4. **Performance**

- Optimized animations and transitions
- Efficient CSS with Tailwind utilities
- Minimal JavaScript for theme switching

### 5. **User Experience**

- Clear visual hierarchy
- Intuitive navigation patterns
- Responsive feedback for user actions

## 🧪 Testing Guidelines

### Visual Testing

- Test all components in both light and dark modes
- Verify color contrast ratios meet WCAG standards
- Check responsive behavior across all breakpoints

### Accessibility Testing

- Keyboard navigation testing
- Screen reader compatibility
- Focus management verification

### Performance Testing

- Animation performance on low-end devices
- Theme switching speed
- CSS bundle size optimization

## 📚 Resources

### Tools

- **Color Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Accessibility Testing**: [axe DevTools](https://www.deque.com/axe/)
- **Design Tokens**: [Style Dictionary](https://amzn.github.io/style-dictionary/)

### References

- **WCAG 2.1 Guidelines**: [W3C Web Accessibility Initiative](https://www.w3.org/WAI/WCAG21/quickref/)
- **Material Design**: [Google Material Design](https://material.io/design)
- **Human Interface Guidelines**: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Edu4All Development Team

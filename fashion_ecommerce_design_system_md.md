# Fashion Ecommerce Design System

## Design Inspiration

### Reference Websites
- The Souled Store
- Wrogn

This design system combines:
- The playful and youthful energy of The Souled Store
- The premium streetwear aesthetic of Wrogn

---

# 1. Brand Direction

## Core Brand Personality

### The Souled Store Inspired
- Playful
- Expressive
- Youthful
- Pop-culture focused
- Community-driven

### Wrogn Inspired
- Premium
- Bold
- Masculine
- Fashion-forward
- Minimal and clean

---

# 2. Visual Style

## Design Feel
Modern Indian fashion ecommerce platform with:
- Bold typography
- Large product imagery
- Premium layouts
- Mobile-first UI
- Clean sections
- Strong visual hierarchy
- Minimal clutter

## Keywords
- Modern
- Streetwear
- Editorial
- Premium
- Gen-Z
- Fashion-forward
- Urban

---

# 3. Color System

## Primary Colors

| Role | Color |
|---|---|
| Primary Black | #0F0F0F |
| Pure White | #FFFFFF |
| Soft Gray | #F5F5F5 |
| Border Gray | #E5E5E5 |
| Secondary Text | #6B7280 |
| Accent Red | #FF3B30 |
| Accent Yellow | #FFD500 |
| Accent Blue | #2563EB |
| Success Green | #16A34A |

---

# 4. Typography System

## Primary Fonts
- Inter
- Plus Jakarta Sans

## Premium Alternative Fonts
- General Sans
- Satoshi

## Typography Scale

| Element | Size | Weight |
|---|---|---|
| Hero Heading | 64px | 800 |
| Section Heading | 40px | 700 |
| Product Title | 16px | 600 |
| Product Price | 18px | 700 |
| Body Text | 15px | 400 |
| Small Text | 13px | 400 |
| Button Text | 14px | 600 |

---

# 5. Layout System

## Desktop Layout
- Max Width: 1440px
- Content Width: 1280px
- Gutter: 24px

## Tablet Layout
- Width: 100%
- Padding: 20px

## Mobile Layout
- Padding: 16px

---

# 6. Spacing System

| Token | Value |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

---

# 7. Border Radius

| Component | Radius |
|---|---|
| Buttons | 12px |
| Cards | 18px |
| Product Cards | 20px |
| Inputs | 12px |
| Modals | 24px |

---

# 8. Shadow System

## Card Shadow
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.08);
```

## Hover Shadow
```css
box-shadow: 0 12px 30px rgba(0,0,0,0.12);
```

---

# 9. Button System

## Primary Button

### Style
- Black background
- White text
- Rounded corners
- Bold typography

### Padding
```css
padding: 14px 24px;
```

### Hover Effects
- Slight scale
- Reduced opacity
- Smooth transition

---

## Secondary Button

### Style
- White background
- Black border
- Black text

---

# 10. Navigation System

## Navbar Structure

### Left
- Brand Logo

### Center
- Men
- New Arrivals
- Oversized
- Accessories
- Collections

### Right
- Search
- Wishlist
- Cart
- Profile

---

## Navbar Behavior

### Desktop
- Transparent initially
- Solid background on scroll

### Mobile
- Bottom navigation
- Slide drawer menu

---

# 11. Homepage Structure

## Homepage Sections

1. Hero Banner
2. Trending Collections
3. New Arrivals
4. Best Sellers
5. Promotional Banner
6. Category Grid
7. Brand Story
8. Customer Testimonials
9. Instagram Feed
10. Newsletter Section
11. Footer

---

# 12. Hero Section

## Hero Style
Inspired by:
- Wrogn editorial banners
- The Souled Store promotional layouts

## Features
- Fullscreen layout
- Fashion photography
- Large typography
- CTA buttons
- Carousel support
- Responsive design

---

# 13. Product Card System

## Product Card Features
- Large product image
- Hover second image
- Wishlist icon
- Discount badge
- Quick add button
- Hover animation

## Product Information
- Product title
- Category
- Rating
- Original price
- Discounted price
- Discount percentage

---

# 14. Product Page Layout

## Left Section
- Product gallery
- Image zoom
- Image thumbnails

## Right Section
- Product title
- Ratings
- Pricing
- Offers
- Size selector
- Add to cart
- Buy now button
- Delivery information
- Return policy

---

# 15. Filter System

## Desktop
- Left sidebar filters

## Mobile
- Bottom sheet filters

## Filter Categories
- Size
- Color
- Price
- Fit
- Collection
- Category
- Availability

---

# 16. Animation System

## Motion Style
- Smooth
- Minimal
- Premium

## Recommended Tools
- Motion
- CSS Transitions

## Animation Duration
```css
transition-duration: 200ms - 350ms;
```

## Animation Types
- Fade Up
- Scale Hover
- Slide Drawer
- Skeleton Loading
- Micro interactions

---

# 17. Mobile-First UX Rules

## Mobile Priorities
- Sticky add-to-cart
- Swipe carousels
- Fast image loading
- Thumb-friendly spacing
- Sticky filters
- Minimal text clutter

---

# 18. Component Tokens

## Input Fields

```css
height: 52px;
border-radius: 12px;
border: 1px solid #E5E5E5;
```

## Cards

```css
background: white;
border-radius: 20px;
overflow: hidden;
```

---

# 19. Icon System

## Recommended Libraries
- Lucide Icons
- Heroicons

## Icon Style
- Outline icons
- 1.5px stroke
- Minimal design

---

# 20. Image Style Guide

## Photography Style

### Wrogn Influence
- High contrast
- Urban fashion shoots
- Premium streetwear vibe

### The Souled Store Influence
- Colorful
- Energetic
- Expressive

## Product Images
- Plain backgrounds
- Consistent aspect ratio
- Alternate hover images

---

# 21. AI Agent Build Rules

## Frontend Requirements
- Next.js
- TailwindCSS
- shadcn/ui
- Motion
- Fully responsive
- Mobile-first
- Accessible UI
- SEO optimized

## Performance Requirements
- Lazy loading
- Skeleton loaders
- Optimized images
- Smooth page transitions
- Fast navigation

---

# 22. Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Styling | TailwindCSS |
| UI Components | shadcn/ui |
| Animations | Motion |
| Payments | Razorpay + Stripe |

---

# 23. Final Design Direction

The final ecommerce platform should:
- Feel premium
- Focus on mobile-first UX
- Be optimized for conversions
- Use clean modern layouts
- Target Gen-Z and fashion-focused audiences
- Blend playful energy with premium fashion aesthetics
- Maintain consistent branding across all pages

---

# 24. AI Prompt Instructions

## Instructions for AI Agent

Build a premium Indian fashion ecommerce platform inspired by The Souled Store and Wrogn.

Requirements:
- Use modern clean layouts
- Mobile-first responsive design
- Large fashion product imagery
- Premium typography hierarchy
- Minimal but bold UI
- Smooth animations
- Optimized performance
- Modern ecommerce UX patterns
- Fully scalable architecture
- Maintain strong visual consistency across all components

The design should combine:
- The energetic and expressive merchandising style of The Souled Store
- The premium editorial fashion style of Wrogn


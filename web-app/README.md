# Creator Stock Exchange - Client

A modern, responsive landing page for the Creator Stock Exchange platform built with Next.js 15, React 19, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router)
- **React:** 19.0.0
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP 3.13.0 with ScrollTrigger
- **Typography:** Cabinet Grotesk, Quicksand
- **Language:** TypeScript (strict mode)

## 📁 Project Structure

```
client/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── Features/            # Feature card sub-components
│   ├── Footer/              # Footer sub-components
│   ├── HowItWorks/          # How-it-works sub-components
│   ├── FAQ/                 # FAQ accordion components
│   ├── Features.tsx         # Features section
│   ├── Footer.tsx           # Footer
│   ├── HowItWorks.tsx       # How-it-works section
│   ├── FAQ.tsx              # FAQ section
│   ├── Hero.tsx             # Hero section
│   ├── Stats.tsx            # Stats section
│   ├── TopCreators.tsx      # Top creators carousel
│   └── Step.tsx             # Individual step display
│
├── constants/               # Data & configuration
│   ├── featuresData.ts      # Features content
│   ├── footerData.ts        # Footer links & branding
│   ├── faqData.ts           # FAQ questions
│   ├── howItWorksData.ts    # Workflow steps
│   ├── animationConfig.ts   # GSAP settings
│   └── index.ts             # Central exports
│
├── hooks/                   # Custom React hooks
│   └── useScrollAnimation.ts # GSAP scroll logic
│
├── utils/                   # Helper functions
│   └── scrollUtils.ts       # Scroll utilities
│
├── types/                   # TypeScript interfaces
│   └── howItWorks.ts
│
└── public/                  # Static assets
    ├── fonts/               # Cabinet Grotesk fonts
    ├── images/
    │   ├── creators/        # Creator profile images
    │   ├── features/        # Feature illustrations
    │   └── how-it-works/    # Workflow illustrations
    └── logo.png
```

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## ✨ Key Features

- **Responsive Design:** Mobile-first approach with breakpoints at 768px, 1024px, and 1280px
- **GSAP Animations:** Smooth pinned scroll on desktop (disabled on mobile)
- **Modular Architecture:** Data-driven components with centralized configuration
- **Type-Safe:** Full TypeScript coverage with strict mode
- **Accessible:** ARIA labels, semantic HTML, keyboard navigation
- **Performance:** Image lazy loading, memoization, optimized re-renders

## 📝 Making Changes

### Add a New Feature Card
Edit `constants/featuresData.ts`:
```typescript
{
  id: "unique-id",
  title: "Feature Name",
  image: "/images/features/image.png",
  // ... more fields
}
```

### Add a New FAQ
Edit `constants/faqData.ts`:
```typescript
{
  question: "Your question?",
  answer: "Your answer."
}
```

### Update Footer Links
Edit `constants/footerData.ts` in the `FOOTER_COLUMNS` array.

## 📚 Documentation

- **Code Cleanup:** See `CODE_CLEANUP_DOCUMENTATION.md`
- **Quick Start:** See `QUICK_START.md`
- **Architecture:** See `ARCHITECTURE_DIAGRAM.md`
- **Public Assets:** See `public/README.md`

## 🎨 Design System

- **Brand Color:** `#5BD640` (brand-green)
- **Fonts:** Cabinet Grotesk (headings), Quicksand (body)
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)

## 🔧 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📄 License

This project is part of the Creator Stock Exchange platform.

---

Built with ❤️ using Next.js and Tailwind CSS

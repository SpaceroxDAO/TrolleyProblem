# TrolleyProblem Development Plan

## ✅ Completed (December 2025)

### Phase 1: Quick Wins - DONE
- ✅ Sound mute toggle with localStorage persistence
- ✅ Full keyboard navigation (A/B choices, Enter, M mute, 1/2 modes)
- ✅ Game state persistence in localStorage
- ✅ Results history tracking

### Phase 2: Core Consolidation - DONE
- ✅ Merged V1/V2 into unified `index.html`
- ✅ Quick Play (5 scenarios) and Full Examination (12 scenarios) modes
- ✅ Improved responsive design

### Phase 3: Sharing & Results - DONE
- ✅ Share modal with copy text, Twitter share, image download
- ✅ Choice history showing how each decision affected scores
- ✅ Real-time score impact display after each choice
- ✅ Generated shareable results image

### Phase 4: Accessibility - DONE
- ✅ ARIA labels on all interactive elements
- ✅ Screen reader live announcements
- ✅ Enhanced focus indicators
- ✅ Reduced motion support (@media prefers-reduced-motion)
- ✅ High contrast mode support
- ✅ Skip to content link

### Phase 5: Scenario Packs - DONE
- ✅ AI Ethics Pack (6 new scenarios)
- ✅ 4 game modes: Quick, Full, AI Ethics, Complete Edition
- ✅ Extended keyboard shortcuts (1-4)
- ✅ 18 total scenarios available

---

## Project Overview

This is a philosophical ethics exploration game that guides users through moral dilemmas inspired by the classic Trolley Problem. It's a front-end web application with a retro pixel-art aesthetic.

### Current State

**Two Versions Exist:**

| Version | Files | Scenarios | Features |
|---------|-------|-----------|----------|
| V1 | `index.html`, `codepen-js.js`, `codepen-css.css` | 5 | Basic philosophy classification (3 types) |
| V2 | `codepen-v2-html.html`, `codepen-v2-js.js`, `codepen-v2-css.css` | 12 | 6 philosophy schools, 12 philosopher matches, consistency tracking, trait analysis |

**Tech Stack:** Pure HTML5/CSS3/JavaScript, Canvas 2D, Web Audio API

---

## Areas for Enhancement

### High Priority - Core Features

#### 1. Consolidate V1 and V2 into Unified Application
- **Problem:** Two separate codebases with duplicated functionality
- **Solution:** Create a single `index.html` that uses V2 logic but offers "Quick Play" (5 scenarios) and "Full Examination" (12 scenarios) modes
- **Files to modify:** Create new unified entry point, deprecate V1

#### 2. Persistent State Storage (localStorage)
- **Problem:** Game progress is lost on page refresh
- **Solution:**
  - Save game state during play
  - Store completed examination results history
  - Allow users to review past philosophical profiles
- **Implementation:**
  ```javascript
  // Save state
  localStorage.setItem('trolleyGameState', JSON.stringify(gameState));
  // Load state
  const saved = JSON.parse(localStorage.getItem('trolleyGameState'));
  ```

#### 3. Share/Export Results
- **Problem:** Users can't share their philosophical profile
- **Solution:**
  - Generate shareable image of results (canvas snapshot)
  - Copy-to-clipboard summary text
  - Social sharing buttons (Twitter/X, Reddit)
  - Export as JSON for data portability

#### 4. Sound Toggle/Mute Option
- **Problem:** No way to mute game sounds
- **Solution:** Add mute button in UI, persist preference in localStorage

---

### Medium Priority - User Experience

#### 5. Accessibility Improvements
- Add keyboard navigation (Tab through choices, Enter to select)
- ARIA labels for screen readers
- Focus indicators for interactive elements
- Reduced motion option for animations
- Color contrast verification

#### 6. Mobile Optimization
- Touch gesture support
- Better responsive design (current max-width is 400-440px)
- Prevent zoom on double-tap
- Touch-friendly button sizes

#### 7. Loading/Tutorial Screens
- Add brief tutorial explaining mechanics
- Show loading indicator for canvas initialization
- Animated transition between screens

#### 8. Choice Confirmation
- "Are you sure?" prompt for particularly consequential decisions
- Undo option before moving to results

---

### Lower Priority - Extended Features

#### 9. Additional Scenario Packs
- "Medical Ethics Pack" - Healthcare-focused dilemmas
- "AI Ethics Pack" - Technology and AI dilemmas
- "Environmental Ethics Pack" - Climate and nature dilemmas
- "Business Ethics Pack" - Corporate and workplace dilemmas

#### 10. Philosopher Deep Dives
- Clickable philosopher matches with extended explanations
- Reading recommendations for each philosophy school
- Quote collections from matched philosophers
- Link to educational resources

#### 11. Multiplayer/Social Features
- Compare results with friends (via shareable links)
- Anonymous aggregate statistics ("X% of players made this choice")
- Debate mode - two players argue opposing choices

#### 12. Advanced Analytics
- Detailed breakdown charts (pie charts, radar charts)
- Decision timeline visualization
- Comparison to "average" player profile
- Track philosophical evolution over multiple plays

#### 13. Internationalization (i18n)
- Multi-language support
- Translate scenarios and philosophical descriptions
- Language selector in settings

#### 14. Theme Options
- Light mode alternative
- Different color palettes
- CRT scanline toggle

---

## Technical Improvements

### Code Quality

#### 15. Modular Architecture
- Split into ES modules
- Separate concerns: `scenarios.js`, `scoring.js`, `drawing.js`, `audio.js`, `ui.js`
- Use a bundler (Vite/esbuild) for production builds

#### 16. Build System
- Add `package.json` with scripts
- Minification for production
- CSS autoprefixing
- Optional TypeScript migration

#### 17. Testing
- Unit tests for scoring algorithm
- Consistency check logic tests
- Visual regression tests for canvas scenes
- E2E tests for game flow

#### 18. Documentation
- JSDoc comments for functions
- README with setup instructions
- Contributing guidelines
- API documentation for scoring system

---

## Implementation Priority Order

### Phase 1: Quick Wins (1-2 days)
1. Add sound mute toggle
2. Implement localStorage persistence
3. Add keyboard navigation basics

### Phase 2: Core Consolidation (3-5 days)
4. Merge V1/V2 into unified application
5. Add Quick Play vs Full modes
6. Improve mobile responsiveness

### Phase 3: Sharing & Social (2-3 days)
7. Implement share/export results
8. Generate shareable result images
9. Add social share buttons

### Phase 4: Accessibility (2-3 days)
10. Full keyboard navigation
11. ARIA labels and screen reader support
12. Reduced motion support

### Phase 5: Extended Features (ongoing)
13. Additional scenario packs
14. Philosopher deep dives
15. Advanced analytics/charts
16. Internationalization

---

## File Structure After Consolidation

```
TrolleyProblem/
├── index.html              # Main entry point
├── src/
│   ├── js/
│   │   ├── main.js         # Entry point, initialization
│   │   ├── game.js         # Game state & flow
│   │   ├── scenarios.js    # All scenario data
│   │   ├── scoring.js      # Philosophy scoring logic
│   │   ├── drawing.js      # Canvas scene rendering
│   │   ├── audio.js        # Sound synthesis
│   │   └── storage.js      # localStorage handling
│   └── css/
│       ├── main.css        # Base styles
│       ├── screens.css     # Screen-specific styles
│       └── animations.css  # Animation keyframes
├── assets/
│   └── fonts/              # Press Start 2P font (local)
├── package.json
├── README.md
└── DEVELOPMENT_PLAN.md     # This file
```

---

## Getting Started

To begin implementing these improvements:

1. **Choose a priority item** from the phase that makes sense
2. **Create a feature branch** from the current branch
3. **Implement incrementally** with regular commits
4. **Test thoroughly** in multiple browsers
5. **Update this plan** as features are completed

---

## Notes

- V2 is the more complete implementation - build upon it
- Maintain the retro pixel-art aesthetic in any new features
- Keep JavaScript vanilla (no frameworks) unless absolutely necessary
- Prioritize user experience over feature count

# NeuroPlay AI — FocusArcade Solar System Space Lab

## Phase 1: Design System & Project Setup
- [x] Configure Comfortaa + Poppins fonts via Google Fonts CDN in index.html
- [x] Set up CSS design tokens: #0F172A background, #00E5FF cyan, #7C4DFF purple, #AEEA00 lime
- [x] Apply dark theme globally with zero sharp edges (border-radius everywhere)
- [x] Set ThemeProvider to dark mode
- [x] Install canvas-confetti for celebratory animations

## Phase 2: Database Schema & Backend
- [x] Add game_sessions table (student_id, score, xp, time_spent, correct_count, completed_at)
- [x] Add planet_attempts table (session_id, planet_name, correct, attempt_number, timestamp)
- [x] Generate and apply migration SQL
- [x] Add server procedures: createSession, recordAttempt, completeSession, getLeaderboard

## Phase 3: Core Game Engine — Drag-and-Drop Solar System Lab
- [x] Define 8 planet data objects with name, order, clues array, color, size, emoji/icon
- [x] Build SpaceLab page with orbital ring layout (Sun center + 8 orbit slots)
- [x] Implement drag-and-drop: planet cards draggable, orbit slots as drop targets
- [x] Show one clue card at a time per planet (never multiple clues simultaneously)
- [x] Clue cards: large bold text, illustrated visual, "Next Clue" button
- [x] Highlight correct orbit slot on successful drop
- [x] Show wrong-answer shake animation on incorrect drop
- [x] Planet tray: horizontal scrollable list of remaining planets to place

## Phase 4: Dopamine Feedback Loop & Brain Break
- [x] Confetti burst animation on every correct planet placement
- [x] Star burst / glow ring pulse effect on correct drop
- [x] XP award: +100 XP per correct placement, animated XP counter
- [x] Star reward: +1 star per correct placement, animated star pop
- [x] Cumulative score display with animated number increment
- [x] Rapidly-filling progress bar (fills per correct answer, 8 steps total)
- [x] Level-up animation at 4 correct answers (halfway milestone)
- [x] Brain break screen: appears after every 3 correct answers, 30-second countdown
- [x] Brain break: animated breathing circle (inhale/exhale) with movement prompt
- [x] Brain break: auto-resumes game after exactly 30 seconds (or manual skip after 30s)

## Phase 5: Session Completion & Play Again
- [x] Session completion screen with personalized trophy animation
- [x] Display total stars earned and final XP score
- [x] "Play Again" button (exact label) to restart the quest
- [x] Save completed session to database
- [x] Animated stars/fireworks on completion screen

## Phase 6: Polish, Tests & Deployment
- [x] Vitest: test game logic (correct/incorrect placement, XP calculation, brain break trigger)
- [x] Vitest: test server procedures (createSession, recordAttempt, completeSession)
- [x] Responsive design: works on tablet and mobile
- [x] "Play Again" button label fixed to exact spec
- [x] Star burst fires from correct orbit slot position
- [x] Mobile tap-to-select-then-tap-orbit mechanic implemented
- [x] isHighlighted orbit slot state for mobile UX
- [x] Final screenshot review and visual QA
- [x] Save checkpoint and deliver

# Hendux Campus Beacon

Build an interactive UI/UX prototype for Hendux, a university-specific academic intelligence platform designed around the KNOW > FIND > PREPARE framework.

Context anchor:
- University: University of Lagos (UNILAG)
- Faculty: Faculty of Science
- Department: Computer Science
- Level: 300 Level
- Semester: 1st Semester
- Include an interactive Context Switcher pill at the top allowing the student to view other levels or departments.

The Dashboard & Screens:
1. Top Bar & Greeting:
   - Greets student (e.g. "Good morning, Prosper 👋") with university, faculty, department, and level badge.
   - Context anchor pill showing UNILAG • Science • Comp Sci • 300L • 1st Sem with quick-switch modal.

2. Dynamic Timetable (Right under greeting):
   - Today's classes in order with start/end time, course code, lecturer, and venue.
   - Highlights the current or next upcoming class.
   - Filter/toggle for [Today] [Tomorrow] [Full Week].
   - Live update tags linked to campus updates (e.g. ⚠️ "Moved to Lab 2" or "Cancelled by Lecturer").
   - Toggle for "Exam Mode" where it switches to show upcoming exam schedules, hall allocations, and seat ranges with a direct "Revise Past Questions" button.
   - Calm "No classes today" state if toggled to a weekend.

3. "Today" Urgency Strip:
   - Compact urgency banner for nearest deadline (e.g., Lab report submission due tonight) or urgent administrative notices.

4. Campus Updates (KNOW layer):
   - Tabbed/segmented filter: All, Academic, Faculty/Dept, Events.
   - Post cards showing distinct credibility tier badges:
     * 🟢 Official Notice (Senate, Registry, Dean)
     * 🔵 Hendux-Verified (Confirmed by Hendux team)
     * ⚪ Rep / Student-Submitted (Course rep notice)
   - Event cards with visual event banners, date, and venue.
   - Interactive actions on cards: "Add to Calendar", "Share to WhatsApp", "Ask AI".

5. Resource Hub (FIND layer):
   - Course tiles for enrolled courses (e.g. CSC 301 Operating Systems, CSC 305 Database Systems, MTH 311 Numerical Analysis).
   - "Continue where you left off" card.
   - Inside each course view:
     * Past Questions (sorted by year with solutions toggle)
     * Hendux Verified Notes & Formula sheets (with Pro gold badge)
     * Student Community Notes (with upvotes and star ratings)
     * Quick in-app document viewer modal/preview.

6. Exam Prep (PREPARE layer):
   - Countdown to next exam.
   - Topic mastery and weak areas tracker.
   - Interactive Practice Quiz (quick 3-question interactive sample) and Timed Mock Exam preview.

7. Hendux AI Assistant:
   - Always-accessible floating icon or docked bar on screens with suggested quick prompts: "What's my next class?", "Which events are for me?", "Explain virtual memory".
   - Full interactive chat dialog covering Campus Assistant, Resource Assistant, and Study Assistant with sample answers and credibility citations.

8. Bottom Navigation:
   - Home, Updates, Resources, Prepare, Profile tabs allowing full navigation between screens.
   - Clean, modern academic design system (Deep Navy #0F172A, Electric Indigo #4F46E5 accents, Emerald Green for Official badges, Gold #F59E0B for Pro content) optimized for mobile view and desktop.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f723661a-e31f-4d88-9a8f-ed6cfa558bb6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

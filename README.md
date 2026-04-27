
# AI-Powered NFL Mock Draft Simulator

A single-page, turn-based NFL mock draft simulator where a user acts as the General Manager for their selected team, while an LLM autonomously controls the draft decisions for the remaining rival teams.



##  Architecture & Engineering Decisions

This project was built with a focus on seamless state management, AI prompt optimization, and UI/UX resilience.

* **State Management (Zustand):** The draft acts as a turn-based game. Zustand serves as the centralized "referee" (source of truth), tracking the current round, pick index, available prospects, and draft history. The UI simply reacts to this state to lock/unlock controls and trigger AI turns.
* **AI Orchestration (Groq Llama 3.1):** AI decisions are handled entirely server-side via Next.js Route Handlers to keep API keys secure. To ensure near-instantaneous responses and minimize token usage, the prompt is optimized to only send the **top 10 available prospects** along with the specific positional needs of the AI team currently on the clock.
* **Bulletproof Fallback Logic:** LLMs can be unpredictable (rate limits, timeouts, or hallucinating data types). The API route is wrapped in a strict `try/catch` block. If the LLM fails to return a valid JSON player ID, the backend automatically intercepts the error and auto-selects the highest-ranked prospect that matches the team's positional needs. **The app will never freeze or crash due to an AI failure.**
* **React Strict Mode Mitigation:** Implemented cleanup functions and `isCurrentTurn` flags within the `useEffect` hook to prevent double-firing API calls during local development re-renders.

##  Tech Stack

* **Framework:** Next.js (App Router)
* **State Management:** Zustand
* **Styling:** Tailwind CSS & Lucide Icons
* **AI Provider:** Groq (Model: `llama-3.1-8b-instant`)

##  Getting Started

Follow these instructions to run the simulator locally.

### 1. Clone & Install
```bash
git clone <your-repo-link>
cd nfl-mock-draft
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Groq API key:
```env
GROQ_API_KEY="gsk_your_api_key_here"
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.


## Link for the loom Video
*https://www.loom.com/share/c9c6101c1b0e443b96e2b1d7379d2bb2


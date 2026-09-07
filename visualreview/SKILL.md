---
name: visualreview
description: >-
  In-app visual feedback, element annotation, and UI review loop for web apps, drafts, and prototypes. Use whenever scaffolding new web applications, injecting the visual review widget into existing projects, or reading and applying changes from feedback.md.
---

# Visual Review & In-App Feedback Skill

This skill provides a Figma-like interactive, in-browser visual feedback loop for any web application or site draft. It allows users to click or right-click any element on their live screen (text, button, image, card), drop revision comments directly in context, and have Antigravity automatically locate the source code and apply the requested edits.

## Resources & Assets
* **Widget script**: [`resources/agent-feedback.js`](./resources/agent-feedback.js)
* **Feedback log format**: `feedback.md` in the project root.

---

## 1. Default Behavior for New Web Projects
Whenever scaffolding or creating a new web app, website, or UI draft (whether plain HTML/JS, React, Vite, Next.js, Vue, Svelte, or Python Flask/Django templates):
1. **Copy the widget:** Copy [`resources/agent-feedback.js`](./resources/agent-feedback.js) into the project's static/public directory (e.g., `public/agent-feedback.js` or project root).
2. **Inject the script tag:** Include `<script src="/agent-feedback.js"></script>` in `index.html` or the root layout template.
3. **Initialize `feedback.md`:** Create an initial `feedback.md` file in the project root:
   ```markdown
   # Visual Feedback Log

   ## Pending Changes
   <!-- Use the in-app [✏️ Review] widget in the bottom-right corner to drop pins and save changes here -->

   ## Resolved
   ```

---

## 2. Adding to Existing Projects
When the user asks:
- *"Add visual review widget to this project"*
- *"Enable review mode"*
- *"Set up visual feedback"*

**Actions:**
1. Locate the entry HTML or root layout file (e.g., `index.html`, `src/App.tsx`, `app/layout.tsx`, or server template).
2. Copy [`resources/agent-feedback.js`](./resources/agent-feedback.js) into the project assets.
3. Inject the `<script src="/agent-feedback.js"></script>` tag before `</body>`.
4. Create `feedback.md` if it doesn't already exist.
5. (Optional) If the project runs a custom dev server (Node, Express, Vite plugin), wire up `GET/POST /api/feedback` to sync `feedback.md` directly.

---

## 3. How the User Reviews the Live App
1. In the browser, the user sees a floating pill in the bottom-right corner: **`[✏️ Review]`**.
2. **Inspect & Drop Pins:**
   - Toggle Review Mode (or hold **`Alt` + Click** anywhere).
   - Hovering highlights any element with an outline and tag label.
   - Clicking opens a comment box showing the CSS selector, current text/image attributes, and a note input.
   - Type the requested change and click **"Save Pin"**.
3. **Export & Dispatch:**
   - Click **"📋 Copy for Agent"**: Copies structured Markdown prompt to clipboard AND silently updates `feedback.md`. Toast includes an instant **`[✕ Clear Pins]`** button.
   - Click **"💾 Save"**: Writes directly to `feedback.md` via dev server endpoint or file download.

---

## 4. Applying Feedback ("Apply Feedback")
When the user says:
- *"Apply feedback"*
- *"Check feedback.md"*
- *"Resolve visual feedback pins"*
- Or pastes the generated markdown block into the chat:

**Execution Workflow:**
1. **Read `feedback.md`:** Inspect all pending items (`- [ ]`).
2. **Locate Target Source Code:**
   - Match CSS selectors, tag names, text snippets, and image `src` paths.
   - Use `grep_search` to find the exact source files (HTML, JSX, TSX, Vue, CSS).
3. **Implement Edits:** Apply the requested design or content changes.
4. **Update `feedback.md`:** Mark resolved items as `- [x]` under `## Resolved`.
5. **Auto-Clear:** Because `feedback.md` is updated, the widget's background sync will automatically clear the pins and reset the counter badge in the user's browser tab!

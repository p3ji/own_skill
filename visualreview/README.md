# Visual Review Skill for Google Antigravity

A lightweight, zero-dependency in-browser visual feedback loop for web applications, prototypes, and website drafts.

Allows developers and reviewers to click or right-click any element on a live screen, add revision notes to text, buttons, and images, and have Antigravity automatically locate the source files and implement the changes.

## Features

- **Zero Dependencies**: Pure vanilla JavaScript. Works with vanilla HTML, React, Next.js, Vite, Vue, Svelte, Flask, Django, etc.
- **Isolated Shadow DOM**: UI styles will never clash with Tailwind, Bootstrap, CSS resets, or app styles.
- **Persistent Pins**: Feedback pins survive page refreshes and hot module reload (HMR) via `localStorage`.
- **Intelligent Context Capture**:
  - CSS Selector paths (e.g. `header > nav > a.active`)
  - Element tag names and attributes
  - Current text snippet preview
  - Image `src` and `alt` attributes
- **Two-Way Status Synchronization**:
  - Clicking **"Copy for Agent"** copies a structured prompt to your clipboard and syncs `feedback.md`.
  - When Antigravity resolves the feedback and marks it completed in `feedback.md`, the browser automatically detects it and clears the pins and badge!
  - Includes an instant **`[✕ Clear Pins]`** button in the toast notification.

## Quick Installation

### 1. As a Global Antigravity Skill (Recommended)
Clone or copy this folder into your machine's global Antigravity skills directory:

```bash
# Windows
git clone https://github.com/p3ji/own_skill.git %USERPROFILE%\.gemini\config\skills\p3ji_skills
# Or copy the visualreview folder directly:
Copy-Item -Recurse visualreview $env:USERPROFILE\.gemini\config\skills\visualreview

# macOS / Linux
cp -r visualreview ~/.gemini/config/skills/visualreview
```

Once installed globally, Antigravity will automatically know how to:
- Inject the review widget into any new or existing project.
- Read and apply feedback whenever you say *"apply feedback"*.

### 2. In an Existing Project (Manual Drop-in)
1. Copy `resources/agent-feedback.js` into your project's `public/` or root directory:
   ```html
   <script src="/agent-feedback.js"></script>
   ```
2. Create an initial `feedback.md` in the project root:
   ```markdown
   # Visual Feedback Log

   ## Pending Changes

   ## Resolved
   ```

## Usage

1. Open your web app in the browser.
2. In the bottom-right corner, click **`[✏️ Review]`** (or hold **`Alt` + Click** any element).
3. Hover over elements to see highlight outlines; click to drop a numbered pin.
4. Type your feedback (e.g. *"Change button color to deep indigo and make corners rounded"*).
5. Click **"📋 Copy for Agent"** (or **"💾 Save"**).
6. In Antigravity chat, paste the prompt or simply say:
   > *"Apply feedback"*
7. Antigravity will edit the files and mark the items as resolved. When you switch back to your browser, the pins will automatically disappear!

## License
MIT

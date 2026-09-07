# visualreview

`visualreview` is a zero-dependency in-browser inspection widget that captures DOM selectors and revision notes to accelerate UI prototyping loops with any AI coding agent (Antigravity, Cursor, Claude Code, Windsurf, Copilot, Aider, or ChatGPT).

---

## The Problem: Prototyping Loops Break at the Visual Layer

When you prototype web apps with AI coding agents, the fastest way to verify changes is in the browser. But communicating what needs to change back to the agent is slow and imprecise:
1. **Writing descriptive text prompts:** *"In the third card, make the subtitle bolder and increase the button margin."* The agent guesses which CSS rule or component template produced that element, often editing the wrong file.
2. **Taking screenshots:** Burning thousands of vision tokens per prompt while giving the model zero metadata about component hierarchy, CSS class names, or source file locations.

`visualreview` closes the feedback loop. You click elements on your live screen to drop pins, and the tool exports structured DOM paths, current text snippets, and revision instructions directly to your agent.

```
[Live App Draft] ──(Alt + Click)──> [DOM Annotation Pin] ──(Copy / Save)──> [Any AI Agent] ──(Grep)──> [Code Edit]
```

### The Prototyping Scenario
Imagine you are testing an initial draft of a new dashboard. You notice three immediate issues:
- The navigation logo is stretched.
- The primary call-to-action button should be deep indigo.
- The header title has a spelling error.

Instead of writing descriptive paragraphs or cropping three screenshots:
1. Hold `Alt` and click each element.
2. Type your revision note directly on the element.
3. Click **"Copy for Agent"** (or **"Save"**).

The agent receives exact DOM selectors (`header > div.logo > img`, `button.cta-primary`), text previews, and instructions. It matches them against the codebase in milliseconds, applies the edits, and the pins clear from your screen.

---

## Works with Any Agent or Workflow

`visualreview` produces standard Markdown. It is not locked to any single tool:

- **Chat-Based Agents (Cursor, ChatGPT, Claude, Copilot):**  
  Click **"📋 Copy for Agent"** to copy formatted Markdown to your clipboard. Paste it directly into your chat dialogue box.
- **Autonomous CLI Agents (Antigravity, Claude Code, Aider):**  
  Click **"💾 Save"** (or use the auto-sync background POST). The widget writes to `feedback.md` in the project root. Prompt your CLI agent with *"apply feedback"*, and it reads and resolves the file directly.

---

## Architecture & Mechanics

The widget operates across four distinct phases:

1. **Client-Side DOM Capture (Zero Dependencies):**  
   [`agent-feedback.js`](./resources/agent-feedback.js) mounts inside an isolated Shadow DOM. Your app's styles (Tailwind, Bootstrap, CSS resets) never distort the widget, and widget styles never bleed into your app. Clicking an element computes a readable CSS path, extracts text or `src` attributes, and saves pins to browser `localStorage`.

2. **Dual-Channel Dispatch:**  
   Clicking **"Copy for Agent"** copies a structured prompt to your clipboard and issues a background `POST /api/feedback` to your local dev server (if one exists). If running offline, an interactive toast button lets you wipe active pins with one click.

3. **Grep-Driven Resolution:**  
   Because the payload contains concrete CSS selectors and text snippets, agents can use ripgrep to locate the exact source file and line number in under 200 milliseconds.

4. **Heartbeat Auto-Clear:**  
   When running with a local server, the widget polls `GET /api/feedback` on tab focus and every 3 seconds. Once the agent marks the tasks as completed (`- [x]`), the widget clears `localStorage` and resets the counter badge to zero.

---

## Why Not Just Paste Screenshots?

> **You might wonder: why not feed visual screenshots to multi-modal models?**

Screenshots look convenient, but they introduce two serious engineering penalties during rapid prototyping:

- **Token Economics:** A single screenshot burns 1,200 to 2,000+ vision tokens. A structured DOM pin payload costs roughly 150 prompt tokens.
- **Grounding Latency:** Vision models must visually parse layouts, guess CSS classes, and infer file names. A DOM selector (`nav.view-tabs > a.active`) allows an agent to pinpoint the target component instantly without guesswork.

| Dimension | Screenshot + Vision LLM | visualreview DOM Payload |
| :--- | :--- | :--- |
| **Token Consumption** | ~1,600 tokens / image | ~150 tokens / element |
| **File Resolution** | Guesswork based on visual layout | Exact ripgrep match via selector/text |
| **Agent Support** | Requires vision-capable model | Works on all LLMs (text or multimodal) |
| **HMR Persistence** | Lost on refresh | Persisted in `localStorage` |
| **Loop Closure** | Manual visual re-check | Auto-clears pins upon file edit |

---

## Setup & Integration

### 1. In Any Web Project (Drop-in Script)
Drop [`agent-feedback.js`](./resources/agent-feedback.js) into your public or static assets folder and reference it before `</body>`:

```html
<script src="/agent-feedback.js"></script>
```

Add an empty `feedback.md` in your project root:
```markdown
# Visual Feedback Log

## Pending Changes

## Resolved
```

### 2. In Google Antigravity (Automated Skill)
To install as a permanent Antigravity skill across all workspaces:

```powershell
# Windows
git clone https://github.com/p3ji/own_skill.git $env:USERPROFILE\.gemini\config\skills\p3ji_skills
```

```bash
# macOS / Linux
git clone https://github.com/p3ji/own_skill.git ~/.gemini/config/skills/p3ji_skills
```

### 3. In Cursor / Claude Code / Copilot
Add this short rule to your `.cursorrules`, `CLAUDE.md`, or project instructions:
> *"When the user says 'apply feedback', read `feedback.md` (or the pasted visual review markdown). Match the CSS selectors and text snippets to source files, implement the changes, and mark items as resolved."*

---

## When to Use and When NOT to Use

#### When to Use
- **UI Prototyping:** Rapidly iterating on layouts, colors, typography, button states, and spacing with any AI assistant.
- **Visual Bug Bashes:** Dropping 5–10 revision pins in a single pass across a prototype before asking the agent to batch-fix them.
- **Multi-Page App Reviews:** Auditing complex frontend flows without manually typing out component names or taking screenshots.

#### When NOT to Use
- **Headless & Backend Services:** CLI utilities, database schemas, or APIs with no browser rendering.
- **HTML5 Canvas / WebGL:** Canvas games or 3D viewports where internal graphic objects do not exist as DOM nodes.

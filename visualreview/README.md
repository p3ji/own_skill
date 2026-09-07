# visualreview

`visualreview` is an in-browser inspection widget that captures DOM selectors and user comments to automate UI revision loops with LLM coding agents.

---

## The Problem: Visual Feedback is Slow and Ambiguous

Iterating on a web UI with an AI coding assistant usually hits a painful friction point. Developers either:
1. **Write long, fuzzy text prompts:** *"In the third card down, make the subtitle a bit bolder and fix the button margin."* The agent often edits the wrong component.
2. **Take and crop screenshots:** Burning thousands of vision tokens while forcing the model to guess which CSS file or component template produced the rendered pixels.

`visualreview` replaces this guesswork with exact DOM paths, existing text previews, and attribute snapshots.

```
[Browser Preview] ──(Alt + Click)──> [Structured DOM Pin] ──(Copy/Save)──> [feedback.md] ──(Agent Grep)──> [Code Edit]
```

### The Scenario
Imagine you preview a new dashboard. You spot three issues:
- The header logo is stretched.
- The checkout button should be emerald green.
- The welcome banner has a typo.

Instead of writing three descriptive paragraphs, you hold `Alt` and click each element. You type your note directly on the element. You click **"Copy for Agent"**. 

The agent receives exact selectors (`header > div.logo > img`, `button#checkout`). It greps the source code in milliseconds, applies the edits, and marks the items resolved. When you switch back to your browser, the pins are already gone.

---

## Architecture & Mechanics

The tool operates across four distinct phases:

1. **Client-Side Capture (Zero Dependencies):**  
   [`agent-feedback.js`](./resources/agent-feedback.js) mounts inside an isolated Shadow DOM. Host styles (Tailwind resets, Bootstrap, global CSS) never distort the widget, and widget styles never bleed into your app. Clicking an element computes a deterministic CSS path, extracts text or `src` attributes, and stores the pin in browser `localStorage`.

2. **Dual-Channel Dispatch:**  
   Clicking **"Copy for Agent"** formats a clean Markdown payload to your clipboard and immediately issues a background `POST /api/feedback` to your local dev server. If you run offline without a server, an immediate toast button lets you wipe the screen with one click.

3. **Grep-Driven Resolution:**  
   You tell Antigravity *"Apply feedback"*. Rather than guessing, the agent greps your repo for the exact selector, tag, or text snippet. It edits the source code and flips the checkbox in `feedback.md` from `- [ ]` to `- [x]`.

4. **Heartbeat Auto-Clear:**  
   The widget polls `GET /api/feedback` when the browser tab gains focus and on a 3-second heartbeat. Once all items are marked resolved, the client flushes `localStorage`, removes the pins, and resets the badge counter to zero.

---

## Why Not Just Paste Screenshots?

> **You might wonder: why not feed visual screenshots to multi-modal models?**

Screenshots look convenient, but they introduce two serious engineering penalties:

- **Token Cost:** A single screenshot consumes 1,200 to 2,000+ vision tokens. A structured DOM pin payload costs roughly 150 prompt tokens.
- **Grounding Latency:** Vision models must visually parse layouts, guess CSS classes, and infer file names. A DOM selector (`nav.view-tabs > a.active`) allows an agent to use ripgrep to find the exact line of code in under 200 milliseconds.

| Dimension | Screenshot + Vision LLM | visualreview DOM Payload |
| :--- | :--- | :--- |
| **Token Consumption** | ~1,600 tokens / image | ~150 tokens / element |
| **File Resolution** | Guesswork based on visual layout | Exact ripgrep match via selector/text |
| **HMR Persistence** | Lost on refresh | Persisted in `localStorage` |
| **Loop Closure** | Manual visual re-check | Auto-clears pins upon file edit |

---

## Installation

### Option 1: Global Antigravity Skill (Recommended)
Install once to make the skill available across all your projects:

```powershell
# Windows (PowerShell)
git clone https://github.com/p3ji/own_skill.git $env:USERPROFILE\.gemini\config\skills\p3ji_skills
```

```bash
# macOS / Linux
git clone https://github.com/p3ji/own_skill.git ~/.gemini/config/skills/p3ji_skills
```

Once installed, tell Antigravity:
> *"Add visual review widget to this project"*

Antigravity copies the asset and wires the script tag into your project automatically.

### Option 2: Standalone Manual Drop-In
If you do not use Antigravity globally, drop the script into any HTML page or template:

```html
<!-- Add before </body> -->
<script src="/agent-feedback.js"></script>
```

And initialize an empty `feedback.md` in your project root:
```markdown
# Visual Feedback Log

## Pending Changes

## Resolved
```

---

## When to Use and When NOT to Use

#### When to Use
- **Draft & Prototype Iteration:** Rapidly tweaking layouts, text, button states, and CSS spacing with an AI agent.
- **Component Review:** Pinpointing specific elements across multi-page web apps or component libraries.
- **Batch Feedback:** Dropping 5–10 revision pins in one review pass before letting the agent batch-process them.

#### When NOT to Use
- **Backend Services:** CLI tools, data pipelines, or headless APIs with no browser surface.
- **HTML5 Canvas / WebGL:** Games or complex canvas graphics where internal visual objects do not exist as distinct DOM nodes.

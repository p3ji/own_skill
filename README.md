# own_skill

A collection of operational skills for [Google Antigravity](https://antigravity.google) AI coding agents.

Skills in this repository teach Antigravity specific workflows, inspectable runbooks, and client-side tooling. Install them globally to make them available across all projects on your machine, or drop them into an individual repository's `.agents/skills/` directory.

---

## Catalog

| Skill | Purpose | Path |
| :--- | :--- | :--- |
| [**`visualreview`**](./visualreview/) | In-browser visual inspection widget. Click live elements to drop revision notes, export deterministic DOM paths to the agent, and auto-clear pins when edits land. | [`visualreview/`](./visualreview/) |

---

## Installation

### 1. Global Setup (All Projects)

Clone the repository into your machine's global Antigravity skills path. The agent automatically discovers all subdirectories:

**Windows (PowerShell):**
```powershell
git clone https://github.com/p3ji/own_skill.git $env:USERPROFILE\.gemini\config\skills\p3ji_skills
```

**macOS / Linux:**
```bash
git clone https://github.com/p3ji/own_skill.git ~/.gemini/config/skills/p3ji_skills
```

### 2. Workspace Setup (Single Project)

To bind a skill to a single codebase without global installation, copy the skill directory into your project's `.agents/skills/` folder:

```bash
mkdir -p .agents/skills/visualreview
cp -r path/to/own_skill/visualreview/* .agents/skills/visualreview/
```

Antigravity discovers workspace skills hierarchically by walking up from the current directory to the repository root.

---

## Skill Architecture

Every skill follows the Antigravity specification:

```text
skills/<skill_name>/
├── SKILL.md          # Machine-readable instructions + frontmatter trigger
├── README.md         # Practitioner documentation
└── resources/        # Scripts, binaries, and client assets
```

`SKILL.md` defines *when* the agent activates and *how* it executes commands. The agent progressively loads skill instructions into context only when triggered, preventing prompt token bloat.

## Author

[@p3ji](https://github.com/p3ji)

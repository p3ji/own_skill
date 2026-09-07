# own_skill

A repository of developer skills, tools, and runbooks designed to accelerate prototyping and development with AI coding agents.

While configured to mount natively into [Google Antigravity](https://antigravity.google), the tools and specifications here are agent-agnostic: they work seamlessly with **Cursor, Claude Code, Windsurf, GitHub Copilot, Aider**, or custom LLM pipelines.

---

## Catalog

| Skill | Purpose | Agent Compatibility | Path |
| :--- | :--- | :--- | :--- |
| [**`visualreview`**](./visualreview/) | In-browser visual inspection widget. Click live elements to drop revision notes, export deterministic DOM paths, and accelerate UI feedback loops. | Universal (Antigravity, Cursor, Claude Code, Copilot, ChatGPT) | [`visualreview/`](./visualreview/) |

---

## Installation & Setup

### 1. In Google Antigravity (Global Skill)
Clone directly into your Antigravity global skills directory:

**Windows (PowerShell):**
```powershell
git clone https://github.com/p3ji/own_skill.git $env:USERPROFILE\.gemini\config\skills\p3ji_skills
```

**macOS / Linux:**
```bash
git clone https://github.com/p3ji/own_skill.git ~/.gemini/config/skills/p3ji_skills
```

### 2. In Cursor / Claude Code / Windsurf / Any Project
Drop the desired tool directly into your codebase:
1. Copy the client script (e.g. `visualreview/resources/agent-feedback.js`) into your project.
2. Follow the setup steps in each skill's [`README.md`](./visualreview/README.md).

---

## Contributing

Skills follow a standard three-part structure:
```text
skills/<skill_name>/
├── SKILL.md          # Machine-readable instructions + frontmatter trigger
├── README.md         # Practitioner documentation (Chip Style)
└── resources/        # Scripts, binaries, and client assets
```

## Author

[@p3ji](https://github.com/p3ji)

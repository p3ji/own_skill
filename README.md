# own_skill

> Personal and curated skills repository for [Google Antigravity](https://antigravity.google) AI coding assistant.

This repository contains reusable skills that can be installed globally or per-workspace to extend Antigravity's capabilities across any project.

## Available Skills

| Skill | Description | Path |
| :--- | :--- | :--- |
| [**`visualreview`**](./visualreview/) | In-app visual review & feedback loop. Click any element on screen to drop revision notes, export structured feedback, and have Antigravity automatically update the code and clear resolved pins. | [`visualreview/`](./visualreview/) |

---

## How to Install Skills

### Option A: Install Globally (All Projects)

To make a skill available across every project on your machine, clone or copy the skill folder into your Antigravity global skills directory:

**Windows (PowerShell):**
```powershell
# Clone entire repo into global skills
git clone https://github.com/p3ji/own_skill.git $env:USERPROFILE\.gemini\config\skills\p3ji_skills

# Or install just the visualreview skill:
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.gemini\config\skills\visualreview | Out-Null
Copy-Item -Recurse visualreview\* $env:USERPROFILE\.gemini\config\skills\visualreview\
```

**macOS / Linux:**
```bash
# Clone entire repo into global skills
git clone https://github.com/p3ji/own_skill.git ~/.gemini/config/skills/p3ji_skills

# Or install just the visualreview skill:
mkdir -p ~/.gemini/config/skills/visualreview
cp -r visualreview/* ~/.gemini/config/skills/visualreview/
```

### Option B: Install in a Specific Workspace

If you want a skill active only in a specific project repository, copy the skill folder into `.agents/skills/`:

```bash
mkdir -p .agents/skills/visualreview
cp -r path/to/own_skill/visualreview/* .agents/skills/visualreview/
```

Antigravity will automatically discover and load the skill when you open that repository.

---

## Contributing & Adding Skills

Skills follow the standard Antigravity skill layout:
```text
skills/<skill_name>/
├── SKILL.md          # Main instruction file with YAML frontmatter (name, description)
├── README.md         # Documentation for humans
├── resources/        # Optional: Scripts, templates, and assets
├── scripts/          # Optional: Executable CLI utilities
└── references/       # Optional: In-depth technical references
```

## Author

Created by [@p3ji](https://github.com/p3ji).

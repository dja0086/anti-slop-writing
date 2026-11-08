# anti-slop-writing

A Claude Code skill for writing product marketing, launch scripts and fiction without AI-slop tells, plus `scan.mjs`, a dependency-free scanner that checks the result.

The scanner flags dash punctuation, emoji, arrow glyphs, hype vocabulary (`unlock`, `seamless`, `leverage`), hedges, assistant openers, unbacked superlatives, generic CTAs and stock fiction phrases. BAN findings fail the scan; WARN findings need a decision. Each rule's source is listed in [references/rules.md](references/rules.md).

## Install

Clone into your personal skills folder so Claude Code loads it in every project:

```bash
git clone https://github.com/dja0086/anti-slop-writing ~/.claude/skills/anti-slop-writing
```

Claude Code then offers `/anti-slop-writing` and loads the skill when you ask it to write, rewrite or review copy. To use it in one project only, clone it into that project's `.claude/skills/` instead.

## Scan from the command line

Node 20 or later, no install step:

```bash
node ~/.claude/skills/anti-slop-writing/scan.mjs draft.md --mode marketing
```

| Option             | Effect                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| `--mode marketing` | Default. Hype, CTAs, superlatives, arrows, middle-dot labels                    |
| `--mode creative`  | Stock fiction phrases, default character names, moral endings                   |
| `--mode docs`      | Reader-facing docs: `the user`, effort words, vague quantities; emoji only WARN |
| `--json`           | Machine-readable findings                                                       |
| `--strict`         | Exit 1 on WARN as well as BAN                                                   |
| `-`                | Read from stdin                                                                 |

It scans `.md`, `.mdx`, `.txt` and `.html` files, and the string values of `.json` files. Code fences, inline code, shell commands and licence files are skipped, and curly quotes are normalized before matching. The last line is always `<mode>: N BAN, M WARN`. Exit codes: 0 clean, 1 a BAN remains, 2 usage error or missing file.

## Test

```bash
npm test
```

## Files

| Path                  | Purpose                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `SKILL.md`            | The procedure Claude follows: pick a mode, collect facts, draft, scan, run the human checks, report |
| `scan.mjs`            | The scanner                                                                                         |
| `references/rules.md` | Every rule with its source                                                                          |
| `references/voice.md` | The plain engineering voice to match                                                                |
| `test/scan.test.mjs`  | Scanner tests                                                                                       |

## License

MIT. See [LICENSE](LICENSE). The banned-phrase lists in `references/rules.md` credit their sources, which keep their own licences.

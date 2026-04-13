# pi-extension-raptor-mini

[![npm version](https://img.shields.io/npm/v/pi-extension-raptor-mini.svg)](https://www.npmjs.com/package/pi-extension-raptor-mini)
[![npm downloads](https://img.shields.io/npm/dm/pi-extension-raptor-mini.svg)](https://www.npmjs.com/package/pi-extension-raptor-mini)
[![license](https://img.shields.io/npm/l/pi-extension-raptor-mini.svg)](./LICENSE)

Adds GitHub Copilot's **Raptor mini** model (`oswe-vscode-prime`) to [pi](https://github.com/badlogic/pi-mono).

## Why

pi's model catalog is baked in at build time. Raptor mini went to public preview on 2025-11-10, after the catalog was last regenerated, so `pi --list-models` doesn't show it. This extension adds it at runtime.

When pi-ai picks it up upstream, this extension becomes a no-op (it detects the duplicate, warns, and exits).

## Install

```bash
pi install npm:pi-extension-raptor-mini
```

> The `npm:` prefix is required. `pi install pi-extension-raptor-mini` is interpreted as a local filesystem path, not an npm package.

Alternatives:

```bash
pi install git:github.com/WSeubring/pi-extension-raptor-mini   # from git
pi -e /path/to/pi-extension-raptor-mini                        # local checkout, no install
```

## Use

```bash
pi --list-models | grep oswe
# github-copilot  oswe-vscode-prime  264K  64K  no  no

pi --provider github-copilot --model oswe-vscode-prime -p "hello"
# or match by name substring:
pi --model raptor -p "hello"
```

You need to be logged into Copilot in pi (`/login github-copilot` inside the interactive UI, or pi prompts on first use). Any Copilot plan works — Free, Pro, Pro+, Business, Enterprise.

## Model facts

| Field | Value | Source |
|---|---|---|
| Canonical id | `oswe-vscode-prime` | [zed#49514](https://github.com/zed-industries/zed/issues/49514) |
| Name | Raptor mini (Preview) | [GitHub Changelog 2025-11-10](https://github.blog/changelog/2025-11-10-raptor-mini-is-rolling-out-in-public-preview-for-github-copilot/) |
| Base | Code-tuned GPT-5-mini | GitHub Changelog |
| Context | ~264,000 tokens | [lobehub model-bank](https://github.com/lobehub/lobehub/blob/main/packages/model-bank/src/aiModels/githubCopilot.ts) (GitHub does not publish officially) |
| Max output | ~64,000 tokens | Community estimate — no authoritative source |
| Tool calls | Supported | GitHub Changelog |

## Heads-up

pi's `github-copilot` provider talks to Copilot's API with VS Code's own integration headers (`Copilot-Integration-Id: vscode-chat`, etc.). That's how Copilot models — including Raptor mini — are reachable at all. This behavior predates this extension and applies to every request pi's Copilot provider already makes; installing this extension doesn't change the request shape, just adds one model id to the catalog.

GitHub's [AUP](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) prohibits misrepresenting client identity; in practice, enforcement has targeted automation/volume abuse rather than client-identity alone. If you want zero ambiguity, use pi's `anthropic` / `openai` / `google` providers with your own API keys instead.

## License

[MIT](./LICENSE)

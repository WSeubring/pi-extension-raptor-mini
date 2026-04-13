# pi-extension-raptor-mini

Adds GitHub Copilot's **Raptor Mini** model (canonical id `oswe-vscode-prime`) to [pi](https://github.com/badlogic/pi-mono)'s `github-copilot` provider.

## Why this exists

pi ships a static catalog of GitHub Copilot models generated at build time (in `@mariozechner/pi-ai/dist/models.generated.js`). It does not fetch the live `/models` list from Copilot at runtime. GitHub released Raptor Mini to public preview on **2025-11-10**, after that catalog was last regenerated, so the model is otherwise invisible to `pi --list-models` and cannot be selected from the Ctrl+P picker.

This extension re-registers the `github-copilot` provider with every existing model **plus** `oswe-vscode-prime`. Headers, `baseUrl`, and OpenAI-compat flags are inherited from an existing reference model (`grok-code-fast-1`) at runtime, so when pi-ai bumps its vendored `User-Agent` / `Editor-Version` strings, this extension automatically follows without needing a release.

## Install

```bash
# Persistent (global)
pi install pi-extension-raptor-mini

# Or directly from git
pi install git:github.com/WSeubring/pi-extension-raptor-mini

# Or try without installing
pi -e /path/to/pi-extension-raptor-mini
```

## Use

```bash
# Verify the model is visible
pi --list-models | grep oswe
# → github-copilot  oswe-vscode-prime  264K  64K  no  no

# Send a request
pi --provider github-copilot --model oswe-vscode-prime -p "hello"
```

You must be logged into GitHub Copilot through pi first (`/login github-copilot` inside the interactive UI, or pi will prompt on first use). A Copilot Free, Pro, Pro+, Business, or Enterprise subscription on the underlying GitHub account is required.

## Model characteristics

| Field | Value | Source |
|---|---|---|
| Canonical id | `oswe-vscode-prime` | [zed#49514](https://github.com/zed-industries/zed/issues/49514) |
| Marketing name | Raptor Mini (Preview) | [GitHub Changelog 2025-11-10](https://github.blog/changelog/2025-11-10-raptor-mini-is-rolling-out-in-public-preview-for-github-copilot/) |
| Base model | Code-tuned GPT-5-mini variant | GitHub Changelog |
| API shape | OpenAI chat/completions | Same transport as other Copilot gpt-* models |
| Context window | ~264,000 tokens | GitHub Changelog |
| Max output | ~64,000 tokens | GitHub Changelog |
| Tool calls | Supported | GitHub Changelog |
| Tier availability | Free, Pro, Pro+ (VSCode-first rollout) | GitHub Changelog |

## How it works (implementation note)

pi's extension API exposes `pi.registerProvider(name, config)`. Calling this with an existing provider name **replaces all of that provider's models** (see `model-registry.js` in pi-coding-agent). To avoid losing the other Copilot models, this extension calls `getModels("github-copilot")` from `@mariozechner/pi-ai`, spreads that list, and appends the new raptor entry.

If pi-ai upstream adds `oswe-vscode-prime` to its static catalog, this extension becomes a no-op — it detects the duplicate and returns without re-registering.

## Important caveat about pi's Copilot provider (not specific to this extension)

pi's built-in `github-copilot` provider authenticates the user via GitHub OAuth (device-code flow) and then calls `api.individual.githubcopilot.com` with the following hardcoded headers:

```
User-Agent:             GitHubCopilotChat/0.35.0
Editor-Version:         vscode/1.107.0
Editor-Plugin-Version:  copilot-chat/0.35.0
Copilot-Integration-Id: vscode-chat
```

i.e. pi identifies itself to GitHub's servers as VS Code's Copilot Chat client. This is what makes `oswe-vscode-prime` (and every other model pi accesses via this provider) reachable, because GitHub gates model availability by those exact header values.

This arrangement predates this extension and applies to every request pi's `github-copilot` provider already makes. GitHub's [Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) prohibit "fraudulently misrepresenting your identity," and GitHub has sometimes cited "use of unsupported clients" in Copilot access revocations ([community#174325](https://github.com/orgs/community/discussions/174325)). In practice, no pi user has publicly reported a ban for this reason, and pi-ecosystem tools like `aider`, `opencode` (now officially partnered with GitHub — [changelog](https://github.blog/changelog/2026-01-16-github-copilot-now-supports-opencode/)), and `zed` (also officially partnered — [changelog](https://github.blog/changelog/2026-02-19-github-copilot-support-in-zed-generally-available/)) had similar postures before formal partnerships existed. Enforcement precedent has been dominated by volume-based abuse detection (automation, credential sharing, re-selling) rather than client-identity alone.

**Use of this extension inherits pi's existing posture — it does not change it.** Installing this extension adds exactly one model id to the request body; it does not alter which headers are sent, how OAuth is performed, or where requests go.

If you want zero ToS ambiguity, use pi's `anthropic` / `openai` / `google` providers with your own API keys instead.

This README is informational, not legal advice. The author accepts no liability for your use of GitHub Copilot through pi.

## License

[MIT](./LICENSE)

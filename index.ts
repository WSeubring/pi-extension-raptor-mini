/**
 * pi-extension-raptor-mini
 *
 * Adds GitHub Copilot's "Raptor Mini" (canonical id: oswe-vscode-prime) to
 * pi's github-copilot provider. Raptor Mini entered public preview on
 * 2025-11-10, after pi's static model catalog was generated, so it is
 * otherwise invisible to `pi --list-models`.
 *
 * This extension re-registers the github-copilot provider with all its
 * existing models PLUS oswe-vscode-prime. Headers and baseUrl are inherited
 * from the existing models at runtime, so any upstream header/version bumps
 * in pi-ai automatically carry over without an extension update.
 *
 * See README for the ToS caveat that applies to pi's Copilot provider in
 * general (not specific to this extension).
 */

import { getModels } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const RAPTOR_ID = "oswe-vscode-prime";
const RAPTOR_NAME = "Raptor Mini";
// From GitHub changelog (2025-11-10) and openclaw issue tracker.
const RAPTOR_CONTEXT_WINDOW = 264_000;
const RAPTOR_MAX_TOKENS = 64_000;

export default function (pi: ExtensionAPI) {
	const existing = getModels("github-copilot");

	if (existing.length === 0) {
		// pi-ai's github-copilot catalog is empty — nothing to preserve, bail
		// rather than register a provider config that would block normal use.
		throw new Error(
			"pi-extension-raptor-mini: github-copilot provider has no existing models to inherit from. " +
				"Is pi-ai installed?",
		);
	}

	if (existing.some((m) => m.id === RAPTOR_ID)) {
		// Upstream added raptor-mini to the catalog — extension is obsolete.
		return;
	}

	// Inherit headers and baseUrl from a reference model so version bumps in
	// pi-ai's vendored header set (User-Agent, Editor-Version, etc.) carry
	// over automatically. grok-code-fast-1 is the closest analog: also
	// openai-completions, text-only, same header shape.
	const reference = existing.find((m) => m.id === "grok-code-fast-1") ?? existing[0];

	const raptorMini = {
		id: RAPTOR_ID,
		name: RAPTOR_NAME,
		api: "openai-completions",
		reasoning: false,
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: RAPTOR_CONTEXT_WINDOW,
		maxTokens: RAPTOR_MAX_TOKENS,
		headers: reference.headers,
		compat: reference.compat,
	} as const;

	pi.registerProvider("github-copilot", {
		baseUrl: reference.baseUrl,
		// pi-ai resolves the OAuth token via authStorage before consulting
		// this fallback, so the env var name is only a placeholder to satisfy
		// the registry's "apiKey or oauth" validation.
		apiKey: "GITHUB_COPILOT_TOKEN",
		models: [...existing, raptorMini],
	});
}

/**
 * pi-extension-raptor-mini
 *
 * Adds GitHub Copilot's "Raptor Mini" (canonical id: oswe-vscode-prime) to
 * pi's github-copilot provider by re-registering the existing provider models
 * with one extra model.
 */

import { getModels } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const RAPTOR_ID = "oswe-vscode-prime";
const RAPTOR_NAME = "Raptor mini";
// GitHub does not publish these officially. 264K context is from the lobehub
// model-bank catalog (packages/model-bank/src/aiModels/githubCopilot.ts).
// 64K max output is a community estimate — no authoritative source. If pi-ai
// upstream bakes in different numbers, those take precedence.
const RAPTOR_CONTEXT_WINDOW = 264_000;
const RAPTOR_MAX_TOKENS = 64_000;

export default function (pi: ExtensionAPI) {
	const existing = getModels("github-copilot");

	if (existing.length === 0) {
		// No Copilot models found to inherit from.
		throw new Error(
			"pi-extension-raptor-mini: github-copilot provider has no existing models to inherit from. " +
				"Is pi-ai installed?",
		);
	}

	if (existing.some((m) => m.id === RAPTOR_ID)) {
		// Model already present upstream; nothing to do.
		console.warn(
			`pi-extension-raptor-mini: "${RAPTOR_ID}" is already in pi-ai's github-copilot catalog. ` +
				"This extension is now redundant and can be removed (`pi uninstall pi-extension-raptor-mini`).",
		);
		return;
	}

	// Copy headers/baseUrl from an existing Copilot model so upstream changes
	// continue to work without updating the extension.
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
		// authStorage / oauth are handled by pi-ai; this apiKey is only a
		// registry placeholder.
		apiKey: "GITHUB_COPILOT_TOKEN",
		models: [...existing, raptorMini],
	});
}

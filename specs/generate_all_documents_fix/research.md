# Research Notes – Generate All Documents Fix

## Runtime strategy for heavy API routes
- Next.js Edge runtime intentionally exposes only a small subset of Node.js APIs; packages that depend on native Node modules (filesystem, crypto variations, etc.) or larger bundle sizes may fail outright. The official docs recommend defaulting to the Node.js runtime whenever you need the full API surface or heavier dependencies. citeturn2search0turn2search1

## Gemini 2.0 Flash capabilities & constraints
- Gemini 2.0 Flash supports a 1,048,576-token input window but only 8,192 output tokens; batching multiple documents must budget within that envelope plus prompt overhead. citeturn4search0
- Google’s best-practice docs emphasize explicit structured-output/schema guidance when you need JSON, otherwise models may wander. They also recommend system instructions to enforce formatting. citeturn3search0turn3search1
- Context caching can drastically reduce costs if we reuse the same concatenated project + org corpus across batches; Google recommends caching large, shared prompt prefixes to avoid re-sending them for every request. citeturn4search2

## Implications for our fix
- Keep `/api/projects/[id]/generate-batch` on the Node runtime (or migrate back from `edge`) so Supabase client + heavy AI logic operate reliably.
- When prompting Gemini for multi-doc batches, tighten schemas / instructions and consider chunking to keep under the 1M token limit while allowing room for outputs.
- Explore caching the assembled context (already done in `libs/ai/context-assembly`) but align it with Gemini’s explicit caching guidance if we add API-level caching later.

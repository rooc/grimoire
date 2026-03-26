Sync NIP and event kind definitions with the upstream nostr-protocol/nips repository.

## Step 1: Fetch upstream data

```bash
curl -s https://raw.githubusercontent.com/nostr-protocol/nips/master/README.md
```

Parse two tables from the README:

1. **NIP list table** — rows like `| [01](01.md) | Basic protocol flow description | final |`
   - Extract: NIP identifier (from link target, e.g. `01`, `7D`), title, status (`draft`/`final`/`deprecated`)
2. **Event Kinds table** — rows like `| 0 | User Metadata | [01](01.md) |`
   - Extract: kind number, description, NIP reference
   - Ranges like `5000-5999` are categories — do NOT expand into individual entries

## Step 2: Update `src/constants/nips.ts`

Read the current file, then:

### VALID_NIPS array
- Add new NIP identifiers found upstream
- Remove NIPs no longer listed upstream (unless referenced by a kind in `kinds.ts`)
- Maintain sort order: numeric first (`"01"`–`"99"`), then hexadecimal (`"7D"`, `"A0"`, etc.)
- Preserve the `// Numeric NIPs` and `// Hexadecimal NIPs` section comments

### NIP_TITLES record
- Add entries for new NIPs
- Update titles that changed upstream
- Keep existing entries that still match

### DEPRECATED_NIPS array
- Sync with upstream: add NIPs marked `deprecated`, remove ones no longer deprecated
- Keep `as const` assertion

## Step 3: Update `src/constants/kinds.ts`

Read the current file, then apply changes carefully.

### PROTECTED — never modify or remove:
- **Grimoire custom kinds**: 777, 10777, 30777 — identified by `nip: ""`
- **Other custom kinds with `nip: ""`**: e.g., 32267, 34139, 36787
- **Community NIPs**: any entry with `communityNip` field (e.g., 30142)
- **Commented-out external specs**: Marmot, NKBIP, nostrocket, geocaching, Corny Chat, Lightning.Pub, Nostr Epoxy, Tidal, joinstr, Blossom (24242), etc.
- **All existing `icon` assignments** — never change icons on existing entries
- **Section comments**: `// Core protocol kinds`, `// Lists`, `// Channels`, etc.

### Adding new kinds:
- Add individually-listed kind numbers from the upstream Event Kinds table
- Place in correct position by kind number (follow existing ordering)
- Pick an appropriate lucide-react icon from the existing imports at the top of the file
- If no existing import fits, add a new import and explain the choice
- Match the existing code style and format

### Updating existing kinds:
- If upstream name/description changed, update `name` and `description`
- If the NIP reference changed, update the `nip` field
- **Never** change the `icon` field on existing entries

## Step 4: Cross-reference validation

- Every `nip` field in `EVENT_KINDS` should exist in `VALID_NIPS` (except empty strings `""` and external specs like `"BUD-03"`, `"AMB"`, `"85"`)
- Every NIP in `DEPRECATED_NIPS` should also be in `VALID_NIPS`
- Flag and fix any inconsistencies

## Step 5: Verify

```bash
npm run lint && npm run test:run && npm run build
```

Fix any lint/type/build issues before reporting.

## Step 6: Report

Summarize:
- NIPs added / removed / title-updated
- Kinds added / updated (with icon choices explained for new ones)
- Inconsistencies found and resolved
- Verification results (lint/test/build)

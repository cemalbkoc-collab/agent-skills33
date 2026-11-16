# Vendored skills

| Skill(s) | Upstream | Commit | License |
|---|---|---|---|
| design-taste-frontend | Leonxlnx/taste-skill | f6b76575f949 | MIT |
| scroll-craft | cemalbkoc-collab/scroll-craft-site (fork of nateherkai/scroll-craft) | 75d81f74e836 | see skill LICENSE |
| frontend-design, webapp-testing, web-artifacts-builder, theme-factory, canvas-design, algorithmic-art | anthropics/skills | 1780c5e5a552 | Apache 2.0 |
| impeccable | pbakaus/impeccable | d41d9860b009 | Apache 2.0 |
| cro, copywriting, copy-editing, seo-audit, ai-seo, schema, site-architecture, popups, ab-testing, emails, offers, product-marketing, marketing-psychology, conversion-tracking, signup | coreyhaines31/marketingskills | 1f837447b20b | MIT |
| oil-ui | oil-oil/oil-ui | 5cf5bcb93653 | MIT |
| oil-motion | oil-oil/oil-motion | 07e31f2265f8 | MIT |
| humanizer | blader/humanizer | b48c832f0f80 | MIT |

Reviewed before vendoring: no hooks except taste-skill's local Stop gate; impeccable's launcher downloads its engine only from its GitHub releases and checks a pinned SHA-256.


Local changes: oil-ui's self-update (scripts/check_update.*, its allowed-tools and the version-check step) was removed so reviewed code cannot be replaced from the network. tests/ and .git/.github were not copied.

Rejected after review (2026-11-16): superdesign-skill (runs unpinned `npx @superdesign/cli@latest` and needs a cloud login), reanimate (clones other sites' animations: works against originality), huashu-design (overlaps impeccable/taste, Chinese-only pipeline, optional ByteDance cloud TTS), pinme (deploy service; Higgsfield already covers hosting), open-design (a full app, not a skill). None looked malicious.

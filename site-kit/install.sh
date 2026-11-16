#!/usr/bin/env bash
# Site yapım becerilerini ~/.claude/skills altına bağlar (sembolik link). Tekrar çalıştırmak güvenlidir.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$KIT")"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$DEST"
link() { local src="$1" name; name="$(basename "$src")"
  if [ -e "$DEST/$name" ] && [ ! -L "$DEST/$name" ]; then echo "atlandı (gerçek klasör var): $DEST/$name"; return; fi
  ln -sfn "$src" "$DEST/$name"; echo "bağlandı: $name"; }
for s in "$KIT"/skills/*/; do link "${s%/}"; done
for s in frontend-ui-engineering browser-testing-with-devtools performance-optimization shipping-and-launch \
         spec-driven-development idea-refine interview-me planning-and-task-breakdown incremental-implementation \
         security-and-hardening code-review-and-quality debugging-and-error-recovery; do
  [ -d "$REPO/skills/$s" ] && link "$REPO/skills/$s"
done
echo "Tamam: $DEST"

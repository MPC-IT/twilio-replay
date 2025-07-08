#!/bin/bash

FILES=(
  "pages/replays/index.tsx"
  "pages/replays/[replayId]/index.tsx"
  "pages/replays/new.tsx"
  "pages/api/replays/index.ts"
  "pages/api/replays/mock-usage.ts"
  "pages/replays/lookup.tsx"
  "pages/replays/access.tsx"
  "pages/api/replays/lookup.ts"
  "pages/api/webhook/play-replay.ts"
)

for file in "${FILES[@]}"; do
  echo "Updating $file..."
  cp "$file" "$file.bak"

  # Replace variable `code` with `codeInt` safely for object fields
  sed -i '
    s/\<code\>:/codeInt:/g
    s/code: parseInt(code)/codeInt: parseInt(code)/g
    s/parseInt(code)/parseInt(code)/g
  ' "$file"
done

echo "✅ All files updated. `.bak` backups saved for review."

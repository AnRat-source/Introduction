# Introduction

## File Explorer

The website Explorer reads `FileExplorer/file-index.json`, which mirrors the contents of `FileExplorer/`.

- GitHub Actions rebuilds and commits the index whenever files in `FileExplorer/` are pushed.
- For a local update before pushing, run `node scripts/build-file-explorer-index.mjs`.

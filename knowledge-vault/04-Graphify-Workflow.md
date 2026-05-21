# Graphify Workflow

## Outputs
Graphify writes outputs to `graphify-out/`:
- `graph.json`
- `graph.html`
- `GRAPH_REPORT.md`
- cache artifacts

Inside this vault, `graphify-out` is symlinked so the generated report can be browsed directly from Obsidian.

## Recommended Usage
- Rebuild full graph when architecture changes materially
- Use update flow for incremental code-only changes when possible
- Read `graphify-out/GRAPH_REPORT.md` before broad codebase searches

## Typical Questions
- What are the core modules and god nodes?
- Which files are most central to audit workflows?
- What architectural clusters exist between backend, frontend, and docs?
- Where do configuration mismatches show up?

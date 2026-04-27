# SecureVault Explorer

A high-performance, keyboard-accessible file explorer UI for SecureVault Inc. — built with React and custom CSS, no component libraries.

**Live Demo:** _[add your deployment URL here]_
**Design File:** _[add your Figma/Penpot link here]_

---

## Setup

```bash
npm install
npm run dev       # development server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

**Requirements:** Node.js 18+

---

## Design System

The UI follows a "cyber-secure, precise, and fast" dark aesthetic defined by:

| Token | Value |
|---|---|
| Background base | `#0a0d14` |
| Surface | `#0f1320` |
| Accent | `#1e6fff` |
| Text primary | `#e2e8f0` |
| Font UI | Inter |
| Font mono | JetBrains Mono |

Component states (default, hover, focus, selected, search-match) are all defined in `src/styles.css` under the Design System comment block.

---

## Recursive Strategy

The file tree is rendered by a single recursive component — `TreeNode`. It receives a `node` object and renders itself, then maps over `node.children`, rendering a `TreeNode` for each child. Depth is passed as a prop and used only for visual indentation (`12 + depth × 16` px), so the component handles any nesting level without structural changes.

```
<TreeNode node={root}>           // depth 0
  <TreeNode node={folder}>       // depth 1
    <TreeNode node={file} />     // depth 2
  </TreeNode>
</TreeNode>
```

Expanded state is managed as a `Set<id>` in the root `App` component and passed down, keeping the recursive component stateless and predictable.

---

## Wildcard Feature — Breadcrumb Path Trail

**What:** When a file or folder is selected, a breadcrumb path (`vault / folder / subfolder / file`) appears at the top of the Properties Panel.

**Why:** In a deeply nested vault with hundreds of folders, knowing *where* a file lives is as important as knowing *what* it is. Without a path trail, users must mentally trace back through the tree after clicking a search result — a real friction point for lawyers and auditors working under time pressure. The breadcrumb eliminates that cognitive load and doubles as a quick orientation tool after keyboard navigation jumps.

---

## Features

- **Recursive tree** — unlimited nesting depth, expand/collapse on click
- **File type icons** — colour-coded by extension (PDF, DOCX, XLSX, PNG, TXT, YAML, SVG…)
- **Properties panel** — Name, Type, Size, ID, and item count for folders
- **Breadcrumb path** — full vault path for the selected item (Wildcard feature)
- **Search & filter** — real-time filtering with automatic folder expansion for deep matches
- **Full keyboard navigation** — `↑ ↓` move focus, `→` expands, `←` collapses, `Enter` selects
- **ARIA roles** — `tree`, `treeitem`, `aria-expanded`, `aria-selected` for screen readers

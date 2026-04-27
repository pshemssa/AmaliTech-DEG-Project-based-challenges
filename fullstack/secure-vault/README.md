# SecureVault Explorer

A high-performance, keyboard-accessible file explorer UI for SecureVault Inc. — built with React 18 and custom CSS. No component libraries used.

**Live Demo:** https://amali-tech-deg-project-based-challe-topaz.vercel.app/ 


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

The UI follows a "cyber-secure, precise, and fast" dark aesthetic.

| Token | Value |
|---|---|
| Background base | `#0a0d14` |
| Surface | `#0f1320` |
| Elevated | `#161c2e` |
| Accent | `#1e6fff` |
| Text primary | `#e2e8f0` |
| Text secondary | `#7a8ba8` |
| Green | `#00d68f` |
| Yellow | `#ffd166` |
| Red | `#ff4d6d` |
| Font UI | Inter |
| Font mono | JetBrains Mono |

All component states — default, hover, focus, selected, search-match — are defined in `src/styles.css`.

---

## Project Structure

```
src/
├── main.jsx          # React entry point
├── App.jsx           # Root component — all state lives here
├── TreeNode.jsx      # Recursive tree node + file/folder icons
├── PropertiesPanel.jsx  # File metadata panel with breadcrumb
├── FileViewer.jsx    # File preview modal
├── UploadModal.jsx   # Drag-and-drop file upload modal
└── styles.css        # Full design system + component styles
```

---

## Recursive Strategy

The file tree is rendered by a single recursive component — `TreeNode`. It receives a `node` object, renders itself, then maps over `node.children` rendering a `TreeNode` for each child. Depth is passed as a prop used only for visual indentation (`12 + depth × 16` px), so the component handles any nesting level without structural changes.

```
<TreeNode node={root}>           // depth 0
  <TreeNode node={folder}>       // depth 1
    <TreeNode node={file} />     // depth 2
  </TreeNode>
</TreeNode>
```

Expanded state is managed as a `Set<id>` in `App` and passed down, keeping `TreeNode` stateless and predictable.

---

## Wildcard Feature — Breadcrumb Path Trail

**What:** When a file or folder is selected, a breadcrumb path (`vault / folder / subfolder / file`) appears at the top of the Properties Panel.

**Why:** In a deeply nested vault with hundreds of folders, knowing *where* a file lives is as important as knowing *what* it is. Without a path trail, users must mentally trace back through the tree after clicking a search result — a real friction point for lawyers and auditors working under time pressure. The breadcrumb eliminates that cognitive load and doubles as a quick orientation tool after keyboard navigation jumps.

---

## Features

### Core
- **Recursive tree** — unlimited nesting depth, expand/collapse on click
- **File type icons** — colour-coded SVG icons per extension (PDF, DOCX, XLSX, PNG, TXT, YAML, SVG, TTF…)
- **Properties panel** — Name, Type, Size, ID, and item count for folders
- **Breadcrumb path** — full vault path for the selected item _(Wildcard feature)_
- **Search & filter** — real-time filtering with automatic folder expansion for deep matches
- **Keyboard navigation** — `↑ ↓` move focus, `→` expands, `←` collapses, `Enter` selects
- **ARIA roles** — `tree`, `treeitem`, `aria-expanded`, `aria-selected` for screen readers

### Explorer Toolbar
- **A → Z sort** — toggle alphabetical sorting on the file tree
- **Collapse All** — collapses all open folders at once; disabled when nothing is expanded

### File Viewer
- Click any file to select it, then preview its contents in a modal
- Per-type previews: document layout for PDF/DOCX, spreadsheet table for XLSX, monospace content for TXT/YAML, placeholder for images and binaries
- Close with `Escape` or clicking the backdrop

### File Upload
- **Upload button** in the topbar opens a drag-and-drop modal
- Supports multiple files, shows per-file progress simulation
- Uploaded files are injected directly into the vault tree

### Recently Viewed
- Tracks the last 5 files you clicked
- Appears as a collapsible tab at the bottom of the explorer sidebar
- Click the tab to expand/collapse the list; click any item to re-select it

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `↑` / `↓` | Move focus between visible items |
| `→` | Expand focused folder |
| `←` | Collapse focused folder |
| `Enter` | Select focused item |
| `Escape` | Close file viewer modal |

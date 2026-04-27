import { useRef } from 'react'

const FILE_ICONS = {
  pdf:  { color: '#ff4d6d', label: 'PDF' },
  docx: { color: '#5ba3ff', label: 'DOC' },
  xlsx: { color: '#00d68f', label: 'XLS' },
  png:  { color: '#ffd166', label: 'IMG' },
  txt:  { color: '#7a8ba8', label: 'TXT' },
  yaml: { color: '#c084fc', label: 'YML' },
  svg:  { color: '#ffd166', label: 'SVG' },
  ttf:  { color: '#7a8ba8', label: 'TTF' },
  default: { color: '#7a8ba8', label: 'FILE' },
}

function getExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : 'default'
}

export function FileIcon({ name, size = 14 }) {
  const ext = getExt(name)
  const { color, label } = FILE_ICONS[ext] || FILE_ICONS.default
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="node-icon">
      <rect x="1" y="1" width="9" height="12" rx="1.5" fill={color + '22'} stroke={color} strokeWidth="1"/>
      <text x="5.5" y="9" textAnchor="middle" fontSize="3.5" fill={color} fontFamily="monospace" fontWeight="bold">{label}</text>
    </svg>
  )
}

export function FolderIcon({ open, size = 14 }) {
  const c = open ? '#5ba3ff' : '#3d6fa8'
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="node-icon">
      <path d="M1 3.5C1 2.67 1.67 2 2.5 2H5l1.5 1.5H11.5C12.33 3.5 13 4.17 13 5v5.5C13 11.33 12.33 12 11.5 12h-9C1.67 12 1 11.33 1 10.5V3.5Z" fill={c + '33'} stroke={c} strokeWidth="1"/>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TreeNode({ node, depth = 0, selectedId, onSelect, expandedIds, onToggle, flatList, searchQuery }) {
  const rowRef = useRef(null)
  const isFolder = node.type === 'folder'
  const isOpen = expandedIds.has(node.id)
  const isSelected = selectedId === node.id
  const isMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase())

  function handleKeyDown(e) {
    const idx = flatList.indexOf(node.id)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = flatList[idx + 1]
      if (next) document.querySelector(`[data-id="${next}"]`)?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = flatList[idx - 1]
      if (prev) document.querySelector(`[data-id="${prev}"]`)?.focus()
    } else if (e.key === 'ArrowRight' && isFolder && !isOpen) {
      e.preventDefault(); onToggle(node.id)
    } else if (e.key === 'ArrowLeft' && isFolder && isOpen) {
      e.preventDefault(); onToggle(node.id)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isFolder) onToggle(node.id)
      else onSelect(node)
    }
  }

  const visibleChildren = isOpen && isFolder && node.children?.length > 0

  return (
    <div className="tree-node">
      <div
        ref={rowRef}
        data-id={node.id}
        className={`tree-row${isSelected ? ' selected' : ''}${isMatch ? ' search-match' : ''}`}
        style={{ paddingLeft: `${var_indent(depth)}px` }}
        tabIndex={0}
        role={isFolder ? 'treeitem' : 'treeitem'}
        aria-expanded={isFolder ? isOpen : undefined}
        aria-selected={isSelected}
        onClick={() => isFolder ? onToggle(node.id) : onSelect(node)}
        onKeyDown={handleKeyDown}
      >
        <span className={`tree-chevron${isOpen ? ' open' : ''}${!isFolder ? ' hidden' : ''}`}>
          <ChevronIcon />
        </span>
        {isFolder
          ? <FolderIcon open={isOpen} />
          : <FileIcon name={node.name} />
        }
        <span className={`node-name${isFolder ? ' folder' : ''}`}>{node.name}</span>
      </div>

      {visibleChildren && (
        <div className="tree-children" role="group">
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
              flatList={flatList}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function var_indent(depth) {
  return 12 + depth * 16
}

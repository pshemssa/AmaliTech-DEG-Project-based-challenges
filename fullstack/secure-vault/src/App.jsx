import { useState, useMemo, useCallback } from 'react'
import data from '../data.json'
import TreeNode from './TreeNode'
import PropertiesPanel from './PropertiesPanel'
import FileViewer from './FileViewer'

function buildFlatList(nodes, expandedIds, result = []) {
  for (const node of nodes) {
    result.push(node.id)
    if (node.type === 'folder' && expandedIds.has(node.id) && node.children?.length) {
      buildFlatList(node.children, expandedIds, result)
    }
  }
  return result
}

function nodeMatches(node, q) {
  if (node.name.toLowerCase().includes(q)) return true
  return node.children?.some(c => nodeMatches(c, q)) ?? false
}

function collectMatchingFolders(nodes, q, acc = new Set()) {
  for (const node of nodes) {
    if (node.type === 'folder' && node.children?.length) {
      if (node.children.some(c => nodeMatches(c, q))) acc.add(node.id)
      collectMatchingFolders(node.children, q, acc)
    }
  }
  return acc
}

/** Find a node by id and return its ancestor name path */
function findBreadcrumb(nodes, targetId, path = []) {
  for (const node of nodes) {
    const next = [...path, node.name]
    if (node.id === targetId) return next
    if (node.children?.length) {
      const found = findBreadcrumb(node.children, targetId, next)
      if (found) return found
    }
  }
  return null
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L3 4.5v5C3 13.1 5.6 16 9 17c3.4-1 6-3.9 6-7.5v-5L9 2Z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6.5 9l1.8 1.8L11.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function App() {
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [viewerNode, setViewerNode] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const q = searchQuery.trim().toLowerCase()

  const breadcrumb = useMemo(
    () => selectedNode ? (findBreadcrumb(data, selectedNode.id) ?? []) : [],
    [selectedNode]
  )

  const activeExpanded = useMemo(() => {
    if (!q) return expandedIds
    const autoExpand = collectMatchingFolders(data, q)
    return new Set([...expandedIds, ...autoExpand])
  }, [q, expandedIds])

  const visibleData = useMemo(() => {
    if (!q) return data
    return data.filter(node => nodeMatches(node, q))
  }, [q])

  const flatList = useMemo(
    () => buildFlatList(visibleData, activeExpanded),
    [visibleData, activeExpanded]
  )

  const onToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const onSelect = useCallback((node) => setSelectedNode(node), [])

  function handleSearch(e) {
    setSearchQuery(e.target.value)
    setSelectedNode(null)
  }

  return (
    <div className="app" role="application">
      <header className="topbar" role="banner">
        <div className="topbar-logo">
          <ShieldIcon />
          SecureVault
        </div>
        <div className="topbar-divider" />
        <div className="search-wrap">
          <SearchIcon />
          <input
            className="search-input"
            type="search"
            placeholder="Search files and folders…"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search vault"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
              <XIcon />
            </button>
          )}
        </div>
      </header>

      <nav className="explorer" role="tree" aria-label="Vault file explorer">
        {visibleData.length === 0
          ? <div className="explorer-empty">No results for "{searchQuery}"</div>
          : visibleData.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedNode?.id}
              onSelect={onSelect}
              expandedIds={activeExpanded}
              onToggle={onToggle}
              flatList={flatList}
              searchQuery={q}
            />
          ))
        }
      </nav>

      <PropertiesPanel node={selectedNode} breadcrumb={breadcrumb} onOpen={() => setViewerNode(selectedNode)} />

      {viewerNode && <FileViewer node={viewerNode} onClose={() => setViewerNode(null)} />}
    </div>
  )
}

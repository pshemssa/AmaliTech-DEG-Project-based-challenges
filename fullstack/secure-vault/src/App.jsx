import { useState, useMemo, useCallback } from 'react'
import data from '../data.json'
import TreeNode from './TreeNode'
import PropertiesPanel from './PropertiesPanel'
import FileViewer from './FileViewer'
import UploadModal from './UploadModal'

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
  const [vaultData, setVaultData] = useState(data)
  const [showUpload, setShowUpload] = useState(false)
  const [recentIds, setRecentIds] = useState([])
  const [recentOpen, setRecentOpen] = useState(false)
  const [sortAZ, setSortAZ] = useState(false)

  const q = searchQuery.trim().toLowerCase()

  const breadcrumb = useMemo(
    () => selectedNode ? (findBreadcrumb(vaultData, selectedNode.id) ?? []) : [],
    [selectedNode, vaultData]
  )

  const activeExpanded = useMemo(() => {
    if (!q) return expandedIds
    const autoExpand = collectMatchingFolders(vaultData, q)
    return new Set([...expandedIds, ...autoExpand])
  }, [q, expandedIds, vaultData])

  const visibleData = useMemo(() => {
    let nodes = !q ? vaultData : vaultData.filter(node => nodeMatches(node, q))
    if (sortAZ) nodes = [...nodes].sort((a, b) => a.name.localeCompare(b.name))
    return nodes
  }, [q, vaultData, sortAZ])

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

  const onSelect = useCallback((node) => {
    setSelectedNode(node)
    if (node.type === 'file') {
      setRecentIds(prev => {
        const filtered = prev.filter(id => id !== node.id)
        return [node.id, ...filtered].slice(0, 5)
      })
    }
  }, [])

  function handleSearch(e) {
    setSearchQuery(e.target.value)
    setSelectedNode(null)
  }

  function findNode(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children?.length) { const f = findNode(n.children, id); if (f) return f }
    }
    return null
  }

  function handleUpload(newFiles) {
    // Add uploaded files to the root of the vault
    setVaultData(prev => [...prev, ...newFiles])
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
        <button className="btn-upload" onClick={() => setShowUpload(true)} aria-label="Upload files">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Upload
        </button>
      </header>

      <nav className="explorer" role="tree" aria-label="Vault file explorer">
        <div className="explorer-toolbar">
          <button
            className={`toolbar-btn${sortAZ ? ' active' : ''}`}
            onClick={() => setSortAZ(o => !o)}
            title="Sort A → Z"
            aria-pressed={sortAZ}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 3h6M1 6.5h4M1 10h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M10 2v9M8 9l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            A → Z
          </button>
          <button
            className="toolbar-btn"
            onClick={() => setExpandedIds(new Set())}
            disabled={expandedIds.size === 0}
            title="Collapse all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 5l4.5-3L11 5M2 8l4.5 3L11 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Collapse All
          </button>
        </div>
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

        {recentIds.length > 0 && (
          <div className="recent-panel">
            <button
              className="recent-tab"
              onClick={() => setRecentOpen(o => !o)}
              aria-expanded={recentOpen}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Recently Viewed
              <span className="recent-count">{recentIds.length}</span>
              <svg className={`recent-chevron${recentOpen ? ' open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {recentOpen && recentIds.map(id => {
              const n = findNode(vaultData, id)
              if (!n) return null
              return (
                <div
                  key={id}
                  className={`recent-item${selectedNode?.id === id ? ' selected' : ''}`}
                  onClick={() => onSelect(n)}
                  title={n.name}
                >
                  <span className="recent-dot" />
                  <span className="recent-name">{n.name}</span>
                </div>
              )
            })}
          </div>
        )}
      </nav>

      <PropertiesPanel node={selectedNode} breadcrumb={breadcrumb} />

      {viewerNode && <FileViewer node={viewerNode} onClose={() => setViewerNode(null)} />}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          targetFolder={selectedNode?.type === 'folder' ? selectedNode.name : null}
        />
      )}
    </div>
  )
}

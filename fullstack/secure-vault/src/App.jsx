import { useState, useMemo, useCallback } from 'react'
import data from '../data.json'
import TreeNode from './TreeNode'

function buildFlatList(nodes, expandedIds, result = []) {
  for (const node of nodes) {
    result.push(node.id)
    if (node.type === 'folder' && expandedIds.has(node.id) && node.children?.length) {
      buildFlatList(node.children, expandedIds, result)
    }
  }
  return result
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L3 4.5v5C3 13.1 5.6 16 9 17c3.4-1 6-3.9 6-7.5v-5L9 2Z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6.5 9l1.8 1.8L11.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function App() {
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)

  const flatList = useMemo(
    () => buildFlatList(data, expandedIds),
    [expandedIds]
  )

  const onToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const onSelect = useCallback((node) => setSelectedNode(node), [])

  return (
    <div className="app" role="application">
      <header className="topbar">
        <div className="topbar-logo">
          <ShieldIcon />
          SecureVault
        </div>
      </header>

      <nav className="explorer" role="tree" aria-label="Vault file explorer">
        {data.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedNode?.id}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggle={onToggle}
            flatList={flatList}
            searchQuery=""
          />
        ))}
      </nav>

      <div className="properties" />
    </div>
  )
}

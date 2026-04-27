import { FileIcon, FolderIcon } from './TreeNode'

function EmptyState() {
  return (
    <div className="properties-empty">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="28" height="36" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 18h16M16 24h12M16 30h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span>Select a file to inspect</span>
    </div>
  )
}

function PropRow({ label, value, valueClass }) {
  return (
    <div className="prop-row">
      <span className="prop-key">{label}</span>
      <span className={`prop-val${valueClass ? ' ' + valueClass : ''}`}>{value}</span>
    </div>
  )
}

function getExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toUpperCase() : '—'
}

export default function PropertiesPanel({ node, breadcrumb, onOpen }) {
  if (!node) return <div className="properties"><EmptyState /></div>

  const isFolder = node.type === 'folder'
  const ext = isFolder ? 'Folder' : getExt(node.name)

  return (
    <div className="properties">
      {breadcrumb?.length > 0 && (
        <div className="breadcrumb" aria-label="File path">
          <span className="breadcrumb-item">vault</span>
          {breadcrumb.map((seg, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span className="breadcrumb-sep">/</span>
              <span className={`breadcrumb-item${i === breadcrumb.length - 1 ? ' last' : ''}`}>{seg}</span>
            </span>
          ))}
        </div>
      )}

      <div className="properties-header">
        <div className="properties-icon">
          {isFolder
            ? <FolderIcon open size={22} />
            : <FileIcon name={node.name} size={22} />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="properties-title">{node.name}</div>
          <div className="properties-subtitle">{isFolder ? 'Directory' : `${ext} File`}</div>
        </div>
        {!isFolder && (
          <button className="btn-open" onClick={onOpen} aria-label="Open file">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 5h5M4 7.5h5M4 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M10 1v5l1.5-1.5L13 6V1h-3Z" fill="currentColor"/>
            </svg>
            Open
          </button>
        )}
      </div>

      <div className="properties-body">
        <div>
          <div className="prop-section-label">Metadata</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <PropRow label="Name"  value={node.name} />
            <PropRow label="Type"  value={isFolder ? 'Folder' : ext} valueClass="accent" />
            {!isFolder && <PropRow label="Size" value={node.size ?? '—'} valueClass="green" />}
            <PropRow label="ID"    value={node.id} />
          </div>
        </div>

        {isFolder && (
          <div>
            <div className="prop-section-label">Contents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <PropRow label="Items" value={node.children?.length ?? 0} valueClass="accent" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

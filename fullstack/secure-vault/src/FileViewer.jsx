import { useEffect } from 'react'
import { FileIcon } from './TreeNode'

function getExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export default function FileViewer({ node, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fv-overlay" role="dialog" aria-modal="true" aria-label={`Viewing ${node.name}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fv-modal">
        <div className="fv-modal-header">
          <div className="fv-modal-title">
            <FileIcon name={node.name} size={16} />
            <span>{node.name}</span>
            <span className="fv-modal-size">{node.size}</span>
          </div>
          <button className="fv-close" onClick={onClose} aria-label="Close viewer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="fv-modal-body" />
      </div>
    </div>
  )
}

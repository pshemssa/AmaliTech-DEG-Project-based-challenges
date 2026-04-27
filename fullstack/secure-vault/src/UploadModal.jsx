import { useState, useRef, useCallback } from 'react'
import { FileIcon } from './TreeNode'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export default function UploadModal({ onClose, onUpload, targetFolder }) {
  const [files, setFiles] = useState([])   // { file, progress, done }
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = useCallback((incoming) => {
    const entries = Array.from(incoming).map(f => ({ file: f, progress: 0, done: false }))
    setFiles(prev => [...prev, ...entries])

    // Simulate upload progress for each file
    entries.forEach((entry, i) => {
      const total = prev => prev.length - entries.length + i
      let p = 0
      const tick = setInterval(() => {
        p += Math.random() * 25 + 10
        if (p >= 100) {
          p = 100
          clearInterval(tick)
          setFiles(prev => prev.map(e => e.file === entry.file ? { ...e, progress: 100, done: true } : e))
        } else {
          setFiles(prev => prev.map(e => e.file === entry.file ? { ...e, progress: Math.round(p) } : e))
        }
      }, 200)
    })
  }, [])

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  function onDragOver(e) { e.preventDefault(); setDragging(true) }
  function onDragLeave()  { setDragging(false) }

  function handleConfirm() {
    const done = files.filter(e => e.done)
    if (!done.length) return
    onUpload(done.map(e => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: e.file.name,
      type: 'file',
      size: formatSize(e.file.size),
    })))
    onClose()
  }

  const allDone = files.length > 0 && files.every(e => e.done)

  return (
    <div className="fv-overlay" role="dialog" aria-modal="true" aria-label="Upload files"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fv-modal upload-modal">

        <div className="fv-modal-header">
          <div className="fv-modal-title">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Upload to {targetFolder ? targetFolder : 'vault'}</span>
          </div>
          <button className="fv-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="fv-modal-body">
          {/* Drop zone */}
          <div
            className={`upload-dropzone${dragging ? ' dragging' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current.click()}
            aria-label="Drop files here or click to browse"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4v16M10 10l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 22v3a3 3 0 003 3h14a3 3 0 003-3v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="upload-dropzone-label">
              {dragging ? 'Drop to upload' : 'Drop files here or click to browse'}
            </span>
            <span className="upload-dropzone-sub">All file types accepted</span>
            <input ref={inputRef} type="file" multiple hidden onChange={e => addFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="upload-list">
              {files.map((entry, i) => (
                <div key={i} className="upload-item">
                  <FileIcon name={entry.file.name} size={14} />
                  <div className="upload-item-info">
                    <div className="upload-item-name">{entry.file.name}</div>
                    <div className="upload-progress-track">
                      <div className="upload-progress-bar" style={{ width: `${entry.progress}%` }} />
                    </div>
                  </div>
                  <span className="upload-item-status">
                    {entry.done
                      ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#00d68f22" stroke="#00d68f" strokeWidth="1.2"/><path d="M4.5 7l2 2 3-3" stroke="#00d68f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : `${entry.progress}%`
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="upload-footer">
          <button className="upload-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="upload-btn-confirm" onClick={handleConfirm} disabled={!allDone}>
            Add {files.filter(e => e.done).length || ''} file{files.filter(e => e.done).length !== 1 ? 's' : ''} to vault
          </button>
        </div>

      </div>
    </div>
  )
}

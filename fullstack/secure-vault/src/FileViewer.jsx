import { useEffect } from 'react'
import { FileIcon } from './TreeNode'

const MOCK_CONTENT = {
  txt: (name) => `# ${name}\n\nThis document is stored securely in SecureVault.\nClassification: CONFIDENTIAL\nLast modified: 2025-03-14\n\n--- BEGIN CONTENT ---\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco.\n\n--- END CONTENT ---`,
  yaml: () => `version: "3.9"\nservices:\n  vault-api:\n    image: securevault/api:latest\n    ports:\n      - "8080:8080"\n    environment:\n      - NODE_ENV=production\n      - DB_HOST=postgres\n      - ENCRYPTION_KEY=\${VAULT_KEY}\n    volumes:\n      - vault-data:/data\n  postgres:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_DB: vaultdb\n      POSTGRES_USER: admin\n      POSTGRES_PASSWORD: \${DB_PASS}\nvolumes:\n  vault-data:`,
}

function getExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function TextPreview({ content }) {
  return <pre className="fv-text">{content}</pre>
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
        <div className="fv-modal-body">
          {(ext === 'txt' || ext === 'yaml') && <TextPreview content={ext === 'yaml' ? MOCK_CONTENT.yaml() : MOCK_CONTENT.txt(node.name)} />}
        </div>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { FileIcon } from './TreeNode'

const MOCK_CONTENT = {
  txt: (name) => `# ${name}\n\nThis document is stored securely in SecureVault.\nClassification: CONFIDENTIAL\nLast modified: 2025-03-14\n\n--- BEGIN CONTENT ---\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco.\n\n--- END CONTENT ---`,
  yaml: () => `version: "3.9"\nservices:\n  vault-api:\n    image: securevault/api:latest\n    ports:\n      - "8080:8080"\n    environment:\n      - NODE_ENV=production\n      - DB_HOST=postgres\n      - ENCRYPTION_KEY=\${VAULT_KEY}\n    volumes:\n      - vault-data:/data\n  postgres:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_DB: vaultdb\n      POSTGRES_USER: admin\n      POSTGRES_PASSWORD: \${DB_PASS}\nvolumes:\n  vault-data:`,
  pdf: (name) => ({
    title: name.replace('.pdf', '').replace(/_/g, ' '),
    pages: 12,
    lines: [
      'CONFIDENTIAL — FOR AUTHORIZED PERSONNEL ONLY',
      '',
      'This document has been encrypted and stored in compliance with',
      'ISO 27001 and SOC 2 Type II security standards.',
      '',
      'Section 1: Executive Summary',
      'The following report outlines the findings and recommendations',
      'pertaining to the matter described herein. All parties have been',
      'notified in accordance with applicable regulations.',
      '',
      'Section 2: Background',
      'SecureVault Inc. maintains strict chain-of-custody protocols for',
      'all documents stored within its encrypted file system.',
    ]
  }),
  docx: (name) => ({
    title: name.replace('.docx', '').replace(/_/g, ' '),
    lines: [
      'Document Classification: RESTRICTED',
      'Version: Draft v3 — Pending Review',
      '',
      'To: Legal Review Committee',
      'From: Case Management Team',
      'Date: March 14, 2025',
      '',
      'RE: Case Summary and Preliminary Findings',
      '',
      'This memorandum summarizes the key findings to date and outlines',
      'the recommended course of action for the matter referenced above.',
      'All supporting evidence has been catalogued and is available upon',
      'request through the SecureVault document management system.',
    ]
  }),
  xlsx: () => ({
    headers: ['Employee ID', 'Department', 'Base Salary', 'Bonus', 'Total', 'Status'],
    rows: [
      ['EMP-001', 'Legal', '$95,000', '$8,500', '$103,500', 'Active'],
      ['EMP-002', 'Finance', '$88,000', '$7,200', '$95,200', 'Active'],
      ['EMP-003', 'IT Security', '$112,000', '$11,000', '$123,000', 'Active'],
      ['EMP-004', 'Legal', '$91,000', '$8,100', '$99,100', 'Active'],
      ['EMP-005', 'HR', '$76,000', '$5,500', '$81,500', 'On Leave'],
    ]
  }),
}

function getExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

function TextPreview({ content }) {
  return <pre className="fv-text">{content}</pre>
}

function DocPreview({ data }) {
  return (
    <div className="fv-doc">
      <div className="fv-doc-title">{data.title}</div>
      {data.pages && <div className="fv-doc-meta">{data.pages} pages · PDF Document</div>}
      <div className="fv-doc-divider" />
      {data.lines.map((line, i) =>
        line === ''
          ? <div key={i} className="fv-doc-spacer" />
          : <p key={i} className="fv-doc-line">{line}</p>
      )}
      <div className="fv-doc-fade" />
    </div>
  )
}

function SheetPreview({ data }) {
  return (
    <div className="fv-sheet-wrap">
      <table className="fv-sheet">
        <thead>
          <tr>{data.headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={cell === 'Active' ? 'cell-green' : cell === 'On Leave' ? 'cell-yellow' : ''}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ImagePreview({ name }) {
  const ext = getExt(name).toUpperCase()
  return (
    <div className="fv-image">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="4" y="4" width="72" height="72" rx="8" fill="#1e6fff11" stroke="#1e6fff33" strokeWidth="1.5"/>
        <circle cx="28" cy="30" r="7" fill="#1e6fff44"/>
        <path d="M8 56l18-18 12 12 10-10 24 20" stroke="#1e6fff" strokeWidth="2" strokeLinejoin="round" fill="none"/>
      </svg>
      <span className="fv-image-label">{ext} — Preview not available in vault mode</span>
      <span className="fv-image-sub">Secure rendering requires authorized viewer</span>
    </div>
  )
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
          {(ext === 'pdf' || ext === 'docx') && <DocPreview data={ext === 'pdf' ? MOCK_CONTENT.pdf(node.name) : MOCK_CONTENT.docx(node.name)} />}
          {ext === 'xlsx' && <SheetPreview data={MOCK_CONTENT.xlsx()} />}
          {!['txt','yaml','pdf','docx','xlsx'].includes(ext) && <ImagePreview name={node.name} />}
        </div>
      </div>
    </div>
  )
}

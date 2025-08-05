// app/components/CodeBlock.js
'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from './CodeBlock.module.css'

const CodeBlock = ({ value }) => {
  if (!value || !value.code) {
    return null
  }

  const { language, code } = value
  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.codeBlockHeader}>
        <span>{language || 'code'}</span>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        showLineNumbers
        wrapLines
        customStyle={{
          margin: 0,
          border: 'none',
          padding: '1.5rem',
          backgroundColor: '#0D0D0D',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
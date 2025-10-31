'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './MarkdownEditor.module.css';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const MarkdownEditor = ({ 
  name, 
  placeholder = "Enter content here... You can use **bold**, *italic*, `code`, and more!",
  value = "",
  onChange,
  height = 200,
  className = ""
}) => {
  const [content, setContent] = useState(value);

  const handleChange = (val) => {
    setContent(val || '');
    if (onChange) {
      onChange(val || '');
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <MDEditor
        value={content}
        onChange={handleChange}
        height={height}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        data-color-mode="light"
        textareaProps={{
          name: name,
          placeholder: placeholder,
          style: {
            fontSize: '14px',
            fontFamily: 'var(--mono, "Courier New", monospace)',
            lineHeight: '1.5'
          }
        }}
      />
      {/* Hidden input to ensure form data is submitted */}
      <input 
        type="hidden" 
        name={name} 
        value={content} 
      />
      <div className={styles.helpText}>
        💡 Supports Markdown: **bold**, *italic*, `code`, [links](url), lists, tables, and more
      </div>
    </div>
  );
};

export default MarkdownEditor;
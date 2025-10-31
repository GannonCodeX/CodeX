'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (val) => {
    setContent(val || '');
    if (onChange) {
      onChange(val || '');
    }
  };

  // Show fallback textarea during SSR or while loading
  if (!isMounted) {
    return (
      <div className={`${styles.container} ${className}`}>
        <textarea
          name={name}
          placeholder={placeholder}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            width: '100%',
            height: `${height}px`,
            padding: '0.75rem',
            border: '2px solid var(--subtle-gray)',
            backgroundColor: 'var(--bg)',
            color: 'var(--fg)',
            fontFamily: 'var(--mono, "Courier New", monospace)',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'vertical'
          }}
        />
        <div className={styles.helpText}>
          💡 Supports Markdown: **bold**, *italic*, `code`, [links](url), lists, tables, and more
        </div>
      </div>
    );
  }

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
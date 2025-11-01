'use client';

import React, { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';
import dynamic from 'next/dynamic';
import styles from './RichTextRenderer.module.css';

// Dynamically import react-markdown to avoid SSR issues  
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

const RichTextRenderer = ({ content, type = 'portableText' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If content is empty or null, don't render anything
  if (!content) return null;

  // Handle different content types
  if (type === 'markdown' && typeof content === 'string') {
    // Process markdown during SSR for better initial rendering
    if (!isMounted) {
      // Enhanced markdown processing for SSR fallback including tables
      let processedContent = content;
      
      // Process tables first
      const tableRegex = /\|(.+)\|\n\|[-\s|:]+\|\n((?:\|.+\|\n?)*)/g;
      processedContent = processedContent.replace(tableRegex, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const rowsArray = rows.trim().split('\n').map(row => 
          row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHTML = '<table class="markdown-table">';
        tableHTML += '<thead><tr>';
        headerCells.forEach(cell => {
          tableHTML += `<th>${cell}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        rowsArray.forEach(row => {
          tableHTML += '<tr>';
          row.forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
          });
          tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        return tableHTML;
      });
      
      // Process other markdown elements
      processedContent = processedContent
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

      return (
        <div 
          className={styles.markdownContent}
          dangerouslySetInnerHTML={{ __html: `<p>${processedContent}</p>` }}
        />
      );
    }

    return (
      <div className={styles.markdownContent}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
            h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
            p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
            ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
            li: ({ children }) => <li className={styles.listItem}>{children}</li>,
            blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
            code: ({ children, inline }) => 
              inline ? (
                <code className={styles.inlineCode}>{children}</code>
              ) : (
                <code className={styles.codeBlock}>{children}</code>
              ),
            pre: ({ children }) => <pre className={styles.preBlock}>{children}</pre>,
            table: ({ children }) => (
              <div className={styles.tableContainer}>
                <table className={styles.table}>{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className={styles.tableHead}>{children}</thead>,
            tbody: ({ children }) => <tbody className={styles.tableBody}>{children}</tbody>,
            tr: ({ children }) => <tr className={styles.tableRow}>{children}</tr>,
            th: ({ children }) => <th className={styles.tableHeader}>{children}</th>,
            td: ({ children }) => <td className={styles.tableCell}>{children}</td>,
            a: ({ children, href }) => (
              <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
            em: ({ children }) => <em className={styles.emphasis}>{children}</em>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Handle Sanity Portable Text (block content)
  if (Array.isArray(content)) {
    const portableTextComponents = {
      types: {
        code: ({ value }) => (
          <pre className={styles.codeBlock}>
            <code>{value.code}</code>
          </pre>
        ),
        table: ({ value }) => (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr className={styles.tableRow}>
                  {value.rows[0]?.cells.map((cell, index) => (
                    <th key={index} className={styles.tableHeader}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {value.rows.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className={styles.tableRow}>
                    {row.cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className={styles.tableCell}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      },
      block: {
        h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
        h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
        h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
        normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
        blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>
      },
      list: {
        bullet: ({ children }) => <ul className={styles.list}>{children}</ul>,
        number: ({ children }) => <ol className={styles.orderedList}>{children}</ol>
      },
      listItem: {
        bullet: ({ children }) => <li className={styles.listItem}>{children}</li>,
        number: ({ children }) => <li className={styles.listItem}>{children}</li>
      },
      marks: {
        strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
        em: ({ children }) => <em className={styles.emphasis}>{children}</em>,
        code: ({ children }) => <code className={styles.inlineCode}>{children}</code>,
        link: ({ children, value }) => (
          <a href={value.href} className={styles.link} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      }
    };

    return (
      <div className={styles.portableTextContent}>
        <PortableText value={content} components={portableTextComponents} />
      </div>
    );
  }

  // Fallback for plain text
  return <div className={styles.plainText}>{content}</div>;
};

export default RichTextRenderer;
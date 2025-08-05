// app/components/PortableTextRenderer.js
'use client'

import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import { client } from '@/sanity/lib/client'
import CodeBlock from './CodeBlock'
import styles from './PortableTextRenderer.module.css'

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

const portableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null
      }
      return (
        <div className={styles.portableImageWrapper}>
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ' '}
            loading="lazy"
            width={800}
            height={600}
            className={styles.portableImage}
          />
        </div>
      )
    },
    code: CodeBlock,
  },
}

const PortableTextRenderer = ({ content }) => {
  return <PortableText value={content} components={portableTextComponents} />
}

export default PortableTextRenderer

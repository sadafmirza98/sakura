'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { ContentItem } from '@/store/useContentStore'

interface Props {
  item: ContentItem | null
}

export default function PoemPanel({ item }: Readonly<Props>) {
  const clipRef = useRef<HTMLDivElement>(null)

  const title  = (item?.title  as string) ?? 'Untitled Poem'
  const text   = (item?.text   as string) ?? ''
  const author = (item?.author as string) ?? ''
  const date   = (item?.date   as string) ?? ''

  // Ink-reveal: animate clip-path wipe from top over 2000ms on mount
  useEffect(() => {
    const el = clipRef.current
    if (!el) return

    el.style.clipPath = 'inset(100% 0 0 0)'
    el.style.transition = 'none'

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'clip-path 2000ms cubic-bezier(0.25, 0.1, 0.25, 1)'
        el.style.clipPath = 'inset(0% 0 0 0)'
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [item?.id])

  return (
    <div>
      {/* Paper-texture card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(250,244,230,0.08)',
          border: '1px solid rgba(250,244,230,0.12)',
          borderRadius: 18,
          padding: '24px 20px 20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(250,244,230,0.06)',
        }}
      >
        {/* Poem title — centered */}
        <p
          className="font-serif"
          style={{ fontSize: 16, fontWeight: 400, color: 'rgba(240,234,218,0.9)', textAlign: 'center', marginBottom: 20 }}
        >
          {title}
        </p>

        {/* Poem text with ink-reveal */}
        <div ref={clipRef} style={{ willChange: 'clip-path' }}>
          {text ? (
            <p
              className="font-serif"
              style={{
                fontSize: 14,
                fontStyle: 'italic',
                color: 'rgba(240,234,218,0.78)',
                lineHeight: 2,
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
              }}
            >
              {text}
            </p>
          ) : (
            <p
              className="font-serif"
              style={{
                fontSize: 14,
                fontStyle: 'italic',
                color: 'rgba(240,234,218,0.3)',
                lineHeight: 2,
                textAlign: 'center',
              }}
            >
              Words will bloom here once you write your poem...
            </p>
          )}
        </div>

        {/* Author + date — bottom */}
        {(author || date) && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {author && (
              <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.45)' }}>
                — {author}
              </p>
            )}
            {date && (
              <p className="font-sans" style={{ fontSize: 11, color: 'rgba(201,191,232,0.35)' }}>
                {date}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

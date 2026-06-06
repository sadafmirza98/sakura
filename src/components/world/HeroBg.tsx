'use client'

/**
 * HeroBg — renders the hero illustration as a fixed CSS background-image.
 * No canvas, no JS overhead after mount. Pure CSS layers.
 *
 * Layer order (both fixed, inset 0):
 *   1. Illustration  — background-image, z-index 0
 *   2. Vignette      — radial gradient overlay so UI elements read clearly, z-index 0
 *
 * backgroundPosition: 'center 30%' keeps the tree canopy + sky in frame
 * across all viewport sizes.
 */
export default function HeroBg() {
  return (
    <>
      {/* Hero illustration */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: 'url(/assets/ui/sakura-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Subtle radial vignette — darkens edges so text and UI read clearly */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 70% at 50% 60%, transparent 30%, rgba(4,3,12,0.35) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

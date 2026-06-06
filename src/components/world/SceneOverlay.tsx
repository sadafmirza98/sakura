'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useUIStore } from '@/store/useUIStore'
import { getRelationshipDays, formatDate } from '@/lib/utils'

export default function SceneOverlay() {
  const { sceneMode, returnToGarden } = useUIStore()
  const { relationshipStartDate } = useAppStore()
  const days = getRelationshipDays(new Date(relationshipStartDate))

  return (
    <AnimatePresence>
      {sceneMode === 'pavilion' && (
        <ComfortPavilion key="pavilion" days={days} startDate={relationshipStartDate} onClose={returnToGarden} />
      )}
      {sceneMode === 'constellation' && (
        <ConstellationView key="constellation" onClose={returnToGarden} />
      )}
    </AnimatePresence>
  )
}

/* ─── Comfort Pavilion ──────────────────────────────────────────────────── */
function ComfortPavilion({ days, startDate, onClose }: { days: number; startDate: string; onClose: () => void }) {
  const AFFIRMATIONS = ['You are enough.', 'You are deeply loved.', 'Spring always returns.', 'This too shall pass.', 'We will be okay.']
  const a = AFFIRMATIONS[Math.floor(Date.now() / 3600000) % AFFIRMATIONS.length]

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(60,20,30,0.85) 0%, rgba(4,3,12,0.95) 100%)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Warm light sources */}
      <div className="absolute inset-0 pointer-events-none">
        {[0.2,0.5,0.8].map((x,i) => (
          <motion.div key={i} className="absolute"
            style={{ left:`${x*100}%`, top:'30%', width:200, height:200, borderRadius:'50%',
              background:`radial-gradient(circle, rgba(255,180,80,${0.06+i*0.02}) 0%, transparent 70%)`,
              transform:'translate(-50%,-50%)' }}
            animate={{ scale:[1,1.15,1], opacity:[0.6,1,0.6] }}
            transition={{ duration:4+i, repeat:Infinity, delay:i*1.2 }}
          />
        ))}
      </div>

      <motion.div
        style={{ width:'100%', maxWidth:560, margin:'0 24px',
          background:'linear-gradient(160deg,rgba(18,8,28,0.97),rgba(10,5,20,0.99))',
          border:'1px solid rgba(242,168,184,0.18)', borderRadius:32,
          boxShadow:'0 0 100px rgba(242,168,184,0.15), 0 60px 100px rgba(0,0,0,0.8)',
          overflow:'hidden', maxHeight:'88vh', display:'flex', flexDirection:'column' }}
        initial={{ scale:0.85, y:50 }} animate={{ scale:1, y:0 }} exit={{ scale:0.85, y:40, opacity:0 }}
        transition={{ type:'spring', stiffness:200, damping:24 }}
      >
        {/* Warm gradient bar */}
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(242,168,184,0.7),rgba(255,180,80,0.7),rgba(242,168,184,0.7),transparent)' }} />

        <div style={{ padding:'32px 36px', overflowY:'auto', flex:1 }}>
          {/* Title */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <motion.div style={{ fontSize:42, marginBottom:10 }}
              animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity }}>🏮</motion.div>
            <h2 className="font-serif" style={{ fontSize:24, fontWeight:300, color:'#f2a8b8', letterSpacing:'-0.01em' }}>
              Comfort Space
            </h2>
            <p className="font-sans" style={{ fontSize:11, color:'rgba(201,191,232,0.4)', marginTop:6, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              a warm pavilion in the garden
            </p>
          </div>

          {/* Affirmation */}
          <motion.div
            style={{ background:'linear-gradient(135deg,rgba(242,168,184,0.1),rgba(201,191,232,0.06))',
              border:'1px solid rgba(242,168,184,0.18)', borderRadius:22, padding:'24px 28px',
              textAlign:'center', marginBottom:24 }}
            animate={{ boxShadow:['0 0 20px rgba(242,168,184,0.1)','0 0 44px rgba(242,168,184,0.22)','0 0 20px rgba(242,168,184,0.1)'] }}
            transition={{ duration:4, repeat:Infinity }}
          >
            <p className="font-serif" style={{ fontSize:18, fontStyle:'italic', fontWeight:400, color:'#f2a8b8', lineHeight:1.65 }}>
              &ldquo;{a}&rdquo;
            </p>
          </motion.div>

          {/* Days */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 }}>
            <div style={{ background:'rgba(232,201,122,0.08)', border:'1px solid rgba(232,201,122,0.15)', borderRadius:18, padding:'18px', textAlign:'center' }}>
              <div className="font-serif" style={{ fontSize:32, fontWeight:300, color:'#e8c97a', lineHeight:1 }}>{days.toLocaleString()}</div>
              <div className="font-sans" style={{ fontSize:10, color:'rgba(232,201,122,0.55)', marginTop:5, letterSpacing:'0.1em', textTransform:'uppercase' }}>days of spring</div>
            </div>
            <div style={{ background:'rgba(242,168,184,0.07)', border:'1px solid rgba(242,168,184,0.13)', borderRadius:18, padding:'18px', textAlign:'center' }}>
              <div className="font-sans" style={{ fontSize:12, color:'rgba(242,168,184,0.65)', lineHeight:1.5 }}>since</div>
              <div className="font-serif" style={{ fontSize:14, fontWeight:400, color:'#f2a8b8', marginTop:4 }}>{formatDate(new Date(startDate))}</div>
            </div>
          </div>

          {/* Add reason */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(201,191,232,0.42)', marginBottom:8, fontFamily:'Inter,sans-serif' }}>
              Reasons I love you
            </label>
            <textarea className="sakura-textarea" rows={4} placeholder="I love you because..." style={{ fontStyle:'italic' }} />
          </div>
          <button className="btn-sakura" style={{ marginBottom:8 }}>💕 Save this reason</button>

          <p className="font-serif" style={{ textAlign:'center', fontSize:13, fontStyle:'italic', color:'rgba(240,238,252,0.35)', lineHeight:1.8, marginTop:20 }}>
            &ldquo;Every reason you write here becomes a blossom on the tree.&rdquo;
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Constellation View (Evenings / Dreams) ───────────────────────────── */
function ConstellationView({ onClose }: { onClose: () => void }) {
  const constellations = [
    { name: 'Future Home', stars: [[0.3,0.4],[0.45,0.25],[0.6,0.35],[0.5,0.5]], color: '#e8c97a' },
    { name: 'Travel Dreams', stars: [[0.15,0.3],[0.28,0.18],[0.35,0.32]], color: '#a8d0e8' },
    { name: 'Love Story', stars: [[0.7,0.22],[0.82,0.15],[0.75,0.38],[0.88,0.3]], color: '#f2a8b8' },
  ]
  return (
    <motion.div
      className="fixed inset-0 z-40"
      style={{ background:'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(10,5,30,0.92) 0%, rgba(2,2,8,0.97) 100%)', backdropFilter:'blur(4px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    >
      <div style={{ position:'absolute', inset:0, padding:'80px 40px' }}>
        <h2 className="font-serif" style={{ textAlign:'center', fontSize:28, fontWeight:300, color:'rgba(240,238,252,0.8)', marginBottom:8 }}>
          Shared Dreams
        </h2>
        <p className="font-sans" style={{ textAlign:'center', fontSize:12, color:'rgba(201,191,232,0.4)', marginBottom:40, letterSpacing:'0.1em' }}>
          Dreams become constellations in the sky
        </p>

        {/* SVG constellation map */}
        <svg width="100%" height="60%" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet" style={{ position:'absolute', inset:0, padding:'10%' }}>
          {constellations.map(con => (
            <g key={con.name}>
              {/* Lines between stars */}
              {con.stars.slice(0,-1).map((s,i) => (
                <motion.line key={i}
                  x1={con.stars[i][0]} y1={con.stars[i][1]}
                  x2={con.stars[i+1][0]} y2={con.stars[i+1][1]}
                  stroke={con.color} strokeWidth={0.003} strokeOpacity={0.35}
                  initial={{ pathLength:0 }} animate={{ pathLength:1 }}
                  transition={{ delay:0.3+i*0.2, duration:1 }}
                />
              ))}
              {/* Stars */}
              {con.stars.map((s,i) => (
                <motion.circle key={i} cx={s[0]} cy={s[1]} r={0.012}
                  fill={con.color}
                  initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:0.2+i*0.15, type:'spring' }}
                  style={{ filter:`drop-shadow(0 0 6px ${con.color})` }}
                />
              ))}
              {/* Label */}
              <text x={con.stars[0][0]} y={con.stars[0][1]-0.03}
                fill={con.color} fontSize={0.025} textAnchor="middle"
                fontFamily="Playfair Display, serif" opacity={0.7}>
                {con.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Add dream button */}
        <div style={{ position:'absolute', bottom:80, left:'50%', transform:'translateX(-50%)' }}>
          <motion.button
            className="btn-sakura"
            style={{ padding:'13px 32px', borderRadius:100, fontSize:14, minWidth:200 }}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
            ✨ Add to our constellation
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

import { useState, useCallback, useEffect, useMemo } from 'react'

// ── Scatter positions — no index 0 "center" anchor ──────────
const STACK_POS = [
  { x:    0, y:    0, s: 1.000 },
  { x:  115, y:   65, s: 0.972 },
  { x: -130, y:   42, s: 0.944 },
  { x:  145, y:  -58, s: 0.916 },
  { x:  -90, y:  108, s: 0.888 },
  { x:  125, y:  -95, s: 0.860 },
  { x:  -70, y:  -82, s: 0.832 },
]

// Max cards kept in pile at once — oldest auto-removed beyond this
const MAX_PILE = STACK_POS.length

// Deterministic scatter position for a given key (never changes)
function keyPos(key) {
  let h = 5381
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) | 0
  return Math.abs(h) % STACK_POS.length
}

function cardStyle(key, zIndex) {
  const p = STACK_POS[keyPos(key)]
  return {
    transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px)) scale(${p.s})`,
    zIndex,
  }
}

// ── Placeholder SVG ──────────────────────────────────────────
function makePlaceholder(id) {
  const pairs = [
    ['#2E4036','#4A7A5A'],['#5C3A2E','#9B6B50'],['#2A3545','#4A6585'],
    ['#3D2E4A','#6B5A7A'],['#1E2E20','#3A5A3E'],['#4A3520','#8A6A40'],
    ['#2E2A3D','#5A5080'],['#1A2E35','#3A6070'],['#3A2A1E','#7A5A40'],
    ['#2A1E35','#5A4A6A'],['#1E3530','#3A6A60'],['#352A1E','#6A5040'],
    ['#2E3520','#5A6A40'],['#1E2A35','#3A5070'],['#35201E','#6A4040'],
  ]
  const [c1, c2] = pairs[id % pairs.length]
  const n = String(id + 1).padStart(2, '0')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="530"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="530" fill="url(#g)"/><text x="200" y="290" fill="rgba(255,255,255,0.1)" text-anchor="middle" font-size="160" font-family="monospace" font-weight="bold">${n}</text></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// ── Display items ────────────────────────────────────────────
function makeItems(artworks, selectedId) {
  const source = selectedId === null
    ? artworks
    : artworks.filter(a => a.id === selectedId)

  return source.flatMap(a =>
    (a.photos || []).map((photo, i) => ({
      key: `${a.id}-${i}`,
      artworkId: a.id,
      photo,
    }))
  )
}

// ── Image component ──────────────────────────────────────────
function ArtImg({ artworkId, photo, alt = '', ...rest }) {
  const src = photo ? `/artworks/sm/${photo}` : null
  const fallback = makePlaceholder(artworkId)
  const [imgSrc, setImgSrc] = useState(src || fallback)
  useEffect(() => { setImgSrc(src || fallback) }, [photo, artworkId])
  return (
    <img src={imgSrc} onError={() => setImgSrc(fallback)}
      alt={alt} draggable={false} {...rest} />
  )
}

// ── Info panel ───────────────────────────────────────────────
function InfoPanel({ artwork, photoIndex, photoTotal }) {
  if (!artwork) return null
  const [primary, ...alts] = artwork.titles
  return (
    <div className="info-panel">
      <div className="info-titles">
        <div className="info-title">"{primary}"</div>
        {alts.map((alt, i) => (
          <div key={i} className="info-title-alt">
            <span className="info-ou">ou</span>"{alt}"
          </div>
        ))}
      </div>
      <div className="info-meta">
        <div className="info-meta-row">{artwork.year}</div>
        <div className="info-meta-row">{artwork.location}</div>
        <div className="info-meta-row">{artwork.side}</div>
        {photoTotal > 1 && (
          <div className="info-counter">
            {String(photoIndex + 1).padStart(2, '0')} / {String(photoTotal).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gallery stage ────────────────────────────────────────────
function Stage({ allItems, stack, onActivate }) {
  const byKey = Object.fromEntries(allItems.map(it => [it.key, it]))
  return (
    <div className="stage">
      {[...stack].reverse().map((key, revIdx) => {
        const stackIndex = stack.length - 1 - revIdx
        const item = byKey[key]
        if (!item) return null
        return (
          <div
            key={key}
            className={`artwork-card ${stackIndex === 0 ? 'is-front' : 'is-back'}`}
            style={cardStyle(key, stack.length - stackIndex)}
            onClick={stackIndex > 0 ? () => onActivate(key) : undefined}
          >
            <ArtImg artworkId={item.artworkId} photo={item.photo} />
          </div>
        )
      })}
    </div>
  )
}

// ── Thumbnail strip ──────────────────────────────────────────
function ThumbnailStrip({ allItems, stack, onActivate }) {
  const inPile  = new Set(stack)
  const activeKey = stack[0]
  return (
    <aside className="thumbnails">
      {allItems.map((item, i) => (
        <div
          key={item.key}
          className={[
            'thumbnail',
            item.key === activeKey ? 'active' : '',
            inPile.has(item.key) && item.key !== activeKey ? 'in-pile' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => onActivate(item.key)}
        >
          <ArtImg artworkId={item.artworkId} photo={item.photo} alt="" />
          <span className="thumb-num">{String(i + 1).padStart(2, '0')}</span>
        </div>
      ))}
    </aside>
  )
}

// ── Series dropdown ──────────────────────────────────────────
function SeriesDropdown({ artworks, selectedId, onSelect }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="nav-series">
      <div className="nav-label nav-series-trigger" onClick={() => setOpen(o => !o)}>
        Semaforismo <span className="nav-chevron">{open ? '▴' : '▾'}</span>
      </div>
      {open && (
        <div className="nav-dropdown">
          <span
            className={`nav-link ${selectedId === null ? 'active' : ''}`}
            onClick={() => { onSelect(null); setOpen(false) }}
          >
            Todas
          </span>
          {artworks.map(a => (
            <span key={a.id}
              className={`nav-link ${selectedId === a.id ? 'active' : ''}`}
              onClick={() => onSelect(a.id)}>
              {a.titles[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Nav({ artworks, selectedId, onSelect }) {
  return (
    <nav className="nav">
      <div className="nav-brand">Iago<br />Barbosa</div>
      <div className="nav-section">
        <div className="nav-label">Séries</div>
        <SeriesDropdown artworks={artworks} selectedId={selectedId} onSelect={onSelect} />
      </div>
      <div className="nav-section">
        <div className="nav-label">Exposições</div>
        <span className="nav-link active">Biblioteca<br />UFSCar 2025</span>
      </div>
    </nav>
  )
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  const [artworks, setArtworks] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  // stack[0] = front (highest z), capped at MAX_PILE
  const [stack, setStack] = useState([])

  useEffect(() => {
    fetch('/artworks/index.json').then(r => r.json()).then(setArtworks).catch(console.error)
  }, [])

  const allItems = useMemo(() => makeItems(artworks, selectedId), [artworks, selectedId])

  useEffect(() => {
    if (allItems.length > 0) setStack([allItems[0].key])
  }, [allItems])

  const activateItem = useCallback((key) => {
    setStack(prev => {
      let next
      if (prev.includes(key)) {
        // Already in pile → bring to front, nothing else moves
        next = [key, ...prev.filter(k => k !== key)]
      } else {
        // New card → add on top, drop oldest if over limit
        next = [key, ...prev]
        if (next.length > MAX_PILE) next = next.slice(0, MAX_PILE)
      }
      return next
    })
  }, [])

  if (!artworks.length) return null

  const activeKey     = stack[0]
  const activeItem    = allItems.find(it => it.key === activeKey)
  const activeArtwork = artworks.find(a => a.id === activeItem?.artworkId)
  const photoIndex    = activeItem
    ? (activeArtwork?.photos ?? []).indexOf(activeItem.photo) : 0

  return (
    <div className="app">
      <Nav artworks={artworks} selectedId={selectedId} onSelect={setSelectedId} />
      <main className="main">
        <Stage allItems={allItems} stack={stack} onActivate={activateItem} />
        <InfoPanel artwork={activeArtwork} photoIndex={photoIndex}
          photoTotal={activeArtwork?.photos?.length ?? 0} />
      </main>
      <ThumbnailStrip allItems={allItems} stack={stack} onActivate={activateItem} />
    </div>
  )
}

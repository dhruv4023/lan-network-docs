import { useState, useEffect, useRef, useCallback } from 'react'

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

export default function Topbar({ searchQuery, setSearchQuery, searchIndexRef, navigate }) {
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const wrapRef = useRef(null)

  const runSearch = useCallback((query) => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setResults([])
      setShowResults(false)
      return
    }
    const index = searchIndexRef.current || []
    const matches = index
      .filter(item => item.text.toLowerCase().includes(q))
      .slice(0, 8)
    if (!matches.length) {
      setResults([{ type: 'empty' }])
      setShowResults(true)
      return
    }
    setResults(matches.map(m => {
      const idx = m.text.toLowerCase().indexOf(q)
      const before = escapeHtml(m.text.slice(Math.max(0, idx - 30), idx))
      const match = escapeHtml(m.text.slice(idx, idx + q.length))
      const after = escapeHtml(m.text.slice(idx + q.length, idx + q.length + 50))
      return {
        type: 'result',
        ...m,
        html: (idx > 30 ? '\u2026' : '') + before + '<mark class="bg-accent-dim text-accent rounded-sm">' + match + '</mark>' + after + '\u2026',
      }
    }))
    setShowResults(true)
  }, [searchIndexRef])

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleSelect = (item) => {
    const targetPanel = item.el?.closest('[data-tabpanel]')
    navigate(item.routeName, targetPanel ? targetPanel.dataset.tabpanel : null)
    setShowResults(false)
    setSearchQuery('')
    setTimeout(() => {
      const el = item.el
      if (!el) return
      if (el.tagName === 'SUMMARY') el.parentElement.open = true
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.outline = '2px solid var(--color-accent)'
      setTimeout(() => { el.style.outline = '' }, 1600)
    }, 60)
  }

  return (
    <header className="topbar mb-6">
      <div className="search-wrap relative max-w-[520px]" ref={wrapRef}>
        <input
          type="search"
          className="w-full px-3.5 py-2.5 rounded-full border border-line bg-panel text-fg text-sm focus:outline-2 focus:outline-accent focus:outline-offset-1"
          placeholder="Search the guide — e.g. &ldquo;DHCP&rdquo;, &ldquo;self-test&rdquo;, &ldquo;gateway&rdquo;&hellip;"
          aria-label="Search guide content"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            runSearch(e.target.value)
          }}
        />
        {showResults && (
          <div className="search-results absolute top-[calc(100%+6px)] left-0 right-0 bg-panel border border-line rounded-[10px] shadow-lg z-50 max-h-[340px] overflow-y-auto">
            {results.length === 1 && results[0].type === 'empty' ? (
              <div className="px-3.5 py-2.5 text-muted text-sm">No matches found.</div>
            ) : (
              results.map((item, i) => (
                <button
                  key={i}
                  className="block w-full text-left bg-transparent border-none text-fg px-3 py-2.5 cursor-pointer border-b border-line text-xs hover:bg-panel-2 last:border-b-0"
                  onClick={() => handleSelect(item)}
                  dangerouslySetInnerHTML={{
                    __html: item.html + '<span class="block text-[0.7rem] text-muted mt-0.5">in ' + escapeHtml(item.routeTitle) + '</span>'
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </header>
  )
}

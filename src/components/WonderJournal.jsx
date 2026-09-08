import React, { useEffect, useRef } from 'react'

export function journalText(places, visited, buddy) {
  const discovered = places.filter(place => visited.includes(place.id))
  return ['BLOOM JUNIORS - OUR FIELD JOURNAL', `Exploring with Yaagvi and ${buddy.name}`, '',
    ...discovered.flatMap(place => [place.name, place.feedback, `Try together: ${place.together}`, '']),
    discovered.length ? 'A little discovery to take into the world.' : 'Our story is just beginning. Choose a place on the map.',
    'This is a keepsake from the Bloom Juniors free adventure, not a learning assessment.',
  ].join('\n')
}

export default function WonderJournal({ places, visited, buddy, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => { document.body.style.overflow = overflow; if (dialog.open) dialog.close() }
  }, [])
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(journalText(places, visited, buddy))}`
  return <dialog ref={ref} className="field-journal" aria-labelledby="journal-title" onClose={() => { if (!ref.current?.open) onClose() }} onClick={event => { if (event.target === event.currentTarget) ref.current.close() }}>
    <button className="wonder-close" aria-label="Close journal" onClick={() => ref.current.close()}>×</button>
    <header className="journal-heading"><span className="wonder-label">THE THINGS WE NOTICED</span><h2 id="journal-title">Our field journal.</h2><p>Little discoveries with Yaagvi and {buddy.name}.</p><span className={`journal-buddy sidekick sidekick-${buddy.id}`} role="img" aria-label={buddy.label}/></header>
    <div className="journal-pages">{places.map(place => <article key={place.id} className={visited.includes(place.id) ? 'journal-entry discovered' : 'journal-entry'}>
      <span className="journal-stamp" aria-hidden="true">{visited.includes(place.id) ? place.icon : '…'}</span><div><span className="journal-page-number">PAGE {place.number}</span><h3>{place.name}</h3>{visited.includes(place.id) ? <><p>{place.feedback}</p><div className="journal-try"><strong>Try together</strong><p>{place.together}</p></div></> : <p>A blank page for a discovery still to come. Explore this place whenever you feel like it.</p>}</div>
    </article>)}</div>
    <footer className="journal-footer"><p>{visited.length === 3 ? 'Three little discoveries. A whole conversation to take home.' : 'Every little discovery has a place here.'}<small>This journal lasts for this visit. Download a copy to keep it.</small></p><a className="wonder-primary" href={downloadHref} download="bloom-our-discoveries.txt">Keep our discoveries ↓</a></footer>
  </dialog>
}

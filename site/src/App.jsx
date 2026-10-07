import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  if (!res.ok) {
    let message = 'Request failed'
    try { const j = await res.json(); message = j.detail || j.message || j.error || message } catch {}
    throw Error(message)
  }
  return res.status === 204 ? null : res.json()
}

export default function App() {
  const [page, setPage] = useState('events')
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [pass, setPass] = useState(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setEvents(await api('/events')) }
    catch (e) { setNotice(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const register = async form => {
    const result = await api('/registrations/events/' + selected.id, { method: 'POST', body: JSON.stringify(form) })
    setPass(result); setSelected(null); setPage('pass')
    setNotice('Registration successful. Download your pass and keep it safe.')
  }

  return <div className="site">
    <nav className="topbar"><div className="navLinks">
      <button className={page === 'events' ? 'active' : ''} onClick={() => setPage('events')}>Events</button>
      <button className={page === 'cancel' ? 'active' : ''} onClick={() => setPage('cancel')}>Cancel Registration</button>
      <button className={page === 'lost' ? 'active' : ''} onClick={() => setPage('lost')}>Lost &amp; Found</button>
    </div></nav>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <main>
      {loading && page === 'events' ? <div className="empty">Loading events…</div> :
        page === 'events' ? <Events events={events} onRegister={setSelected} /> :
        page === 'cancel' ? <CancelRegistration setNotice={setNotice} /> :
        page === 'lost' ? <LostFound setNotice={setNotice} /> :
        <Pass result={pass} />}
    </main>
    {selected && <RegistrationForm event={selected} close={() => setSelected(null)} submit={register} />}
  </div>
}

function Events({ events, onRegister }) {
  return <section className="page"><h1>Events</h1>
    <div className="eventGrid">{events.map(e => <article className="eventCard" key={e.id}>
      {e.posterData ? <img src={e.posterData} alt={e.title + ' poster'} /> : <div className="noPoster">No poster</div>}
      <div className="eventBody"><h2>{e.title}</h2><p>{e.description}</p><button className="primary" onClick={() => onRegister(e)}>Register</button></div>
    </article>)}</div>
    {!events.length && <div className="empty"><h2>No events available</h2><p>There are no open event registrations right now.</p></div>}
  </section>
}

function RegistrationForm({ event, close, submit }) {
  const [form, setForm] = useState({ name: '', college: '', email: '', phone: '' })
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const send = async e => { e.preventDefault(); setError(''); setBusy(true); try { await submit(form) } catch (x) { setError(x.message) } finally { setBusy(false) } }
  return <div className="modal"><div className="modalCard"><button className="close" onClick={close}>×</button>
    <h2>Register for {event.title}</h2><p className="muted">{event.description}</p>
    <form onSubmit={send}>
      <label>Full name<input required value={form.name} onChange={e => change('name', e.target.value)} /></label>
      <label>College<input required value={form.college} onChange={e => change('college', e.target.value)} /></label>
      <label>Email<input required type="email" value={form.email} onChange={e => change('email', e.target.value)} /></label>
      <label>Phone<input required value={form.phone} onChange={e => change('phone', e.target.value)} /></label>
      {error && <div className="error">{error}</div>}
      <div className="actions"><button type="button" className="outline" onClick={close}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Registering…' : 'Register'}</button></div>
    </form>
  </div></div>
}

function Pass({ result }) {
  const canvasRef = useRef(null)
  useEffect(() => { if (result) QRCode.toCanvas(canvasRef.current, result.passToken, { width: 180, margin: 1 }) }, [result])
  if (!result) return <div className="page empty">No pass to display.</div>
  const download = () => {
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 560
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#272622'; ctx.font = '700 42px Arial'; ctx.fillText('CampusFest Entry Pass', 55, 75)
    ctx.font = '700 28px Arial'; ctx.fillText(result.eventTitle, 55, 140)
    ctx.font = '22px Arial'; ctx.fillText('Participant: ' + result.name, 55, 195); ctx.fillText('College: ' + result.college, 55, 235)
    ctx.fillText('Registration ID: CF-' + result.id, 55, 275); ctx.drawImage(canvasRef.current, 650, 155, 190, 190)
    ctx.font = '18px Arial'; ctx.fillText('Present this QR code at entry.', 55, 360)
    const a = document.createElement('a'); a.download = 'CampusFest-Pass-' + result.id + '.png'; a.href = canvas.toDataURL('image/png'); a.click()
  }
  return <section className="page passPage"><div className="passCard"><h1>Registration Successful</h1><p>Your entry pass is ready.</p>
    <div className="passDetails"><b>{result.eventTitle}</b><span>{result.name}</span><span>{result.college}</span><span>Registration ID: CF-{result.id}</span></div>
    <canvas ref={canvasRef} className="qr" /><button className="primary" onClick={download}>Download Pass Image</button>
  </div></section>
}

function CancelRegistration({ setNotice }) {
  const [file, setFile] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [found, setFound] = useState(null)
  const decode = selected => {
    setFile(selected); setFound(null); setError('')
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(data.data, data.width, data.height)
      if (!code?.data) setError('QR code could not be read. Upload the original downloaded pass image.')
      else setFound(code.data)
    }
    img.onerror = () => setError('Could not read that image.')
    img.src = URL.createObjectURL(selected)
  }
  const cancel = async () => {
    if (!found) return
    if (!confirm('Cancel this registration? This will make the pass invalid.')) return
    setBusy(true)
    try { const result = await api('/registrations/me?passToken=' + encodeURIComponent(found), { method: 'DELETE' }); setNotice(result.message); setFile(null); setFound(null) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <section className="page narrow"><h1>Cancel Registration</h1><p className="muted">Upload the pass image you downloaded after registering. Its QR code identifies your registration.</p>
    <div className="panel"><label>Upload pass image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => e.target.files?.[0] && decode(e.target.files[0])} /></label>
      {file && <p className="muted">{file.name}</p>}
      {found && <div className="found"><b>Registration found</b><span>The pass is ready to be cancelled.</span><button className="danger" disabled={busy} onClick={cancel}>{busy ? 'Cancelling…' : 'Cancel Registration'}</button></div>}
      {error && <div className="error">{error}</div>}
    </div>
  </section>
}

function LostFound({ setNotice }) {
  const [items, setItems] = useState([]), [form, setForm] = useState({ type: 'LOST', item: '', description: '', location: '', contact: '' }), [claim, setClaim] = useState(null), [busy, setBusy] = useState(false), [matches, setMatches] = useState([]), [lostReportId, setLostReportId] = useState(null)
  const load = async () => { try { setItems(await api('/lost-found')) } catch {} }
  useEffect(() => { load() }, [])
  useEffect(() => { if (!lostReportId) return; const poll = async () => { try { const m = await api('/lost-found/' + lostReportId + '/matches'); if (m.length) { setMatches(m); setNotice('Possible match found! A similar item is available at the College Lost & Found Counter.') } } catch {} }; poll(); const timer = setInterval(poll, 10000); return () => clearInterval(timer) }, [lostReportId])
  const submit = async e => {
    e.preventDefault(); setBusy(true)
    try {
      const result = await api('/lost-found', { method: 'POST', body: JSON.stringify(form) })
      setForm({ type: 'LOST', item: '', description: '', location: '', contact: '' })
      setMatches(result.possibleMatches || [])
      if (form.type === 'LOST') setLostReportId(result.report.id)
      setNotice(result.possibleMatches?.length ? 'Possible match found! A similar item is available at the College Lost & Found Counter.' : 'Lost & Found report submitted.')
      load()
    } catch (x) { setNotice(x.message) } finally { setBusy(false) }
  }
  const submitClaim = async e => {
    e.preventDefault(); setBusy(true)
    try {
      const result = await api('/lost-found/' + claim.id + '/claim', { method: 'POST', body: JSON.stringify(claim.form) })
      setNotice(result.message); setClaim(null)
    } catch (x) { setNotice(x.message) } finally { setBusy(false) }
  }
  return <section className="page"><h1>Lost &amp; Found</h1>
    <div className="lostGrid">
      <div className="panel"><h2>Report an item</h2><form onSubmit={submit}>
        <label>Report type<select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="LOST">Lost item</option><option value="FOUND">Found item</option></select></label>
        <label>Item name<input required value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} /></label>
        <label>Description<textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
        <label>Location<input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></label>
        <label>Contact<input required value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></label>
        <button className="primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit report'}</button>
      </form></div>
      <div>
        <div>
          <div className="claimSection">
            <div className="claimHeading"><h2>Lost Items</h2><p className="muted">If you see your lost item here, click Claim Lost Item.</p></div>
            <div className="reports">{items.filter(x => x.type === 'FOUND' && x.status === 'OPEN').map(x => <article className="report foundReport" key={x.id}><span className="tag">ITEM AVAILABLE</span><h3>{x.item}</h3><p>{x.description}</p><small>Available at: College Lost &amp; Found Counter</small><button className="primary claimButton" onClick={() => setClaim({ id:x.id, form:{fullName:''} })}>Claim Lost Item</button></article>)}</div>
            {!items.some(x => x.type === 'FOUND' && x.status === 'OPEN') && <div className="empty">No lost items are currently available.</div>}
          </div>
          {matches.length > 0 && <div className="panel matchPanel"><h3>Possible Match Found</h3><p>Your lost item may be available at the <b>College Lost &amp; Found Counter</b>.</p></div>}
        </div>
      </div>
    </div>
    {claim && <ClaimForm claim={claim} setClaim={setClaim} submit={submitClaim} close={() => setClaim(null)} busy={busy} />}
  </section>
}

function ClaimForm({ claim, setClaim, submit, close, busy }) {
  const change = (key, value) => setClaim(c => ({ ...c, form: { ...c.form, [key]: value } }))
  return <div className="modal"><div className="modalCard"><button className="close" onClick={close}>×</button>
    <span className="badge">CLAIM LOST ITEM</span><h2>Claim Lost Item</h2>
    <p className="muted">Enter your name to claim this item.</p>
    <form onSubmit={submit}>
      <label>Your name<input required value={claim.form.fullName} onChange={e => change('fullName',e.target.value)} /></label>
      <div className="formActions"><button type="button" className="outline" onClick={close}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Submitting…' : 'Claim'}</button></div>
    </form>
  </div></div>
}


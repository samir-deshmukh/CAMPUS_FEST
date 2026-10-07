import { useEffect, useState } from 'react'
import jsQR from 'jsqr'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const TAB_ID = sessionStorage.getItem('campusfest_admin_tab_id') || (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2))
sessionStorage.setItem('campusfest_admin_tab_id', TAB_ID)

function clearAdminSession(){
  sessionStorage.removeItem('campusfest_admin_user')
  sessionStorage.removeItem('campusfest_admin_token')
}

async function heartbeatAdminLock(){
  const token=sessionStorage.getItem('campusfest_admin_token')
  if(!token)return true
  try{
    const res=await fetch(API+'/auth/admin-lock/heartbeat',{method:'POST',headers:{Authorization:'Bearer '+token,'X-Admin-Client-ID':TAB_ID},cache:'no-store'})
    if(res.status===401 || res.status===409){
      clearAdminSession()
      return false
    }
    return true
  }catch{
    return true
  }
}

function releaseAdminLock(){
  const token=sessionStorage.getItem('campusfest_admin_token')
  if(!token)return
  const payload=JSON.stringify({token,clientId:TAB_ID})
  try{
    if(navigator.sendBeacon){
      const blob=new Blob([payload],{type:'text/plain;charset=UTF-8'})
      if(navigator.sendBeacon(API+'/auth/admin-lock/release',blob))return
    }
    fetch(API+'/auth/admin-lock/release',{
      method:'POST',
      headers:{Authorization:'Bearer '+token,'X-Admin-Client-ID':TAB_ID},
      cache:'no-store',
      keepalive:true
    }).catch(()=>{})
  }catch{}
}

const limitWords = (value, max) => {
  if (typeof value !== 'string' || max <= 0) return ''
  let count = 0
  for (let i = 0; i < value.length; i++) {
    if (!/\s/.test(value[i]) && (i === 0 || /\s/.test(value[i - 1]))) {
      count++
      if (count > max) return value.slice(0, i).replace(/\s+$/, '')
    }
  }
  return value
}
async function api(path, options = {}) {
  const token = sessionStorage.getItem('campusfest_admin_token')
  const res = await fetch(API + path, { ...options, headers: { 'Content-Type': 'application/json', 'X-Admin-Client-ID': TAB_ID, ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) } })
  if (!res.ok) {
    let m = 'Request failed'
    try { const j = await res.json(); m = j.detail || j.message || m } catch {}
    if(res.status===401 || res.status===409){ clearAdminSession(); window.dispatchEvent(new CustomEvent('campusfest-admin-lock-lost',{detail:m})) }
    throw Error(m)
  }
  return res.status === 204 ? null : res.json()
}
const nav = [['events','Events'],['registrations','Registrations'],['gallery','Event Gallery'],['lost','Lost & Found']]

export default function App() {
  const [admin,setAdmin]=useState(()=>JSON.parse(sessionStorage.getItem('campusfest_admin_user')||'null'))
  const [page,setPage]=useState('events'), [events,setEvents]=useState([]), [lost,setLost]=useState([]), [notice,setNotice]=useState(''), [editing,setEditing]=useState(null), [selectedEvent,setSelectedEvent]=useState(null)
  useEffect(()=>{
    if(!admin)return
    let alive=true
    const beat=async()=>{
      const ok=await heartbeatAdminLock()
      if(!ok && alive){setAdmin(null);setNotice('Admin panel is active in another browser/tab. Use the tab that signed in.')}
    }
    beat()
    const timer=setInterval(beat,5000)
    const onLockLost=e=>{if(alive){setAdmin(null);setNotice(e.detail||'Admin panel is active in another browser/tab. Use the tab that signed in.')}}
    const release=()=>releaseAdminLock()
    window.addEventListener('campusfest-admin-lock-lost',onLockLost)
    window.addEventListener('pagehide',release)
    return()=>{alive=false;clearInterval(timer);window.removeEventListener('campusfest-admin-lock-lost',onLockLost);window.removeEventListener('pagehide',release)}
  },[admin])
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer)},[notice])
  const load=async()=>{try{const [e,l]=await Promise.all([api('/events/all'),api('/admin/lost-found')]);setEvents(e);setLost(l)}catch(e){if(e.message==='Authentication required'||e.message==='Invalid or expired token'||e.message==='Admin access required'){sessionStorage.removeItem('campusfest_admin_user');sessionStorage.removeItem('campusfest_admin_token');setAdmin(null);return}setNotice(e.message)}}
  useEffect(()=>{if(!admin)return; load(); const timer=setInterval(load,5000); return()=>clearInterval(timer)},[admin])
  if(!admin)return <Login onLogin={u=>{setAdmin(u);sessionStorage.setItem('campusfest_admin_user',JSON.stringify(u));sessionStorage.setItem('campusfest_admin_token',u.token)}}/>
  return <div className="app"><aside><div className="brand"><b>CampusFest</b></div><nav>{nav.map(([id,label])=><button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}>{label}</button>)}</nav></aside><main><header><div><h1>{nav.find(x=>x[0]===page)?.[1]}</h1></div></header>{notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
  {page==='events'&&<Events events={events} edit={setEditing} newEvent={()=>setEditing({})} load={load} notice={setNotice} openRegs={id=>{setSelectedEvent(id);setPage('registrations')}}/>}
  {page==='registrations'&&<Registrations events={events} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent}/>}
  {page==='gallery'&&<Gallery notice={setNotice}/>}
  {page==='lost'&&<LostAdmin rows={lost} load={load} notice={setNotice}/>}
  {editing&&<EventForm event={editing.id?editing:null} close={()=>setEditing(null)} load={load} notice={setNotice}/>}
  </main></div>
}

function Login({onLogin}){const[u,setU]=useState(''),[p,setP]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setErr('');setBusy(true);try{const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Client-ID':TAB_ID},body:JSON.stringify({username:u,password:p})});const j=await r.json();if(!r.ok)throw Error(j.detail||'Invalid credentials');if(j.role!=='ADMIN')throw Error('Administrator access required');onLogin(j)}catch(x){setErr(x.message)}finally{setBusy(false)}};return <div className="capAuth"><div className="capLogin"><div className="capHead"><div className="capMark">CF</div><div><b>CampusFest</b></div></div><div className="capRule"/><span className="badge">ADMIN LOGIN</span><h1>Sign in</h1><p className="capHint">Manage events, registrations and entry verification.</p><form onSubmit={submit}><label>Admin ID<input autoComplete="username" required maxLength="50" value={u} onChange={e=>setU(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required maxLength="100" value={p} onChange={e=>setP(e.target.value)}/></label>{err&&<div className="error">{err}</div>}<button className="primary" disabled={busy}>{busy?'Signing in…':'Login'}</button></form></div></div>}


function Gallery({notice}){
  const [photos,setPhotos]=useState([])
  const [lightbox,setLightbox]=useState(null)
  const [description,setDescription]=useState('')
  const [fileInputKey,setFileInputKey]=useState(0)
  const load=async()=>{try{setPhotos(await api('/admin/event-gallery'))}catch(e){notice(e.message)}}
  useEffect(()=>{load()},[])
  const upload=e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)){notice('Use PNG, JPEG or WebP.');return}if(f.size>2500000){notice('Photo must be 2.5 MB or smaller.');return}const r=new FileReader();r.onload=async()=>{try{await api('/admin/event-gallery',{method:'POST',body:JSON.stringify({photoData:r.result,description})});setDescription('');setFileInputKey(v=>v+1);notice('Photo added.');load()}catch(x){notice(x.message)}};r.readAsDataURL(f)}
  const remove=async id=>{try{await api('/admin/event-gallery/'+id,{method:'DELETE'});notice('Photo deleted.');load()}catch(e){notice(e.message)}}
  return <section className="content"><div className="galleryToolbar"><div><h2>Old Event Photos</h2><p>Add photos from previous college events. These appear on the student Event Gallery.</p></div><div className="galleryAddArea"><textarea value={description} onChange={e=>setDescription(limitWords(e.target.value,150))} maxLength={1500} placeholder="Photo description (optional, up to 150 words)"/><label className="galleryAddButton">+ Add Photo<input key={fileInputKey} type="file" accept="image/png,image/jpeg,image/webp" onChange={upload}/></label></div></div><div className="galleryAdminGrid">{photos.map(p=><div className="galleryAdminCard" key={p.id}><img src={p.photoData} alt="" onClick={()=>setLightbox(p.photoData)}/>{p.description&&<p className="galleryAdminDescription">{p.description}</p>}<button className="galleryDelete" onClick={()=>remove(p.id)}>Delete</button></div>)}</div>{!photos.length&&<div className="empty">No event photos added yet.</div>}{lightbox&&<div className="imageLightbox galleryLightbox" onClick={()=>setLightbox(null)}><button className="close" onClick={()=>setLightbox(null)}>×</button><img src={lightbox} alt="Enlarged event photo" onClick={e=>e.stopPropagation()}/></div>}</section>
}

function Events({events,edit,newEvent,load,notice,openRegs}){const remove=async id=>{if(!confirm('Delete this event?'))return;try{await api('/events/'+id,{method:'DELETE'});notice('Event deleted.');load()}catch(e){notice(e.message)}};const toggle=async e=>{try{await api('/events/'+e.id+'/'+(e.status==='PUBLISHED'?'close':'reopen'),{method:'POST'});notice(e.status==='PUBLISHED'?'Registration closed.':'Registration reopened.');load()}catch(x){notice(x.message)}};return <section className="content"><div className="toolbar"><button className="primary" onClick={newEvent}>+ Post Event</button></div><div className="eventList">{events.map(e=><article className="adminEvent" key={e.id}>{e.posterData?<img src={e.posterData} alt="Poster"/>:<div className="noPoster">No poster</div>}<div><div className="badges"><span className={'badge '+e.status.toLowerCase()}>{e.status}</span></div><h2>{e.title}</h2><p>{e.description}</p></div><div className="actions"><button className="outline" onClick={()=>edit(e)}>Edit</button><button className="outline" onClick={()=>openRegs(e.id)}>Registrations</button>{e.status!=='DRAFT'&&<button className="outline" onClick={()=>toggle(e)}>{e.status==='PUBLISHED'?'Close Registration':'Reopen Registration'}</button>}<button className="danger" onClick={()=>remove(e.id)}>Delete</button></div></article>)}</div>{!events.length&&<div className="empty">No events.</div>}</section>}


function PanelSelect({value,onChange,options,placeholder='Select'}) {
  const [open,setOpen]=useState(false)
  useEffect(()=>{
    const closeMenu=e=>{if(!e.target.closest('.panelSelect'))setOpen(false)}
    document.addEventListener('mousedown',closeMenu)
    return()=>document.removeEventListener('mousedown',closeMenu)
  },[])
  const current=options.find(o=>String(o.value)===String(value))
  return <div className={'panelSelect'+(open?' open':'')}>
    <button type="button" className="panelSelectButton" onClick={()=>setOpen(v=>!v)}>
      <span>{current?.label||placeholder}</span><span className="panelSelectArrow">⌄</span>
    </button>
    {open&&<div className="panelSelectMenu">
      {options.map(o=><button type="button" key={o.value} className={String(o.value)===String(value)?'selected':''} onClick={()=>{onChange(o.value);setOpen(false)}}>{o.label}</button>)}
    </div>}
  </div>
}

function EventForm({event,close,load,notice}){const[form,setForm]=useState({title:event?.title||'',description:event?.description||'',posterData:event?.posterData||'',status:event?.status||'PUBLISHED'});const change=(k,v)=>setForm(f=>({...f,[k]:v}));const file=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2500000){notice('Poster must be 2.5 MB or smaller.');return}const r=new FileReader();r.onload=()=>change('posterData',r.result);r.readAsDataURL(f)};const submit=async e=>{e.preventDefault();try{await api(event?'/events/'+event.id:'/events',{method:event?'PUT':'POST',body:JSON.stringify(form)});notice(event?'Event updated.':'Event posted.');close();load()}catch(x){notice(x.message)}};return <div className="modal"><div className="modalCard"><button className="close" onClick={close}>×</button><span className="badge">{event?'EDIT EVENT':'POST EVENT'}</span><h2>{event?'Edit Event':'Post New Event'}</h2><form onSubmit={submit}><label>Event name<input required value={form.title} onChange={e=>change('title',limitWords(e.target.value,50))}/></label><label>Description<textarea required value={form.description} onChange={e=>change('description',limitWords(e.target.value,150))}/></label><label>Poster<input type="file" accept="image/png,image/jpeg,image/webp" onChange={file}/></label>{form.posterData&&<img className="preview" src={form.posterData} alt="Poster preview"/>}<label>Initial status<PanelSelect value={form.status} onChange={v=>change('status',v)} options={[{value:'PUBLISHED',label:'Open registration'},{value:'DRAFT',label:'Draft'},{value:'CLOSED',label:'Closed registration'}]}/></label><div className="formActions"><button type="button" className="outline" onClick={close}>Cancel</button><button className="primary">{event?'Save Changes':'Post Event'}</button></div></form></div></div>}

function Registrations({events,selectedEvent,setSelectedEvent}){const[rows,setRows]=useState([]),[event,setEvent]=useState(null),[busy,setBusy]=useState(false);useEffect(()=>{if(!selectedEvent){setRows([]);setEvent(null);return}let live=true;let first=true;const refresh=()=>api('/admin/events/'+selectedEvent+'/registrations').then(r=>{if(live){setEvent(r.event);setRows(r.registrations)}}).catch(()=>{if(live&&first){setRows([]);setEvent(null)}}).finally(()=>{if(live&&first){setBusy(false);first=false}});setBusy(true);refresh();const timer=setInterval(refresh,5000);return()=>{live=false;clearInterval(timer)}},[selectedEvent]);return <section className="content"><div className="panelHead"><div><h2>Event registrations</h2><p className="muted">Select an event to view only its registered students.</p></div><PanelSelect value={selectedEvent||''} onChange={v=>setSelectedEvent(v?Number(v):null)} placeholder="Select event" options={events.map(e=>({value:e.id,label:e.title}))}/> </div>{event&&<div className="selectedEvent"><strong>{event.title}</strong><span>{rows.length} registration{rows.length===1?'':'s'}</span></div>}{busy?<div className="empty">Loading registrations…</div>:event&&rows.length?<div className="table"><div className="thead"><b>Student</b><b>Event</b><b>Status</b><b>Entry</b><b>Registered</b></div>{rows.map(r=><div className="tr" key={r.id}><span>{r.name}<small>{r.course} · {r.phone}</small></span><span>{r.eventTitle}</span><span className="badge">{r.status}</span><span className="badge">{r.entryStatus==='ENTERED'?'ENTERED':'NOT ENTERED'}</span><span>{new Date(r.registeredAt).toLocaleString()}</span></div>)}</div>:<div className="empty">{event?'No registrations for this event.':'Choose an event above.'}</div>}</section>}


function LostAdmin({rows,load,notice}) {
  const [openClaim,setOpenClaim]=useState(null)
  const [selectedReport,setSelectedReport]=useState(null)
  const [lightbox,setLightbox]=useState(null)
  const [activeSection,setActiveSection]=useState('pending')
  if(selectedReport){
    const r=rows.find(x=>x.id===selectedReport)
    if(!r){setSelectedReport(null);return null}
    const pending=(r.claims||[]).filter(c=>c.status==='PENDING'), latest=pending[0]
    return <section className="content">
      <div className="detailToolbar"><button className="outline" onClick={()=>setSelectedReport(null)}>← Back to Reports</button><span className="eyebrow">REPORT #{r.id}</span></div>
      <article className="report reportDetail">
        <div className="reportHeader"><div><span className="eyebrow">FOUND REPORT</span><h2>{r.item}</h2></div><div className="badges"><span className="badge">{r.type}</span><span className="badge">{r.status}</span></div></div>
        <div className="reportGrid"><div className="reportField"><span>Found location</span><strong>{r.location}</strong></div><div className="reportField"><span>Reported by</span><strong>{(r.contact||'').split(' | ')[0]}</strong></div><div className="reportField"><span>Reporter mobile</span><strong>{(r.contact||'').split(' | ')[1]||'—'}</strong></div><div className="reportField"><span>Created</span><strong>{r.created_at?new Date(r.created_at).toLocaleString():'—'}</strong></div></div>
        <div className="reportDescription"><span>Description</span><p>{r.description}</p></div>
        {r.found_item_image&&<div className="reportPhoto"><span>Found item photo</span><img className="detailImage" src={r.found_item_image} alt="Found item" onClick={()=>setLightbox(r.found_item_image)}/></div>}
        {latest&&<div className="claimNotice"><div><strong>Claim received</strong><span>{latest.fullName} says this item is theirs.</span></div><button className="primary" onClick={e=>{e.stopPropagation();setOpenClaim(openClaim===latest.id?null:latest.id)}}>{openClaim===latest.id?'Hide Claim':'View Claim'}</button></div>}
        {openClaim&&r.claims.filter(c=>c.id===openClaim).map(c=><div className="claimPanel" key={c.id}><div className="claimPanelHead"><div><h4>Claimant details</h4></div><span className="badge">{c.status}</span></div><div className="reportGrid"><div className="reportField"><span>Full name</span><strong>{c.fullName}</strong></div><div className="reportField"><span>Mobile</span><strong>{c.phone}</strong></div></div>{c.lostWhenWhere&&<div className="reportDescription"><span>Where / when lost</span><p>{c.lostWhenWhere}</p></div>}{c.lostItemImage&&<div className="reportPhoto"><span>Claimant photo</span><img className="detailImage" src={c.lostItemImage} alt="Lost item" onClick={()=>setLightbox(c.lostItemImage)}/></div>}{c.status==='PENDING'&&<div className="actions"><button className="outline" onClick={()=>claimAction(c.id,'reject')}>Reject Claim</button><button className="primary" onClick={()=>claimAction(c.id,'approve')}>Approve &amp; Mark Returned</button></div>}</div>)}
        <div className="actions">{r.status==='PENDING'&&<button className="primary" onClick={e=>{e.stopPropagation();verify(r.id)}}>Verify &amp; Publish</button>}</div>
      </article>
      {lightbox&&<div className="imageLightbox" onClick={()=>setLightbox(null)}><button className="close" onClick={()=>setLightbox(null)}>×</button><img src={lightbox} alt="Enlarged item"/></div>}
    </section>
  }
  const verify=async id=>{try{await api('/admin/lost-found/'+id+'/verify',{method:'POST'});notice('Found item verified and published.');load()}catch(e){notice(e.message)}}
  const claimAction=async(id,action)=>{try{await api('/admin/lost-found/claims/'+id+'/'+action,{method:'POST'});notice(action==='approve'?'Claim approved and item resolved.':'Claim rejected.');setOpenClaim(null);load()}catch(e){notice(e.message)}}
  const renderSection = (title, sectionRows, emptyText) => <section className="lostSection">
    <div className="sectionIntro"><div><h2 className="sectionTitle">{title}</h2><span className="muted">{sectionRows.length} item{sectionRows.length===1?'':'s'}</span></div></div>
    <div className="eventList adminLostList">{sectionRows.map(r=>{
      const pending=(r.claims||[]).filter(c=>c.status==='PENDING'), latest=pending[0]
      return <article className="adminEvent adminLostCard" key={r.id}>
        {r.found_item_image
          ? <img src={r.found_item_image} alt="Found item" className="clickableImage" onClick={()=>setLightbox(r.found_item_image)}/>
          : <div className="noPoster">No image</div>}
        <div className="adminLostInfo">
          <h2>{r.item}</h2>
          <p className="adminLostDescription">{r.description}</p>
          <div className="adminLostMeta"><span><b>Name:</b> {(r.contact||'').split(' | ')[0]||'—'}</span><span><b>No:</b> {(r.contact||'').split(' | ')[1]||'—'}</span><span><b>Item:</b> {r.item}</span></div>
        </div>
        <div className="actions adminLostActions">
          {r.status==='PENDING'&&<button className="primary" onClick={()=>verify(r.id)}>Verify &amp; Publish</button>}
          {latest&&<button className="outline" onClick={()=>setOpenClaim(openClaim===latest.id?null:latest.id)}>{openClaim===latest.id?'Hide Claim':'View Claim'}</button>}
          {r.status==='RESOLVED'&&<span className="muted adminNoAction">No action required</span>}
        </div>
        {openClaim&&(r.claims||[]).filter(c=>c.id===openClaim).map(c=><div className="claimPanel adminLostClaim" key={c.id}>
          <div className="claimPanelHead"><div><h4>Claimant details</h4></div><span className="badge">{c.status}</span></div>
          <div className="reportGrid">
            <div className="reportField"><span>Full name</span><strong>{c.fullName}</strong></div><div className="reportField"><span>Mobile</span><strong>{c.phone}</strong></div>
          </div>
          {c.lostWhenWhere&&<div className="reportDescription"><span>Where / when lost</span><p>{c.lostWhenWhere}</p></div>}
          {c.lostItemImage&&<div className="reportPhoto"><span>Claimant photo</span><img className="claimImage" src={c.lostItemImage} alt="Lost item submitted by claimant"/></div>}
          {c.status==='PENDING'&&<div className="actions"><button className="outline" onClick={()=>claimAction(c.id,'reject')}>Reject Claim</button><button className="primary" onClick={()=>claimAction(c.id,'approve')}>Approve &amp; Mark Returned</button></div>}
        </div>)}
      </article>
    })}</div>
    {!sectionRows.length&&<div className="empty">{emptyText}</div>}
  </section>

  const pendingReports = rows.filter(r=>r.status==='PENDING')
  const claimReceived = rows.filter(r=>r.status==='VERIFIED' && (r.claims||[]).some(c=>c.status==='PENDING'))
  const resolved = rows.filter(r=>r.status==='RESOLVED')
  const verified = rows.filter(r=>r.status==='VERIFIED' && !(r.claims||[]).some(c=>c.status==='PENDING'))
  const sections = [
    ['pending','Pending Verification',pendingReports,'No reports waiting for verification.'],
    ['verified','Verified',verified,'No verified items.'],
    ['claims','Claim Received',claimReceived,'No claims received.'],
    ['resolved','Resolved',resolved,'No resolved items.']
  ]
  const current = sections.find(s=>s[0]===activeSection) || sections[0]

  return <section className="content">
    <div className="lostTabs" role="tablist">
      {sections.map(([id,title,data])=><button key={id} className={activeSection===id?'active':''} onClick={()=>{setActiveSection(id);setOpenClaim(null)}}>{title}<span>{data.length}</span></button>)}
    </div>
    {renderSection(current[1],current[2],current[3])}
    {lightbox&&<div className="imageLightbox" onClick={()=>setLightbox(null)}><button className="close" onClick={()=>setLightbox(null)}>×</button><img src={lightbox} alt="Enlarged item"/></div>}
  </section>
}

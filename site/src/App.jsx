import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const nav = [['events','Events'],['passes','My Passes'],['schedule','Schedule']]

async function api(path, options={}) {
  const token = localStorage.getItem('campusfest_student_token')
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type':'application/json',
      ...(token ? {Authorization:`Bearer ${token}`} : {}),
      ...(options.headers || {})
    }
  })
  if (!res.ok) {
    let msg='Request failed'
    try { const j=await res.json(); msg=j.message||j.error||msg } catch {}
    throw new Error(msg)
  }
  return res.status===204 ? null : res.json()
}

export default function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('campusfest_student_user')||'null'))
  const [page,setPage]=useState('events')
  const [events,setEvents]=useState([])
  const [passes,setPasses]=useState([])
  const [notice,setNotice]=useState('')
  const [loading,setLoading]=useState(false)

  const completeLogin=useCallback((u)=>{
    setUser(u)
    localStorage.setItem('campusfest_student_user',JSON.stringify(u))
    localStorage.setItem('campusfest_student_token',u.token)
  },[])

  const load=useCallback(async()=>{
    setLoading(true)
    try {
      setEvents(await api('/events'))
      if(user) setPasses(await api('/registrations/me'))
    } catch(e) {
      setNotice(e.message)
    } finally {
      setLoading(false)
    }
  },[user])

  useEffect(()=>{ if(user) load() },[user,load])

  if(!user) return <Auth onLogin={completeLogin}/>

  const register=async id=>{
    try {
      await api(`/registrations/events/${id}`,{method:'POST'})
      setNotice('Registration confirmed.')
      await load()
    } catch(e) { setNotice(e.message) }
  }

  const logout=async()=>{
    if(supabase) await supabase.auth.signOut()
    localStorage.removeItem('campusfest_student_user')
    localStorage.removeItem('campusfest_student_token')
    setUser(null)
  }

  return <div className="app">
    <aside>
      <div className="brand"><b>CampusFest</b><span>Student Portal</span></div>
      <div className="identity"><span className="badge">STUDENT</span><strong>{user.name}</strong><small>{user.email}</small></div>
      <nav>{nav.map(([id,label])=><button className={page===id?'active':''} onClick={()=>setPage(id)} key={id}><i>{id==='events'?'◫':id==='passes'?'▣':'◷'}</i>{label}</button>)}</nav>
      <div className="sideBottom"><span className="badge soft">LIVE</span><button className="logout" onClick={logout}>Sign out</button></div>
    </aside>
    <main>
      <header><div><span className="eyebrow">CAMPUSFEST</span><h1>{page==='events'?'Discover events':page==='passes'?'My passes':'Schedule'}</h1></div><span className="badge">{events.length} PUBLISHED EVENTS</span></header>
      {notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      {loading?<div className="empty">Loading live data…</div>:page==='events'?<Events events={events} passes={passes} register={register}/>:page==='passes'?<Passes passes={passes}/>:<Schedule events={events}/>}
    </main>
  </div>
}

function Auth({onLogin}){
  const [err,setErr]=useState('')
  const [busy,setBusy]=useState(false)

  const exchangeSession=useCallback(async(session)=>{
    setBusy(true)
    setErr('')
    try {
      const j=await api('/auth/supabase',{
        method:'POST',
        body:JSON.stringify({accessToken:session.access_token})
      })
      onLogin(j)
    } catch(x) {
      setErr(x.message)
      if(supabase) await supabase.auth.signOut()
    } finally {
      setBusy(false)
    }
  },[onLogin])

  useEffect(()=>{
    if(!supabase){
      setErr('Supabase authentication is not configured for this deployment.')
      return
    }
    let active=true
    supabase.auth.getSession().then(({data,error})=>{
      if(error){setErr(error.message);return}
      if(active && data.session) exchangeSession(data.session)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(active && event==='SIGNED_IN' && session) exchangeSession(session)
    })
    return()=>{active=false;subscription.unsubscribe()}
  },[exchangeSession])

  const signIn=async()=>{
    if(!supabase){setErr('Supabase authentication is not configured.');return}
    setBusy(true)
    setErr('')
    const {error}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin}
    })
    if(error){setErr(error.message);setBusy(false)}
  }

  return <div className="auth">
    <div className="authCard">
      <div className="brand"><b>CampusFest</b><span>Student Portal</span></div>
      <span className="badge">STUDENT LOGIN</span>
      <h1>Continue with Google</h1>
      <p>Use your Google account. A student account is created automatically the first time you sign in.</p>
      {err&&<div className="error">{err}</div>}
      <button className="googleCta" onClick={signIn} disabled={busy}>
        {busy?'Connecting…':'Continue with Google'}
      </button>
      <div className="authNote"><span className="badge soft">SECURE</span><span>Authentication is handled by Supabase.</span></div>
    </div>
  </div>
}

function Events({events,passes,register}){
  const ids=new Set(passes.map(p=>p.eventId))
  return <section className="content"><div className="grid">
    {events.map(e=><article className="card" key={e.id}>
      {e.posterData?<img className="poster" src={e.posterData} alt="Event poster"/>:<div className="poster emptyPoster"><span className="badge">NO POSTER</span></div>}
      <div className="cardBody"><span className="badge">{e.category}</span><h2>{e.title}</h2><p>{e.description}</p><div className="meta"><span>◷ {new Date(e.startTime).toLocaleString()}</span><span>⌖ {e.venue}</span><span>Seats: {e.capacity}</span></div><button disabled={ids.has(e.id)} className={ids.has(e.id)?'success':'primary'} onClick={()=>register(e.id)}>{ids.has(e.id)?'Registered ✓':'Register for event'}</button></div>
    </article>)}
  </div>{!events.length&&<div className="empty"><h2>No published events yet</h2><p>The administrator has not published an event.</p></div>}</section>
}

function Passes({passes}){
  return <section className="content"><div className="grid">{passes.filter(p=>p.status==='ACTIVE').map(p=><div className="card pass" key={p.id}><span className="badge">ACTIVE PASS</span><h2>{p.eventTitle}</h2><p>Registered {new Date(p.registeredAt).toLocaleString()}</p><div className="passCode">REG-{p.id}</div></div>)}</div>{!passes.length&&<div className="empty"><h2>No passes yet</h2><p>Register for a published event and your pass will appear here.</p></div>}</section>
}

function Schedule({events}){
  return <section className="content"><div className="schedule">{events.map(e=><div className="scheduleRow" key={e.id}><span className="badge">{e.category}</span><div><b>{e.title}</b><small>{new Date(e.startTime).toLocaleString()} · {e.venue}</small></div></div>)}</div>{!events.length&&<div className="empty">No schedule is published yet.</div>}</section>
}

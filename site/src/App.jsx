import { useState } from 'react'
import './App.css'

const events = [
  { id: 1, title: 'Battle of Bands', cat: 'Cultural', date: '18 Oct', time: '5:00 PM', venue: 'Main Auditorium', seats: 120, joined: 84, icon: '♫' },
  { id: 2, title: 'Code Sprint', cat: 'Technical', date: '19 Oct', time: '10:00 AM', venue: 'Computer Lab 2', seats: 60, joined: 47, icon: '</>' },
  { id: 3, title: 'Street Play', cat: 'Cultural', date: '19 Oct', time: '3:30 PM', venue: 'Open Amphitheatre', seats: 100, joined: 63, icon: '✦' },
  { id: 4, title: 'Robo Race', cat: 'Technical', date: '20 Oct', time: '11:00 AM', venue: 'Innovation Block', seats: 40, joined: 28, icon: '◈' },
  { id: 5, title: 'Photography Walk', cat: 'Arts', date: '20 Oct', time: '4:00 PM', venue: 'Campus Gate', seats: 50, joined: 31, icon: '◉' },
  { id: 6, title: 'Quiz Arena', cat: 'Academic', date: '21 Oct', time: '2:00 PM', venue: 'Seminar Hall', seats: 80, joined: 56, icon: '?' },
]
const results = [
  ['Battle of Bands', 'Team Resonance', '91.5', '1'],
  ['Battle of Bands', 'The Frequency', '88.0', '2'],
  ['Code Sprint', 'Byte Force', '94.0', '1'],
]
const nav = [
  ['home','Overview'], ['events','Events'], ['schedule','Schedule'], ['passes','My Passes'],
  ['results','Results'], ['map','Campus Map'], ['lost','Lost & Found'], ['profile','Profile']
]

function App() {
  const [page, setPage] = useState('home')
  const [registered, setRegistered] = useState([2])
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPass, setSelectedPass] = useState(null)

  const go = (p) => setPage(p)
  const register = (id) => {
    if (registered.includes(id)) { setNotice('You are already registered for this event.'); setPage('passes'); return }
    const event = events.find(e => e.id === id)
    if (event && event.joined >= event.seats) { setNotice('Registration is full for this event.'); return }
    setRegistered([...registered, id])
    setNotice('Registration confirmed. Your event pass is ready.')
    setPage('passes')
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">CF</div><div><b>CampusFest</b><span>Smart Event Platform</span></div></div>
      <div className="roleBox"><small>STUDENT PORTAL</small><div className="studentMode">CampusFest Student</div></div>
      <nav>{nav.map(([id,label]) => <button key={id} className={page===id?'active':''} onClick={()=>go(id)}><i>{icons[id] || '◆'}</i>{label}</button>)}</nav>
      <div className="sideBottom"><div className="miniUser" onClick={()=>go('profile')}><div className="avatar">SN</div><div><b>Samir N.</b><span>BCA · 2nd Year</span></div></div><button className="logout" onClick={()=>{setPage('home');setRegistered([]);setNotice('Demo session reset.')}}>Sign out</button></div>
    </aside>

    <main>
      <header><div className="mobileBrand">CampusFest</div><div className="search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setPage('events')}}} placeholder="Search events, venues, results..." /></div><div className="headerActions"><button className="bell" onClick={()=>setNotice('You have 2 demo notifications: registration confirmed and results published.')}>♢</button><button className="userPill" onClick={()=>go('profile')}><span className="avatar small">SN</span> Samir <span>⌄</span></button></div></header>
      {notice && <div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      {page==='home' && <Home go={go} registered={registered} onDetails={setSelectedEvent} />}
      {page==='events' && <Events registered={registered} register={register} query={query} setQuery={setQuery} onDetails={setSelectedEvent} />}
      {page==='schedule' && <Schedule onDetails={setSelectedEvent} />}
      {page==='passes' && <Passes registered={registered} onView={setSelectedPass} onBrowse={()=>go('events')} />}
      {page==='results' && <Results />}
      {page==='map' && <CampusMap />}
      {page==='lost' && <LostFound />}
      {page==='profile' && <Profile />}
      {selectedEvent && <EventDetails e={selectedEvent} registered={registered.includes(selectedEvent.id)} onRegister={()=>{register(selectedEvent.id);setSelectedEvent(null)}} onClose={()=>setSelectedEvent(null)} />}
      {selectedPass && <PassDetails e={selectedPass} onClose={()=>setSelectedPass(null)} />}
    </main>
  </div>
}

const icons={home:'⌂',events:'◫',schedule:'◷',passes:'▣',results:'◆',map:'⌖',lost:'♢',profile:'○'}

function Home({go,registered,onDetails}) {
 return <section className="content">
  <div className="heroPanel"><div><span className="eyebrow">ANNUAL COLLEGE FEST · 2026</span><h1>One campus.<br/><em>Every experience.</em></h1><p>Discover competitions, cultural events, workshops and campus activities — all in one place.</p><button className="primary" onClick={()=>go('events')}>Explore events <span>→</span></button></div><div className="heroArt"><div className="orbit one"></div><div className="orbit two"></div><strong>CF</strong></div></div>
  <div className="sectionHead"><div><h2>Happening this week</h2><p>Popular events with seats available</p></div><button className="linkBtn" onClick={()=>go('events')}>View all →</button></div>
  <div className="eventGrid">{events.slice(0,3).map(e=><EventCard key={e.id} e={e} registered={registered.includes(e.id)} onRegister={()=>go('events')} onDetails={onDetails} />)}</div>
  <div className="stats"><Stat n="24" l="Events"/><Stat n="1,240" l="Students registered"/><Stat n="18" l="Competitions"/><Stat n="36" l="Campus venues"/></div>
 </section>
}
function Stat({n,l}){return <div><b>{n}</b><span>{l}</span></div>}

function Events({registered,register,query,setQuery,onDetails}) {
 const [filter,setFilter]=useState('All')
 const list=(filter==='All'?events:events.filter(e=>e.cat===filter)).filter(e=>(e.title+' '+e.cat+' '+e.venue).toLowerCase().includes((query||'').toLowerCase()))
 return <section className="content"><PageTitle title="Events" sub="Find your next campus experience." />
 <div className="filters"><input value={query||''} onChange={e=>setQuery(e.target.value)} placeholder="⌕  Search events..." /><div>{['All','Cultural','Technical','Arts','Academic'].map(x=><button className={filter===x?'selected':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
 <div className="eventGrid wide">{list.map(e=><EventCard key={e.id} e={e} registered={registered.includes(e.id)} onRegister={()=>register(e.id)} onDetails={onDetails} />)}</div></section>
}
function EventCard({e,registered,onRegister,onDetails}){return <article className="eventCard" onClick={()=>onDetails?.(e)}><div className={'eventIcon '+e.cat.toLowerCase()}>{e.icon}</div><div className="eventBody"><div className="tag">{e.cat}</div><h3>{e.title}</h3><p>◷ {e.date} · {e.time}</p><p>⌖ {e.venue}</p><div className="capacity"><span>{e.joined}/{e.seats} registered</span><div><i style={{width:(e.joined/e.seats*100)+'%'}}></i></div></div><button className={registered?'registered':'primary'} onClick={evt=>{evt.stopPropagation();onRegister()}}>{registered?'Registered ✓':'Register now →'}</button></div></article>}

function EventDetails({e,registered,onRegister,onClose}){return <div className="modalBackdrop" onClick={onClose}><div className="eventModal" onClick={x=>x.stopPropagation()}><button className="modalClose" onClick={onClose}>×</button><div className={'eventIcon '+e.cat.toLowerCase()}>{e.icon}</div><span className="tag">{e.cat}</span><h2>{e.title}</h2><p>{e.date} · {e.time} · {e.venue}</p><p>This event is part of CampusFest 2026. Registration is available while capacity remains.</p><button className={registered?'registered':'primary'} onClick={onRegister}>{registered?'Already registered ✓':'Register now →'}</button></div></div>}
function PageTitle({title,sub}){return <div className="pageTitle"><div><span className="eyebrow">CAMPUSFEST</span><h1>{title}</h1><p>{sub}</p></div><span className="dateChip">18–21 OCT 2026</span></div>}
function Schedule({onDetails}){return <section className="content"><PageTitle title="Master schedule" sub="Everything happening across campus."/><div className="schedule">{['18 OCT','19 OCT','20 OCT','21 OCT'].map((d,i)=><div className="day" key={d}><b>{d}</b><div onClick={()=>onDetails?.(events[i])}><strong>{events[i].time}</strong><span>{events[i].title}</span><small>{events[i].venue}</small></div><div onClick={()=>onDetails?.(events[(i+2)%events.length])}><strong>{events[(i+2)%events.length].time}</strong><span>{events[(i+2)%events.length].title}</span><small>{events[(i+2)%events.length].venue}</small></div></div>)}</div></section>}
function Passes({registered,onView,onBrowse}){const list=events.filter(e=>registered.includes(e.id));return <section className="content"><PageTitle title="My passes" sub="Your entry passes and registered events."/>{list.length?<div className="passGrid">{list.map(e=><div className="pass" key={e.id}><div className="passTop"><span className="tag">{e.cat}</span><span>ACTIVE</span></div><h2>{e.title}</h2><p>{e.date} · {e.time}</p><div className="qr">{qr}</div><div className="passCode">CF26-{String(e.id).padStart(4,'0')}-A81X</div><button className="outline" onClick={()=>onView(e)}>View full pass</button></div>)}</div>:<div className="listCard"><h2>No active passes</h2><p>Register for an event to generate your demo entry pass.</p><button className="primary" onClick={onBrowse}>Browse events →</button></div>}</section>}
function PassDetails({e,onClose}){return <div className="modalBackdrop" onClick={onClose}><div className="eventModal" onClick={x=>x.stopPropagation()}><button className="modalClose" onClick={onClose}>×</button><span className="tag">ACTIVE PASS</span><h2>{e.title}</h2><p>{e.date} · {e.time} · {e.venue}</p><div className="qr">{qr}</div><p className="passCode">CF26-{String(e.id).padStart(4,'0')}-A81X</p><button className="primary" onClick={onClose}>Done</button></div></div>}
const qr='▦ ▦ ▦\n▦   ▦ ▦\n▦ ▦ ▦ ▦\n▦ ▦   ▦\n▦ ▦ ▦ ▦'
function Results(){const [filter,setFilter]=useState('All');const names=['All',...new Set(results.map(r=>r[0]))];const list=filter==='All'?results:results.filter(r=>r[0]===filter);return <section className="content"><PageTitle title="Official results" sub="Published results from completed competitions."/><div className="resultNotice"><b>Results are official</b><span>Scores are calculated from submitted competition evaluations. Tied participants share the same rank.</span></div><div className="filters"><div>{names.map(x=><button className={filter===x?'selected':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div><div className="results">{list.map(r=><div className="resultRow" key={r[0]+r[1]} onClick={()=>alert(`${r[0]} — ${r[1]} scored ${r[2]}/100`)}><b>0{r[3]}</b><div><strong>{r[1]}</strong><small>{r[0]}</small></div><strong>{r[2]} <small>/ 100</small></strong></div>)}</div></section>}
function CampusMap(){const [venue,setVenue]=useState(null);const venues=['Main Auditorium','Computer Lab 2','Open Amphitheatre','Innovation Block','Seminar Hall','Exhibition Zone'];return <section className="content"><PageTitle title="Campus map" sub="Find event venues and exhibition spaces."/><div className="map"><div className="mapGrid">{venues.map((x,i)=><button className={'pin p'+i} onClick={()=>setVenue(x)} key={x}><span>●</span><b>{x}</b></button>)}</div><div className="mapLegend"><b>Venue directory</b>{venues.map(x=><button className="linkBtn" key={x} onClick={()=>setVenue(x)}>⌖ {x}</button>)}</div></div>{venue&&<div className="modalBackdrop" onClick={()=>setVenue(null)}><div className="eventModal" onClick={e=>e.stopPropagation()}><button className="modalClose" onClick={()=>setVenue(null)}>×</button><span className="tag">VENUE</span><h2>{venue}</h2><p>CampusFest venue information</p><p>Open the schedule or Events page to see activities assigned to this venue.</p><button className="primary" onClick={()=>setVenue(null)}>Done</button></div></div>}</section>}
function LostFound(){const [sent,setSent]=useState(false);const [item,setItem]=useState('');const [place,setPlace]=useState('');const [details,setDetails]=useState('');const [reports,setReports]=useState(['Black wallet · Library','USB drive · Computer Lab 2','Water bottle · Auditorium']);const submit=()=>{if(!item.trim()||!place.trim()){setSent(false);return}setReports([`${item.trim()} · ${place.trim()}`,...reports]);setItem('');setPlace('');setDetails('');setSent(true)};return <section className="content"><PageTitle title="Lost & Found" sub="Report an item or check recent reports."/><div className="twoCol"><div className="formCard"><h2>Report an item</h2><label>Item name<input value={item} onChange={e=>setItem(e.target.value)} placeholder="e.g. Blue notebook"/></label><label>Last seen at<input value={place} onChange={e=>setPlace(e.target.value)} placeholder="Venue or location"/></label><label>Details<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Add useful details..."/></label><button className="primary" onClick={submit}>{sent?'Report submitted ✓':'Submit report →'}</button>{!sent&&!item.trim()&&<small>Enter an item name and location before submitting.</small>}</div><div className="listCard"><h2>Recent reports</h2>{reports.map((x,i)=><p className="report" key={x+i}>○ {x}<small>{i===0&&sent?'Just now':'Reported today'}</small></p>)}</div></div></section>}
function Profile(){const [editing,setEditing]=useState(false);const [name,setName]=useState('Samir Narendra');const [email,setEmail]=useState('samir@student.edu');return <section className="content"><PageTitle title="Profile" sub="Manage your CampusFest account."/><div className="profileCard"><div className="bigAvatar">SN</div>{editing?<><label>Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input value={email} onChange={e=>setEmail(e.target.value)}/></label></>:<><h2>{name}</h2><p>BCA · Computer Applications</p><div className="profileGrid"><span>Email<strong>{email}</strong></span><span>Year<strong>Second Year</strong></span><span>Events joined<strong>1</strong></span><span>Certificates<strong>3</strong></span></div></>}<button className="outline" onClick={()=>setEditing(!editing)}>{editing?'Save profile':'Edit profile'}</button></div></section>}


export default App

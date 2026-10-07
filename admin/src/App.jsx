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
  const [role, setRole] = useState('Student')
  const [registered, setRegistered] = useState([2])
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)

  const go = (p) => setPage(p)
  const register = (id) => {
    if (!registered.includes(id)) {
      setRegistered([...registered, id])
      setNotice('Registration confirmed. Your event pass is ready.')
      setPage('passes')
    }
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brandMark">CF</div><div><b>CampusFest</b><span>Smart Event Platform</span></div></div>
      <div className="roleBox"><small>VIEW AS</small><select value={role} onChange={e => setRole(e.target.value)}><option>Student</option><option>Organizer</option><option>Judge</option></select></div>
      <nav>{nav.map(([id,label]) => <button key={id} className={page===id?'active':''} onClick={()=>go(id)}><i>{icons[id]}</i>{label}</button>)}</nav>
      <div className="sideBottom"><div className="miniUser"><div className="avatar">SN</div><div><b>Samir N.</b><span>BCA · 2nd Year</span></div></div><button className="logout">Sign out</button></div>
    </aside>

    <main>
      <header><div className="mobileBrand">CampusFest</div><div className="search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, venues, results..." /></div><div className="headerActions"><button className="bell">♢</button><button className="userPill"><span className="avatar small">SN</span> Samir <span>⌄</span></button></div></header>
      {notice && <div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
      {role !== 'Student' ? <RoleDashboard role={role} go={go} /> : <>
        {page==='home' && <Home go={go} registered={registered} />}
        {page==='events' && <Events registered={registered} register={register} query={query} setQuery={setQuery} onDetails={setSelectedEvent} />}
        {page==='schedule' && <Schedule />}
        {page==='passes' && <Passes registered={registered} />}
        {page==='results' && <Results />}
        {page==='map' && <CampusMap />}
        {page==='lost' && <LostFound />}
        {page==='profile' && <Profile />}
      </>}
      {selectedEvent && <EventDetails e={selectedEvent} registered={registered.includes(selectedEvent.id)} onRegister={()=>{register(selectedEvent.id);setSelectedEvent(null)}} onClose={()=>setSelectedEvent(null)} />}
    </main>
  </div>
}

const icons={home:'⌂',events:'◫',schedule:'◷',passes:'▣',results:'◆',map:'⌖',lost:'♢',profile:'○'}

function Home({go,registered}) {
 return <section className="content">
  <div className="heroPanel"><div><span className="eyebrow">ANNUAL COLLEGE FEST · 2026</span><h1>One campus.<br/><em>Every experience.</em></h1><p>Discover competitions, cultural events, workshops and campus activities — all in one place.</p><button className="primary" onClick={()=>go('events')}>Explore events <span>→</span></button></div><div className="heroArt"><div className="orbit one"></div><div className="orbit two"></div><strong>CF</strong></div></div>
  <div className="sectionHead"><div><h2>Happening this week</h2><p>Popular events with seats available</p></div><button className="linkBtn" onClick={()=>go('events')}>View all →</button></div>
  <div className="eventGrid">{events.slice(0,3).map(e=><EventCard key={e.id} e={e} registered={registered.includes(e.id)} onRegister={()=>go('events')} onDetails={null} />)}</div>
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
function EventCard({e,registered,onRegister,onDetails}){return <article className="eventCard" onClick={()=>onDetails?.(e)}><div className={'eventIcon '+e.cat.toLowerCase()}>{e.icon}</div><div className="eventBody"><div className="tag">{e.cat}</div><h3>{e.title}</h3><p>◷ {e.date} · {e.time}</p><p>⌖ {e.venue}</p><div className="capacity"><span>{e.joined}/{e.seats} registered</span><div><i style={{width:(e.joined/e.seats*100)+'%'}}></i></div></div><button className={registered?'registered':'primary'} onClick={e=>{e.stopPropagation();onRegister()}}>{registered?'Registered ✓':'Register now →'}</button></div></article>}

function EventDetails({e,registered,onRegister,onClose}){return <div className="modalBackdrop" onClick={onClose}><div className="eventModal" onClick={x=>x.stopPropagation()}><button className="modalClose" onClick={onClose}>×</button><div className={'eventIcon '+e.cat.toLowerCase()}>{e.icon}</div><span className="tag">{e.cat}</span><h2>{e.title}</h2><p>{e.date} · {e.time} · {e.venue}</p><p>This event is part of CampusFest 2026. Registration is available while capacity remains.</p><button className={registered?'registered':'primary'} onClick={onRegister}>{registered?'Already registered ✓':'Register now →'}</button></div></div>}
function PageTitle({title,sub}){return <div className="pageTitle"><div><span className="eyebrow">CAMPUSFEST</span><h1>{title}</h1><p>{sub}</p></div><span className="dateChip">18–21 OCT 2026</span></div>}
function Schedule(){return <section className="content"><PageTitle title="Master schedule" sub="Everything happening across campus."/><div className="schedule">{['18 OCT','19 OCT','20 OCT','21 OCT'].map((d,i)=><div className="day" key={d}><b>{d}</b><div><strong>{events[i].time}</strong><span>{events[i].title}</span><small>{events[i].venue}</small></div><div><strong>{events[(i+2)%events.length].time}</strong><span>{events[(i+2)%events.length].title}</span><small>{events[(i+2)%events.length].venue}</small></div></div>)}</div></section>}
function Passes({registered}){return <section className="content"><PageTitle title="My passes" sub="Your entry passes and registered events."/><div className="passGrid">{events.filter(e=>registered.includes(e.id)).map(e=><div className="pass" key={e.id}><div className="passTop"><span className="tag">{e.cat}</span><span>ACTIVE</span></div><h2>{e.title}</h2><p>{e.date} · {e.time}</p><div className="qr">{qr}</div><div className="passCode">CF26-{String(e.id).padStart(4,'0')}-A81X</div><button className="outline">View full pass</button></div>)}</div></section>}
const qr='▦ ▦ ▦\n▦   ▦ ▦\n▦ ▦ ▦ ▦\n▦ ▦   ▦\n▦ ▦ ▦ ▦'
function Results(){return <section className="content"><PageTitle title="Official results" sub="Published results from completed competitions."/><div className="resultNotice"><b>Results are official</b><span>Scores are calculated from submitted judge evaluations. Tied participants share the same rank.</span></div><div className="results">{results.map((r,i)=><div className="resultRow" key={i}><b>0{r[3]}</b><div><strong>{r[1]}</strong><small>{r[0]}</small></div><strong>{r[2]} <small>/ 100</small></strong></div>)}</div></section>}
function CampusMap(){return <section className="content"><PageTitle title="Campus map" sub="Find event venues and exhibition spaces."/><div className="map"><div className="mapGrid">{['Main Auditorium','Computer Lab 2','Open Amphitheatre','Innovation Block','Seminar Hall','Exhibition Zone'].map((x,i)=><div className={'pin p'+i} key={x}><span>●</span><b>{x}</b></div>)}</div><div className="mapLegend"><b>Venue directory</b><p>⌖ Main Auditorium · Central Campus</p><p>⌖ Innovation Block · East Wing</p><p>⌖ Exhibition Zone · North Lawn</p></div></div></section>}
function LostFound(){const [sent,setSent]=useState(false);return <section className="content"><PageTitle title="Lost & Found" sub="Report an item or check recent reports."/><div className="twoCol"><div className="formCard"><h2>Report an item</h2><label>Item name<input placeholder="e.g. Blue notebook"/></label><label>Last seen at<input placeholder="Venue or location"/></label><label>Details<textarea placeholder="Add useful details..."/></label><button className="primary" onClick={()=>setSent(true)}>{sent?'Report submitted ✓':'Submit report →'}</button></div><div className="listCard"><h2>Recent reports</h2>{['Black wallet · Library','USB drive · Computer Lab 2','Water bottle · Auditorium'].map(x=><p className="report" key={x}>○ {x}<small>Reported today</small></p>)}</div></div></section>}
function Profile(){return <section className="content"><PageTitle title="Profile" sub="Manage your CampusFest account."/><div className="profileCard"><div className="bigAvatar">SN</div><h2>Samir Narendra</h2><p>BCA · Computer Applications</p><div className="profileGrid"><span>Email<strong>samir@student.edu</strong></span><span>Year<strong>Second Year</strong></span><span>Events joined<strong>1</strong></span><span>Certificates<strong>3</strong></span></div><button className="outline">Edit profile</button></div></section>}

function RoleDashboard({role,go}){const judge=role==='Judge';return <section className="content"><PageTitle title={judge?'Judge workspace':'Organizer dashboard'} sub={judge?'Evaluate assigned competitions securely.':'Manage the fest from one place.'}/><div className="dashStats"><Stat n={judge?'3':'24'} l={judge?'Assigned competitions':'Total events'}/><Stat n={judge?'18':'1,240'} l={judge?'Pending evaluations':'Registrations'}/><Stat n={judge?'7':'8'} l={judge?'Submitted today':'Active venues'}/></div><div className="dashboardGrid"><div className="listCard"><h2>{judge?'Assigned competitions':'Event operations'}</h2>{(judge?['Battle of Bands · 12 participants','Code Sprint · 18 participants','Street Play · 9 teams']:['Registrations · 1,240 total','QR check-ins · 684 today','Announcements · 6 scheduled','Certificates · 312 issued']).map(x=><p className="report" key={x}>◆ {x}<small>Open workspace →</small></p>)}</div><div className="actionCard"><span className="eyebrow">QUICK ACTION</span><h2>{judge?'Start evaluation':'Publish an event result'}</h2><p>{judge?'Open an assigned competition and score each criterion.':'Review completed judging and publish official rankings.'}</p><button className="primary" onClick={()=>go(judge?'results':'events')}>{judge?'Open evaluations →':'Manage events →'}</button></div></div></section>}

export default App

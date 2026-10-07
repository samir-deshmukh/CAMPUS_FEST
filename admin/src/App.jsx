import { useState } from 'react'
import './App.css'

const events = [
  {id:1,title:'Battle of Bands',cat:'Cultural',date:'18 Oct',time:'5:00 PM',venue:'Main Auditorium',registered:84,capacity:120,status:'Published'},
  {id:2,title:'Code Sprint',cat:'Technical',date:'19 Oct',time:'10:00 AM',venue:'Computer Lab 2',registered:47,capacity:60,status:'Published'},
  {id:3,title:'Street Play',cat:'Cultural',date:'19 Oct',time:'3:30 PM',venue:'Open Amphitheatre',registered:63,capacity:100,status:'Published'},
  {id:4,title:'Robo Race',cat:'Technical',date:'20 Oct',time:'11:00 AM',venue:'Innovation Block',registered:28,capacity:40,status:'Draft'},
  {id:5,title:'Photography Walk',cat:'Arts',date:'20 Oct',time:'4:00 PM',venue:'Campus Gate',registered:31,capacity:50,status:'Published'}
]
const results=[['Battle of Bands','Team Resonance','91.5','1'],['Battle of Bands','The Frequency','88.0','2'],['Code Sprint','Byte Force','94.0','1']]
const nav=[['dashboard','Dashboard'],['events','Events & Registrations'],['results','Competitions & Results'],['students','Students'],['venues','Venues'],['lost','Lost & Found'],['settings','Settings']]

export default function App(){
 const [page,setPage]=useState('dashboard'); const [notice,setNotice]=useState('')
 return <div className="app adminApp">
  <aside className="sidebar">
   <div className="brand"><div className="brandMark">CF</div><div><b>CampusFest</b><span>Administrator Console</span></div></div>
   <div className="adminIdentity"><small>ADMINISTRATOR</small><strong>CampusFest Admin</strong><span>Full platform control</span></div>
   <nav>{nav.map(([id,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><i>{icons[id]}</i>{label}</button>)}</nav>
   <div className="sideBottom"><div className="secure"><b>● System secure</b><span>Single admin workspace</span></div><button className="logout" onClick={()=>setNotice('Admin session ended in this demo.')}>Sign out</button></div>
  </aside>
  <main>
   <header><div className="mobileBrand">CampusFest Admin</div><div className="search">⌕ <input placeholder="Search students, events, registrations..." /></div><div className="headerActions"><span className="live">● ADMIN</span><button className="userPill"><span className="avatar small">AD</span> Admin</button></div></header>
   {notice&&<div className="toast">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
   {page==='dashboard'&&<Dashboard go={setPage}/>}
   {page==='events'&&<EventsAdmin setNotice={setNotice}/>}
   {page==='results'&&<ResultsAdmin setNotice={setNotice}/>}
   {page==='students'&&<Students/>}
   {page==='venues'&&<Venues/>}
   {page==='lost'&&<LostFoundAdmin setNotice={setNotice}/>}
   {page==='settings'&&<Settings/>}
  </main>
 </div>
}

const icons={dashboard:'⌂',events:'◫',results:'◆',students:'◎',venues:'⌖',lost:'♢',settings:'⚙'}

function Title({title,sub,action}){return <div className="pageTitle"><div><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>{title}</h1><p>{sub}</p></div>{action}</div>}
function Stat({n,l,trend}){return <div className="adminStat"><b>{n}</b><span>{l}</span>{trend&&<small>{trend}</small>}</div>}

function Dashboard({go}){return <section className="content"><Title title="Dashboard" sub="Monitor and control the complete CampusFest platform." action={<span className="dateChip">18–21 OCT 2026</span>}/>
 <div className="stats dashStats"><Stat n="24" l="Total events" trend="+4 this week"/><Stat n="1,240" l="Registrations" trend="+12%"/><Stat n="684" l="Check-ins today" trend="55% of registrations"/><Stat n="312" l="Certificates issued" trend="All verified"/></div>
 <div className="adminGrid">
  <div className="listCard"><div className="cardHead"><div><h2>Platform activity</h2><p>Latest administrative activity</p></div><button className="linkBtn" onClick={()=>go('events')}>Manage events →</button></div>
   {['Code Sprint registration reached 47 students','Battle of Bands check-ins reached 84','Robo Race saved as draft','3 result scores awaiting publication','New lost & found report received'].map((x,i)=><div className="activity" key={x}><b>0{i+1}</b><span>{x}<small>{i+1} hour{i?'s':''} ago</small></span></div>)}
  </div>
  <div className="actionCard"><span className="eyebrow">QUICK CONTROL</span><h2>Run the festival</h2><p>One administrator manages events, registrations, students, results, venues and campus reports.</p><button className="primary" onClick={()=>go('events')}>Manage events →</button><button className="outline darkText" onClick={()=>go('results')}>Publish results</button><button className="outline darkText" onClick={()=>go('students')}>View students</button></div>
 </div>
 </section>}

function EventsAdmin({setNotice}){const [filter,setFilter]=useState('All'); const list=filter==='All'?events:events.filter(e=>e.status===filter); return <section className="content"><Title title="Events & registrations" sub="Create, publish, update and monitor every event." action={<button className="primary topAction" onClick={()=>setNotice('Create-event form opened in the admin workflow.')}>+ Create event</button>}/>
 <div className="filters"><div>{['All','Published','Draft'].map(x=><button className={filter===x?'selected':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
 <div className="tableCard"><table><thead><tr><th>Event</th><th>Date / venue</th><th>Registrations</th><th>Status</th><th>Admin action</th></tr></thead><tbody>{list.map(e=><tr key={e.id}><td><b>{e.title}</b><small>{e.cat}</small></td><td>{e.date} · {e.time}<small>{e.venue}</small></td><td><strong>{e.registered}/{e.capacity}</strong><div className="miniBar"><i style={{width:(e.registered/e.capacity*100)+'%'}}/></div></td><td><span className={'status '+e.status.toLowerCase()}>{e.status}</span></td><td><button className="rowBtn" onClick={()=>setNotice(e.title+' selected for administration.')}>Manage</button></td></tr>)}</tbody></table></div>
 </section>}

function ResultsAdmin({setNotice}){return <section className="content"><Title title="Competitions & results" sub="Review scores and publish official results." action={<button className="primary topAction" onClick={()=>setNotice('Result publication check started.')}>Review pending →</button>}/><div className="resultNotice"><b>3 score records</b><span>Review before publishing. Published results become visible on the student website.</span></div><div className="tableCard"><table><thead><tr><th>Competition</th><th>Participant</th><th>Score</th><th>Rank</th><th>Action</th></tr></thead><tbody>{results.map(r=><tr key={r[0]+r[1]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td><strong>{r[2]}/100</strong></td><td>#{r[3]}</td><td><button className="rowBtn" onClick={()=>setNotice('Score reviewed for '+r[1]+'.')}>Review</button></td></tr>)}</tbody></table></div></section>}

function Students(){const students=[['Aarav Kulkarni','BCA · 2nd Year','8 events'],['Priya Patil','BBA · 1st Year','5 events'],['Rahul Sharma','BCA · 3rd Year','11 events'],['Neha Joshi','BSc CS · 2nd Year','6 events']];return <section className="content"><Title title="Students" sub="View registrations and participation across CampusFest."/><div className="studentGrid">{students.map(s=><div className="studentCard" key={s[0]}><div className="avatar">ST</div><div><b>{s[0]}</b><span>{s[1]}</span><small>{s[2]}</small></div><button className="linkBtn">View →</button></div>)}</div></section>}
function Venues(){const venues=['Main Auditorium','Computer Lab 2','Open Amphitheatre','Innovation Block','Seminar Hall','Exhibition Zone'];return <section className="content"><Title title="Campus venues" sub="Manage locations used by events and activities."/><div className="venueGrid">{venues.map((v,i)=><div className="venueCard" key={v}><span>⌖</span><b>{v}</b><small>{i%2?'2 events assigned':'1 event assigned'}</small><button className="rowBtn">Manage venue</button></div>)}</div></section>}
function LostFoundAdmin({setNotice}){const reports=['Black wallet · Library','USB drive · Computer Lab 2','Water bottle · Auditorium'];return <section className="content"><Title title="Lost & Found" sub="Review student reports and update their status."/><div className="listCard">{reports.map((r,i)=><div className="adminReport" key={r}><div><b>{r.split(' · ')[0]}</b><span>{r.split(' · ')[1]}</span></div><span className="status published">{i?'Open':'Matched'}</span><button className="rowBtn" onClick={()=>setNotice('Report marked for follow-up.')}>Manage</button></div>)}</div></section>}
function Settings(){return <section className="content"><Title title="Settings" sub="Administrator and platform configuration."/><div className="settingsCard"><h2>Administrator account</h2><div><span>Account model<strong>Single administrator</strong></span><span>Permissions<strong>Full platform control</strong></span><span>Authentication<strong>Spring Security + JWT backend</strong></span><span>Public portal<strong>Student website is separate</strong></span></div><p>The admin console and student website are intentionally separate applications. Students never receive access to this console.</p></div></section>}


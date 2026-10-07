import {createRoot} from 'react-dom/client'
import {useEffect,useRef,useState} from 'react'
import jsQR from 'jsqr'
import './style.css'

const API=import.meta.env.VITE_API_URL||'http://localhost:8080/api'
async function api(path,options={}){
  const token=localStorage.getItem('campusfest_scanner_token')
  const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(options.headers||{})}})
  const j=await r.json().catch(()=>({}))
  if(!r.ok)throw Error(j.detail||'Request failed')
  return j
}

function Login({onLogin}){
  const[u,setU]=useState(''),[p,setP]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false)
  const submit=async e=>{
    e.preventDefault();setBusy(true);setErr('')
    try{const r=await api('/scanner/login',{method:'POST',body:JSON.stringify({username:u,password:p})});localStorage.setItem('campusfest_scanner_token',r.token);onLogin(true)}
    catch(x){setErr(x.message)}finally{setBusy(false)}
  }
  return <div className="auth"><div className="card"><span className="tag">CAMPUSFEST ENTRY</span><h1>QR Scanner Login</h1><p>Authorized event staff can use this scanner simultaneously on multiple devices.</p><form onSubmit={submit}><label>Scanner ID<input required maxLength="50" value={u} onChange={e=>setU(e.target.value)}/></label><label>Password<input required type="password" maxLength="100" value={p} onChange={e=>setP(e.target.value)}/></label>{err&&<div className="error">{err}</div>}<button disabled={busy}>{busy?'Signing in…':'Login'}</button></form></div></div>
}

function Scanner(){
  const video=useRef(null),canvas=useRef(null),scanning=useRef(false),busy=useRef(false)
  const[events,setEvents]=useState([]),[selected,setSelected]=useState(null),[running,setRunning]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true)

  useEffect(()=>{api('/scanner/events').then(r=>setEvents(r.filter(e=>e.status==='PUBLISHED'))).catch(e=>setError(e.message)).finally(()=>setLoading(false));return()=>stop()},[])
  const stop=()=>{scanning.current=false;const s=video.current?.srcObject;s?.getTracks().forEach(t=>t.stop());if(video.current)video.current.srcObject=null;setRunning(false)}
  const chooseEvent=e=>{stop();setResult(null);setError('');setSelected(e)}
  const changeEvent=()=>{stop();setResult(null);setSelected(null);setError('')}
  const start=async()=>{
    if(!selected)return
    setError('');setResult(null)
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false})
      video.current.srcObject=stream;await video.current.play();scanning.current=true;setRunning(true);requestAnimationFrame(scan)
    }catch(e){setError('Camera access was blocked. Allow camera permission and try again.')}
  }
  const scan=async()=>{
    if(!scanning.current||!video.current)return
    const v=video.current,c=canvas.current;c.width=v.videoWidth;c.height=v.videoHeight
    const x=c.getContext('2d');x.drawImage(v,0,0,c.width,c.height)
    const d=x.getImageData(0,0,c.width,c.height),code=jsQR(d.data,d.width,d.height)
    if(code?.data&&!busy.current){
      busy.current=true
      try{
        const r=await api('/scanner/verify?eventId='+encodeURIComponent(selected.id)+'&passToken='+encodeURIComponent(code.data),{method:'POST'})
        setResult(r)
        setTimeout(()=>{busy.current=false;setResult(null);if(scanning.current)requestAnimationFrame(scan)},1600);return
      }catch(e){
        setResult({allowed:false,message:e.message})
        setTimeout(()=>{busy.current=false;if(scanning.current)requestAnimationFrame(scan)},1600);return
      }
    }
    requestAnimationFrame(scan)
  }

  return <div className="scanner">
    <header><div><span className="tag">CAMPUSFEST</span><h1>Entry QR Scanner</h1></div><button className="ghost" onClick={()=>{localStorage.removeItem('campusfest_scanner_token');location.reload()}}>Logout</button></header>
    <main>
      {!selected&&!loading&&<section className="gallery">
        <div className="galleryIntro"><span className="tag">ENTRY</span><h2>Select Event</h2><p>Choose the event you are checking passes for.</p></div>
        {events.length?<div className="eventGrid">{events.map(e=><button className="eventCard" key={e.id} onClick={()=>chooseEvent(e)}>
          {e.posterData?<img src={e.posterData} alt=""/>:<div className="noPoster">No poster</div>}
          <div className="eventBody"><h3>{e.title}</h3><span>Use this event for entry scanning →</span></div>
        </button>)}</div>:<div className="empty">No published events available for scanning.</div>}
      </section>}
      {loading&&<div className="empty">Loading events…</div>}
      {selected&&<div className="card scannerCard">
        <div className="selectedEvent"><div><span className="tag">SELECTED EVENT</span><h2>{selected.title}</h2></div><button className="ghost" onClick={changeEvent} disabled={running}>Change Event</button></div>
        <div className="camera"><video ref={video} playsInline muted/><div className="frame"></div>{!running&&<div className="cameraMsg">Camera scanner is ready</div>}</div>
        <canvas ref={canvas} hidden/>
        <div className="actions">{!running?<button onClick={start}>Start Camera Scan</button>:<button className="ghost" onClick={stop}>Stop Scanner</button>}</div>
        {error&&<div className="error">{error}</div>}
        {result&&<div className={'result '+(result.allowed?'ok':'no')}><strong>{result.allowed?'ENTRY ALLOWED':'ENTRY DENIED'}</strong><span>{result.message}</span>{result.name&&<span>{result.name} · {result.eventTitle}</span>}</div>}
        <p className="hint">Only passes registered for <strong>{selected.title}</strong> are accepted.</p>
      </div>}
    </main>
  </div>
}

function App(){const[logged,setLogged]=useState(!!localStorage.getItem('campusfest_scanner_token'));return logged?<Scanner/>:<Login onLogin={setLogged}/>}
createRoot(document.getElementById('root')).render(<App/>)

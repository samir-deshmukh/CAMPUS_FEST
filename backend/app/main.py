import os,sqlite3,secrets
from datetime import datetime,timedelta,timezone
import jwt
from fastapi import FastAPI,HTTPException,Depends,Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
DB=os.path.join(os.path.dirname(__file__),"campusfest.db")
S=os.getenv("SECURITY_JWT_SECRET",""); U=os.getenv("ADMIN_USERNAME","SAI"); P=os.getenv("ADMIN_PASSWORD","campusfest")
app=FastAPI(title="CampusFest API")
app.add_middleware(CORSMiddleware,allow_origins=["https://sai-student.onrender.com","https://sai-sa9l.onrender.com"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
def d():
 c=sqlite3.connect(DB);c.row_factory=sqlite3.Row;return c
with d() as c:c.executescript("CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,title,description,category,venue,start_time,end_time,capacity,status,poster_data);CREATE TABLE IF NOT EXISTS registrations(id INTEGER PRIMARY KEY,event_id,name,college,course,year,email,phone,pass_token UNIQUE,status,registered_at);")
class L(BaseModel): username:str;password:str
class E(BaseModel): title:str;description:str;category:str;venue:str;startTime:str;endTime:str;capacity:int;status:str="DRAFT";posterData:str|None=None
class R(BaseModel): name:str;college:str;course:str;year:str;email:str;phone:str
def admin(a: str|None=Header(None)):
 if not S or not a or not a.startswith("Bearer "):raise HTTPException(401,"Authentication required")
 try:x=jwt.decode(a[7:],S,algorithms=["HS256"])
 except:raise HTTPException(401,"Invalid or expired token")
 if x.get("role")!="ADMIN":raise HTTPException(403,"Admin access required")
 return x
def ej(r):return dict(id=r["id"],title=r["title"],description=r["description"],category=r["category"],venue=r["venue"],startTime=r["start_time"],endTime=r["end_time"],capacity=r["capacity"],status=r["status"],posterData=r["poster_data"])
@app.get("/health")
def health():return {"status":"ok","service":"CampusFest backend"}
@app.post("/api/auth/login")
def login(x:L):
 if x.username.casefold()!=U.casefold() or x.password!=P:raise HTTPException(401,"Invalid credentials")
 n=datetime.now(timezone.utc);t=jwt.encode({"sub":U,"role":"ADMIN","iat":int(n.timestamp()),"exp":int((n+timedelta(hours=8)).timestamp())},S,algorithm="HS256");return {"token":t,"username":U,"name":"CampusFest Administrator","role":"ADMIN"}
@app.get("/api/events")
def events():
 with d() as c:return [ej(x) for x in c.execute("select * from events where status='PUBLISHED' order by start_time")]
@app.get("/api/events/all")
def alle(_:dict=Depends(admin)):
 with d() as c:return [ej(x) for x in c.execute("select * from events order by start_time desc")]
@app.post("/api/events")
def create(x:E,_:dict=Depends(admin)):
 with d() as c:
  q=c.execute("insert into events(title,description,category,venue,start_time,end_time,capacity,status,poster_data) values(?,?,?,?,?,?,?,?,?)",(x.title,x.description,x.category,x.venue,x.startTime,x.endTime,x.capacity,x.status,x.posterData));c.commit();return ej(c.execute("select * from events where id=?",(q.lastrowid,)).fetchone())
@app.put("/api/events/{i}")
def update(i:int,x:E,_:dict=Depends(admin)):
 with d() as c:c.execute("update events set title=?,description=?,category=?,venue=?,start_time=?,end_time=?,capacity=?,status=?,poster_data=? where id=?",(x.title,x.description,x.category,x.venue,x.startTime,x.endTime,x.capacity,x.status,x.posterData,i));c.commit();r=c.execute("select * from events where id=?",(i,)).fetchone()
 if not r:raise HTTPException(404,"Event not found")
 return ej(r)
@app.delete("/api/events/{i}")
def delete(i:int,_:dict=Depends(admin)):
 with d() as c:c.execute("delete from events where id=?",(i,));c.commit();return {"ok":True}
def pj(r):return {"id":r["id"],"eventTitle":r["event_title"],"name":r["name"],"college":r["college"],"course":r["course"],"year":r["year"],"studentEmail":r["email"],"phone":r["phone"],"passToken":r["pass_token"],"status":r["status"],"registeredAt":r["registered_at"]}
@app.post("/api/registrations/events/{i}")
def reg(i:int,x:R):
 with d() as c:
  e=c.execute("select * from events where id=? and status='PUBLISHED'",(i,)).fetchone()
  if not e:raise HTTPException(404,"Event not found")
  if c.execute("select count(*) n from registrations where event_id=? and status='ACTIVE'",(i,)).fetchone()["n"]>=e["capacity"]:raise HTTPException(409,"Registration capacity is full")
  t=secrets.token_urlsafe(24);now=datetime.now(timezone.utc).isoformat();q=c.execute("insert into registrations(event_id,name,college,course,year,email,phone,pass_token,status,registered_at) values(?,?,?,?,?,?,?,?,?,?)",(i,x.name,x.college,x.course,x.year,x.email,x.phone,t,"ACTIVE",now));c.commit();return pj(c.execute("select r.*,e.title event_title from registrations r join events e on e.id=r.event_id where r.id=?",(q.lastrowid,)).fetchone())
@app.get("/api/registrations/me")
def me(passToken:str):
 with d() as c:r=c.execute("select r.*,e.title event_title from registrations r join events e on e.id=r.event_id where r.pass_token=?",(passToken,)).fetchone()
 if not r:raise HTTPException(404,"Pass not found")
 return pj(r)
@app.delete("/api/registrations/me")
def cancel(passToken:str):
 with d() as c:c.execute("update registrations set status='CANCELLED' where pass_token=?",(passToken,));c.commit();return {"ok":True}
@app.get("/api/admin/registrations")
def regs(_:dict=Depends(admin)):
 with d() as c:return [pj(x) for x in c.execute("select r.*,e.title event_title from registrations r join events e on e.id=r.event_id order by registered_at desc")]
@app.get("/api/admin/dashboard")
def dash(_:dict=Depends(admin)):
 with d() as c:return {k:c.execute(q).fetchone()["n"] for k,q in {"events":"select count(*) n from events","publishedEvents":"select count(*) n from events where status='PUBLISHED'","draftEvents":"select count(*) n from events where status='DRAFT'","registrations":"select count(*) n from registrations where status='ACTIVE'","students":"select count(distinct email) n from registrations"}.items()}


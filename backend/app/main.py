import os, sqlite3, secrets
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB = os.path.join(os.path.dirname(__file__), "campusfest.db")
SECRET = os.getenv("SECURITY_JWT_SECRET", "campusfest-dev-secret-change-me")
ADMIN_USER = os.getenv("ADMIN_USERNAME", "SAI")
ADMIN_PASS = os.getenv("ADMIN_PASSWORD", "campusfest")

app = FastAPI(title="CampusFest API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

with db() as c:
    c.executescript("""
    CREATE TABLE IF NOT EXISTS events(
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT '',
      venue TEXT DEFAULT '',
      start_time TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      capacity INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PUBLISHED',
      poster_data TEXT
    );
    CREATE TABLE IF NOT EXISTS registrations(
      id INTEGER PRIMARY KEY,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT DEFAULT '',
      year TEXT DEFAULT '',
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      pass_token TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      registered_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lost_found(
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL,
      item TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lost_found_claims(
      id INTEGER PRIMARY KEY,
      item_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      college TEXT NOT NULL,
      course TEXT NOT NULL,
      year TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      identification_details TEXT NOT NULL,
      lost_when_where TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );
    """)

class Login(BaseModel):
    username: str
    password: str

class EventIn(BaseModel):
    title: str
    description: str
    posterData: str | None = None
    status: str = "PUBLISHED"

class RegistrationIn(BaseModel):
    name: str
    college: str
    email: str
    phone: str

class LostFoundIn(BaseModel):
    type: str
    item: str
    description: str
    location: str
    contact: str

class LostFoundClaimIn(BaseModel):
    fullName: str
    college: str
    course: str
    year: str
    email: str
    phone: str
    identificationDetails: str
    lostWhenWhere: str = ''

def admin(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        payload = jwt.decode(authorization[7:], SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid or expired token")
    if payload.get("role") != "ADMIN":
        raise HTTPException(403, "Admin access required")
    return payload

def event_json(r):
    return {
        "id": r["id"], "title": r["title"], "description": r["description"],
        "posterData": r["poster_data"], "status": r["status"]
    }

def registration_json(r, include_token=True):
    out = {
        "id": r["id"], "eventTitle": r["event_title"], "name": r["name"],
        "college": r["college"], "studentEmail": r["email"], "phone": r["phone"],
        "status": r["status"], "registeredAt": r["registered_at"]
    }
    if include_token:
        out["passToken"] = r["pass_token"]
    return out

def lost_json(r):
    return {k: r[k] for k in ("id","type","item","description","location","contact","status","created_at")}

def claim_json(r):
    return {
        "id": r["id"], "itemId": r["item_id"], "fullName": r["full_name"],
        "college": r["college"], "course": r["course"], "year": r["year"],
        "email": r["email"], "phone": r["phone"],
        "identificationDetails": r["identification_details"],
        "lostWhenWhere": r["lost_when_where"], "status": r["status"],
        "createdAt": r["created_at"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "CampusFest backend"}

@app.post("/api/auth/login")
def login(x: Login):
    if x.username.casefold() != ADMIN_USER.casefold() or x.password != ADMIN_PASS:
        raise HTTPException(401, "Invalid credentials")
    now = datetime.now(timezone.utc)
    token = jwt.encode({
        "sub": ADMIN_USER, "role": "ADMIN", "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=8)).timestamp())
    }, SECRET, algorithm="HS256")
    return {"token": token, "username": ADMIN_USER, "name": "CampusFest Administrator", "role": "ADMIN"}

@app.get("/api/events")
def public_events():
    with db() as c:
        return [event_json(r) for r in c.execute(
            "SELECT * FROM events WHERE status='PUBLISHED' ORDER BY id DESC"
        )]

@app.get("/api/events/all")
def all_events(_: dict = Depends(admin)):
    with db() as c:
        return [event_json(r) for r in c.execute("SELECT * FROM events ORDER BY id DESC")]

@app.post("/api/events")
def create_event(x: EventIn, _: dict = Depends(admin)):
    status = x.status if x.status in ("PUBLISHED", "DRAFT", "CLOSED") else "DRAFT"
    with db() as c:
        cur = c.execute(
            "INSERT INTO events(title,description,poster_data,status) VALUES(?,?,?,?)",
            (x.title.strip(), x.description.strip(), x.posterData, status)
        )
        c.commit()
        return event_json(c.execute("SELECT * FROM events WHERE id=?", (cur.lastrowid,)).fetchone())

@app.put("/api/events/{event_id}")
def update_event(event_id: int, x: EventIn, _: dict = Depends(admin)):
    status = x.status if x.status in ("PUBLISHED", "DRAFT", "CLOSED") else "DRAFT"
    with db() as c:
        c.execute(
            "UPDATE events SET title=?,description=?,poster_data=?,status=? WHERE id=?",
            (x.title.strip(), x.description.strip(), x.posterData, status, event_id)
        )
        r = c.execute("SELECT * FROM events WHERE id=?", (event_id,)).fetchone()
        c.commit()
    if not r:
        raise HTTPException(404, "Event not found")
    return event_json(r)

@app.post("/api/events/{event_id}/close")
def close_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE events SET status='CLOSED' WHERE id=?", (event_id,))
        r = c.execute("SELECT * FROM events WHERE id=?", (event_id,)).fetchone()
        c.commit()
    if not r: raise HTTPException(404, "Event not found")
    return event_json(r)

@app.post("/api/events/{event_id}/reopen")
def reopen_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE events SET status='PUBLISHED' WHERE id=?", (event_id,))
        r = c.execute("SELECT * FROM events WHERE id=?", (event_id,)).fetchone()
        c.commit()
    if not r: raise HTTPException(404, "Event not found")
    return event_json(r)

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        count = c.execute("SELECT COUNT(*) n FROM registrations WHERE event_id=?", (event_id,)).fetchone()["n"]
        if count:
            raise HTTPException(409, "This event has registrations and cannot be deleted.")
        c.execute("DELETE FROM events WHERE id=?", (event_id,))
        c.commit()
    return {"ok": True}

@app.post("/api/registrations/events/{event_id}")
def register(event_id: int, x: RegistrationIn):
    with db() as c:
        event = c.execute("SELECT * FROM events WHERE id=? AND status='PUBLISHED'", (event_id,)).fetchone()
        if not event: raise HTTPException(404, "Registration is closed or event not found")
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc).isoformat()
        cur = c.execute(
            """INSERT INTO registrations(event_id,name,college,email,phone,pass_token,status,registered_at)
               VALUES(?,?,?,?,?,?,?,?)""",
            (event_id, x.name.strip(), x.college.strip(), x.email.strip(), x.phone.strip(), token, "ACTIVE", now)
        )
        c.commit()
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.id=?""", (cur.lastrowid,)).fetchone()
        return registration_json(r)

@app.get("/api/registrations/me")
def get_pass(passToken: str):
    with db() as c:
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.pass_token=?""", (passToken,)).fetchone()
    if not r: raise HTTPException(404, "Pass not found")
    return registration_json(r)

@app.delete("/api/registrations/me")
def cancel_registration(passToken: str):
    with db() as c:
        r = c.execute("SELECT * FROM registrations WHERE pass_token=?", (passToken,)).fetchone()
        if not r: raise HTTPException(404, "Pass not found")
        if r["status"] != "ACTIVE": raise HTTPException(409, "This registration is already cancelled.")
        c.execute("UPDATE registrations SET status='CANCELLED' WHERE id=?", (r["id"],))
        c.commit()
    return {"ok": True, "message": "Registration cancelled successfully. The pass is now invalid."}

@app.get("/api/admin/registrations")
def registrations(_: dict = Depends(admin)):
    with db() as c:
        return [registration_json(r, False) for r in c.execute(
            """SELECT r.*, e.title event_title FROM registrations r
               JOIN events e ON e.id=r.event_id ORDER BY r.id DESC"""
        )]

@app.get("/api/admin/verify")
def verify(passToken: str, _: dict = Depends(admin)):
    with db() as c:
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.pass_token=?""", (passToken,)).fetchone()
    if not r: return {"valid": False, "message": "Invalid QR pass"}
    return {
        "valid": r["status"] == "ACTIVE",
        "message": "Valid pass" if r["status"] == "ACTIVE" else "Registration cancelled",
        **registration_json(r, False)
    }

@app.get("/api/admin/dashboard")
def dashboard(_: dict = Depends(admin)):
    with db() as c:
        counts = {
            "events": c.execute("SELECT COUNT(*) n FROM events").fetchone()["n"],
            "openEvents": c.execute("SELECT COUNT(*) n FROM events WHERE status='PUBLISHED'").fetchone()["n"],
            "closedEvents": c.execute("SELECT COUNT(*) n FROM events WHERE status='CLOSED'").fetchone()["n"],
            "registrations": c.execute("SELECT COUNT(*) n FROM registrations WHERE status='ACTIVE'").fetchone()["n"],
            "lostFound": c.execute("SELECT COUNT(*) n FROM lost_found WHERE status='OPEN'").fetchone()["n"],
        }
        recent = []
        for r in c.execute("""SELECT e.*, COUNT(r.id) registrations FROM events e
                              LEFT JOIN registrations r ON r.event_id=e.id AND r.status='ACTIVE'
                              GROUP BY e.id ORDER BY e.id DESC LIMIT 6"""):
            recent.append({**event_json(r), "registrations": r["registrations"]})
        return {**counts, "recentEvents": recent}

@app.get("/api/lost-found")
def public_lost_found():
    with db() as c:
        return [lost_json(r) for r in c.execute(
            "SELECT * FROM lost_found WHERE status='OPEN' ORDER BY id DESC"
        )]

@app.post("/api/lost-found")
def create_lost_found(x: LostFoundIn):
    if x.type not in ("LOST", "FOUND"): raise HTTPException(400, "Invalid report type")
    now = datetime.now(timezone.utc).isoformat()
    with db() as c:
        cur = c.execute(
            "INSERT INTO lost_found(type,item,description,location,contact,status,created_at) VALUES(?,?,?,?,?,?,?)",
            (x.type, x.item.strip(), x.description.strip(), x.location.strip(), x.contact.strip(), "OPEN", now)
        )
        item_id = cur.lastrowid
        c.commit()
        item = c.execute("SELECT * FROM lost_found WHERE id=?", (item_id,)).fetchone()
        matches = []
        if x.type == "LOST":
            needle = set((x.item + " " + x.description).lower().replace(",", " ").split())
            for r in c.execute("SELECT * FROM lost_found WHERE type='FOUND' AND status='OPEN' ORDER BY id DESC"):
                hay = set((r["item"] + " " + r["description"]).lower().replace(",", " ").split())
                common = needle & hay
                score = len(common) / max(1, len(needle))
                if score >= 0.20 or x.item.strip().lower() == r["item"].strip().lower():
                    matches.append(lost_json(r))
        return {"report": lost_json(item), "possibleMatches": matches}

@app.get("/api/lost-found/{item_id}/matches")
def lost_item_matches(item_id: int):
    with db() as c:
        lost = c.execute("SELECT * FROM lost_found WHERE id=? AND type='LOST' AND status='OPEN'", (item_id,)).fetchone()
        if not lost: raise HTTPException(404, "Lost report not found")
        needle_words = set((lost["item"] + " " + lost["description"]).lower().replace(",", " ").split())
        matches = []
        for r in c.execute("SELECT * FROM lost_found WHERE type='FOUND' AND status='OPEN' ORDER BY id DESC"):
            hay = set((r["item"] + " " + r["description"]).lower().replace(",", " ").split())
            score = len(needle_words & hay) / max(1, len(needle_words))
            if score >= 0.20 or lost["item"].strip().lower() == r["item"].strip().lower():
                matches.append(lost_json(r))
        return matches

@app.post("/api/lost-found/{item_id}/claim")
def claim_lost_item(item_id: int, x: LostFoundClaimIn):
    required = [x.fullName, x.college, x.course, x.year, x.email, x.phone, x.identificationDetails]
    if not all(v.strip() for v in required):
        raise HTTPException(400, "Please complete all required claim details")
    now = datetime.now(timezone.utc).isoformat()
    with db() as c:
        item = c.execute("SELECT * FROM lost_found WHERE id=? AND type='FOUND' AND status='OPEN'", (item_id,)).fetchone()
        if not item: raise HTTPException(404, "Found item is no longer available for claiming")
        cur = c.execute(
            """INSERT INTO lost_found_claims(item_id,full_name,college,course,year,email,phone,identification_details,lost_when_where,status,created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (item_id,x.fullName.strip(),x.college.strip(),x.course.strip(),x.year.strip(),x.email.strip(),x.phone.strip(),x.identificationDetails.strip(),x.lostWhenWhere.strip(),"PENDING",now)
        )
        c.commit()
        return {"ok": True, "message": "Claim submitted. The admin will verify your details before handover at the College Lost & Found Counter.", "claimId": cur.lastrowid}

@app.get("/api/admin/lost-found")
def admin_lost_found(_: dict = Depends(admin)):
    with db() as c:
        return [lost_json(r) for r in c.execute("SELECT * FROM lost_found ORDER BY id DESC")]

@app.get("/api/admin/lost-found/claims")
def admin_lost_found_claims(_: dict = Depends(admin)):
    with db() as c:
        return [claim_json(r) for r in c.execute("SELECT * FROM lost_found_claims ORDER BY id DESC")]

@app.post("/api/admin/lost-found/claims/{claim_id}/approve")
def approve_claim(claim_id: int, _: dict = Depends(admin)):
    with db() as c:
        claim = c.execute("SELECT * FROM lost_found_claims WHERE id=?", (claim_id,)).fetchone()
        if not claim: raise HTTPException(404, "Claim not found")
        c.execute("UPDATE lost_found_claims SET status='APPROVED' WHERE id=?", (claim_id,))
        c.execute("UPDATE lost_found SET status='RESOLVED' WHERE id=?", (claim["item_id"],))
        c.commit()
    return {"ok": True, "message": "Claim approved and item marked resolved."}

@app.post("/api/admin/lost-found/claims/{claim_id}/reject")
def reject_claim(claim_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE lost_found_claims SET status='REJECTED' WHERE id=?", (claim_id,))
        c.commit()
    return {"ok": True, "message": "Claim rejected."}

@app.post("/api/admin/lost-found/{item_id}/resolve")
def resolve_lost_found(item_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE lost_found SET status='RESOLVED' WHERE id=?", (item_id,))
        c.commit()
    return {"ok": True}

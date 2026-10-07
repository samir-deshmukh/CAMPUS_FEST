import os, secrets, re
import psycopg
from psycopg.rows import dict_row
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for CampusFest PostgreSQL")
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
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def init_db():
    with db() as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS events(
          id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
          category TEXT DEFAULT '', venue TEXT DEFAULT '', start_time TEXT DEFAULT '',
          end_time TEXT DEFAULT '', capacity INTEGER DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'PUBLISHED', poster_data TEXT
        );
        CREATE TABLE IF NOT EXISTS registrations(
          id BIGSERIAL PRIMARY KEY, event_id BIGINT NOT NULL REFERENCES events(id),
          name TEXT NOT NULL, college TEXT NOT NULL, course TEXT DEFAULT '', year TEXT DEFAULT '',
          email TEXT NOT NULL, phone TEXT NOT NULL, pass_token TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE', entry_status TEXT NOT NULL DEFAULT 'NOT_ENTERED',
          registered_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS lost_found(
          id BIGSERIAL PRIMARY KEY, type TEXT NOT NULL, item TEXT NOT NULL,
          description TEXT NOT NULL, location TEXT NOT NULL, contact TEXT NOT NULL,
          found_item_image TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'OPEN', created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS lost_found_claims(
          id BIGSERIAL PRIMARY KEY, item_id BIGINT NOT NULL REFERENCES lost_found(id),
          full_name TEXT NOT NULL, college TEXT NOT NULL, course TEXT NOT NULL, year TEXT NOT NULL,
          email TEXT NOT NULL, phone TEXT NOT NULL, identification_details TEXT NOT NULL,
          lost_when_where TEXT DEFAULT '', lost_item_image TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT NOT NULL
        );
        """)
        c.execute("ALTER TABLE lost_found ADD COLUMN IF NOT EXISTS found_item_image TEXT DEFAULT ''")
        c.execute("ALTER TABLE lost_found_claims ADD COLUMN IF NOT EXISTS lost_item_image TEXT DEFAULT ''")


init_db()

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

BAD_WORDS = {
    "fuck", "fucking", "shit", "bitch", "bastard", "asshole", "dick", "piss", "cunt", "motherfucker"
}

def contains_bad_words(value: str) -> bool:
    words = re.findall(r"[a-zA-Z]+", value.lower())
    return any(w in BAD_WORDS for w in words)

def valid_mobile(value: str) -> bool:
    return bool(re.fullmatch(r"[6-9]\d{9}", value.strip()))

def validate_text(value: str, field: str, max_len: int = 1000, required: bool = True):
    value = value.strip()
    if required and not value:
        raise HTTPException(400, f"{field} is required")
    if len(value) > max_len:
        raise HTTPException(400, f"{field} is too long")
    if contains_bad_words(value):
        raise HTTPException(400, f"Please use respectful language in {field.lower()}")
    return value

def valid_email(value: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", value.strip()))

class LostFoundIn(BaseModel):
    type: str
    fullName: str
    phone: str
    item: str
    description: str
    location: str
    foundItemImage: str = ""

class LostFoundClaimIn(BaseModel):
    fullName: str
    college: str = ''
    course: str = ''
    year: str = ''
    email: str = ''
    phone: str = ''
    identificationDetails: str = ''
    lostWhenWhere: str = ''
    lostItemImage: str = ''

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
    return {k: r[k] for k in ("id","type","item","description","location","contact","found_item_image","status","created_at")}

def claim_json(r):
    return {
        "id": r["id"], "itemId": r["item_id"], "fullName": r["full_name"],
        "college": r["college"], "course": r["course"], "year": r["year"],
        "email": r["email"], "phone": r["phone"],
        "identificationDetails": r["identification_details"],
        "lostWhenWhere": r["lost_when_where"], "lostItemImage": r["lost_item_image"] or "",
        "status": r["status"], "createdAt": r["created_at"]
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
    title = validate_text(x.title, "Event name", 120)
    description = validate_text(x.description, "Event description", 3000)
    status = x.status if x.status in ("PUBLISHED", "DRAFT", "CLOSED") else "DRAFT"
    with db() as c:
        cur = c.execute(
            "INSERT INTO events(title,description,poster_data,status) VALUES(%s,%s,%s,%s) RETURNING id",
            (title, description, x.posterData, status)
        )
        event_id = cur.fetchone()["id"]
        c.commit()
        return event_json(c.execute("SELECT * FROM events WHERE id=%s", (event_id,)).fetchone())

@app.put("/api/events/{event_id}")
def update_event(event_id: int, x: EventIn, _: dict = Depends(admin)):
    title = validate_text(x.title, "Event name", 120)
    description = validate_text(x.description, "Event description", 3000)
    status = x.status if x.status in ("PUBLISHED", "DRAFT", "CLOSED") else "DRAFT"
    with db() as c:
        c.execute(
            "UPDATE events SET title=%s,description=%s,poster_data=%s,status=%s WHERE id=%s",
            (title, description, x.posterData, status, event_id)
        )
        r = c.execute("SELECT * FROM events WHERE id=%s", (event_id,)).fetchone()
        c.commit()
    if not r:
        raise HTTPException(404, "Event not found")
    return event_json(r)

@app.post("/api/events/{event_id}/close")
def close_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE events SET status='CLOSED' WHERE id=%s", (event_id,))
        r = c.execute("SELECT * FROM events WHERE id=%s", (event_id,)).fetchone()
        c.commit()
    if not r: raise HTTPException(404, "Event not found")
    return event_json(r)

@app.post("/api/events/{event_id}/reopen")
def reopen_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE events SET status='PUBLISHED' WHERE id=%s", (event_id,))
        r = c.execute("SELECT * FROM events WHERE id=%s", (event_id,)).fetchone()
        c.commit()
    if not r: raise HTTPException(404, "Event not found")
    return event_json(r)

@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        count = c.execute("SELECT COUNT(*) n FROM registrations WHERE event_id=%s", (event_id,)).fetchone()["n"]
        if count:
            raise HTTPException(409, "This event has registrations and cannot be deleted.")
        c.execute("DELETE FROM events WHERE id=%s", (event_id,))
        c.commit()
    return {"ok": True}

@app.post("/api/registrations/events/{event_id}")
def register(event_id: int, x: RegistrationIn):
    name = validate_text(x.name, "Name", 100)
    college = validate_text(x.college, "College", 150)
    if not valid_email(x.email):
        raise HTTPException(400, "Enter a valid email address")
    if not valid_mobile(x.phone):
        raise HTTPException(400, "Enter a valid 10-digit Indian mobile number")
    with db() as c:
        event = c.execute("SELECT * FROM events WHERE id=%s AND status='PUBLISHED'", (event_id,)).fetchone()
        if not event: raise HTTPException(404, "Registration is closed or event not found")
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc).isoformat()
        cur = c.execute(
            """INSERT INTO registrations(event_id,name,college,email,phone,pass_token,status,entry_status,registered_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (event_id, name, college, x.email.strip(), x.phone.strip(), token, "ACTIVE", "NOT_ENTERED", now)
        )
        registration_id = cur.fetchone()["id"]
        c.commit()
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.id=%s""", (registration_id,)).fetchone()
        return registration_json(r)

@app.get("/api/registrations/me")
def get_pass(passToken: str):
    with db() as c:
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.pass_token=%s FOR UPDATE""", (passToken,)).fetchone()
    if not r: raise HTTPException(404, "Pass not found")
    return registration_json(r)

@app.delete("/api/registrations/me")
def cancel_registration(passToken: str):
    with db() as c:
        r = c.execute("SELECT * FROM registrations WHERE pass_token=%s", (passToken,)).fetchone()
        if not r: raise HTTPException(404, "Pass not found")
        if r["status"] != "ACTIVE": raise HTTPException(409, "This registration is already cancelled.")
        c.execute("UPDATE registrations SET status='CANCELLED' WHERE id=%s", (r["id"],))
        c.commit()
    return {"ok": True, "message": "Registration cancelled successfully. The pass is now invalid."}

@app.get("/api/admin/events/{event_id}/registrations")
def event_registrations(event_id: int, _: dict = Depends(admin)):
    with db() as c:
        event = c.execute("SELECT id,title FROM events WHERE id=%s", (event_id,)).fetchone()
        if not event: raise HTTPException(404, "Event not found")
        rows = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                            JOIN events e ON e.id=r.event_id
                            WHERE r.event_id=%s ORDER BY r.id DESC""", (event_id,)).fetchall()
        return {
            "event": {"id": event["id"], "title": event["title"]},
            "registrations": [registration_json(r, False) | {"entryStatus": r["entry_status"]} for r in rows]
        }

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
                         JOIN events e ON e.id=r.event_id WHERE r.pass_token=%s""", (passToken,)).fetchone()
    if not r: return {"valid": False, "message": "Invalid QR pass"}
    return {
        "valid": r["status"] == "ACTIVE",
        "message": "Valid pass" if r["status"] == "ACTIVE" else "Registration cancelled",
        **registration_json(r, False)
    }

@app.post("/api/scanner/login")
def scanner_login(x: Login):
    if x.username.casefold() != ADMIN_USER.casefold() or x.password != ADMIN_PASS:
        raise HTTPException(401, "Invalid credentials")
    now = datetime.now(timezone.utc)
    token = jwt.encode({
        "sub": ADMIN_USER, "role": "SCANNER", "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=8)).timestamp())
    }, SECRET, algorithm="HS256")
    return {"token": token, "username": ADMIN_USER, "role": "SCANNER"}

def scanner_user(authorization: str | None = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Scanner login required")
    try:
        payload = jwt.decode(authorization[7:], SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(401, "Invalid or expired scanner session")
    if payload.get("role") != "SCANNER":
        raise HTTPException(403, "Scanner access required")
    return payload

@app.post("/api/scanner/verify")
def scanner_verify(passToken: str, _: dict = Depends(scanner_user)):
    with db() as c:
        c.execute("BEGIN")
        r = c.execute("""SELECT r.*, e.title event_title FROM registrations r
                         JOIN events e ON e.id=r.event_id WHERE r.pass_token=%s""", (passToken,)).fetchone()
        if not r:
            c.rollback()
            return {"allowed": False, "message": "Invalid QR. Entry denied."}
        if r["status"] != "ACTIVE":
            c.rollback()
            return {"allowed": False, "message": "Registration is cancelled. Entry denied.", "name": r["name"], "eventTitle": r["event_title"]}
        if r["entry_status"] == "ENTERED":
            c.rollback()
            return {"allowed": False, "message": "This pass has already been used for entry.", "name": r["name"], "eventTitle": r["event_title"]}
        c.execute("UPDATE registrations SET entry_status='ENTERED' WHERE id=%s", (r["id"],))
        c.commit()
        return {"allowed": True, "message": "Scan successful. Entry allowed.", "name": r["name"], "college": r["college"], "eventTitle": r["event_title"], "registrationId": "CF-" + str(r["id"])}

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
            "SELECT * FROM lost_found WHERE status='VERIFIED' ORDER BY id DESC"
        )]

@app.post("/api/lost-found")
def create_lost_found(x: LostFoundIn):
    if x.type != "FOUND":
        raise HTTPException(400, "Only found items can be reported. Lost items are handled manually.")
    if not x.fullName.strip() or not x.phone.strip():
        raise HTTPException(400, "Full name and mobile number are required")
    if not valid_mobile(x.phone):
        raise HTTPException(400, "Enter a valid 10-digit Indian mobile number")
    full_name = validate_text(x.fullName, "Full name", 100)
    item = validate_text(x.item, "Item name", 100)
    description = validate_text(x.description, "Item description", 1000)
    location = validate_text(x.location, "Found location", 200)
    now = datetime.now(timezone.utc).isoformat()
    with db() as c:
        cur = c.execute(
            "INSERT INTO lost_found(type,item,description,location,contact,found_item_image,status,created_at) VALUES(%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            ("FOUND", item, description, location, full_name + " | " + x.phone.strip(), x.foundItemImage.strip(), "PENDING", now)
        )
        item_id = cur.fetchone()["id"]
        c.commit()
        item = c.execute("SELECT * FROM lost_found WHERE id=%s", (item_id,)).fetchone()
        return {"report": lost_json(item)}

@app.post("/api/admin/lost-found/{item_id}/verify")
def verify_lost_found(item_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE lost_found SET status='VERIFIED' WHERE id=%s", (item_id,))
        c.commit()
    return {"ok": True, "message": "Found item verified and published."}

@app.post("/api/lost-found/{item_id}/claim")
def claim_lost_item(item_id: int, x: LostFoundClaimIn):
    if not valid_mobile(x.phone):
        raise HTTPException(400, "Enter a valid 10-digit Indian mobile number")
    full_name = validate_text(x.fullName, "Full name", 100)
    college = validate_text(x.college, "College", 150, False)
    course = validate_text(x.course, "Course", 100, False)
    year = validate_text(x.year, "Year", 20, False)
    email = x.email.strip()
    if email and not valid_email(email):
        raise HTTPException(400, "Enter a valid email address")
    identification = validate_text(x.identificationDetails, "Identification details", 1000, False)
    lost_when_where = validate_text(x.lostWhenWhere, "Where / when lost", 500, False)
    now = datetime.now(timezone.utc).isoformat()
    with db() as c:
        item = c.execute("SELECT * FROM lost_found WHERE id=%s AND type='FOUND' AND status='VERIFIED'", (item_id,)).fetchone()
        if not item: raise HTTPException(404, "Found item is no longer available for claiming")
        cur = c.execute(
            """INSERT INTO lost_found_claims(item_id,full_name,college,course,year,email,phone,identification_details,lost_when_where,lost_item_image,status,created_at)
               VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (item_id,full_name,college,course,year,email,x.phone.strip(),identification,lost_when_where,x.lostItemImage.strip(),"PENDING",now)
        )
        claim_id = cur.fetchone()["id"]
        c.commit()
        return {"ok": True, "message": "Claim submitted. Please collect your item from the College Lost & Found Counter.", "claimId": claim_id}

@app.get("/api/admin/lost-found")
def admin_lost_found(_: dict = Depends(admin)):
    with db() as c:
        reports = c.execute("SELECT * FROM lost_found ORDER BY id DESC").fetchall()
        out = []
        for report in reports:
            claims = c.execute(
                "SELECT * FROM lost_found_claims WHERE item_id=%s ORDER BY id DESC",
                (report["id"],)
            ).fetchall()
            out.append({**lost_json(report), "claims": [claim_json(claim) for claim in claims]})
        return out

@app.get("/api/admin/lost-found/claims")
def admin_lost_found_claims(_: dict = Depends(admin)):
    with db() as c:
        return [claim_json(r) for r in c.execute("SELECT * FROM lost_found_claims ORDER BY id DESC")]

@app.post("/api/admin/lost-found/claims/{claim_id}/approve")
def approve_claim(claim_id: int, _: dict = Depends(admin)):
    with db() as c:
        claim = c.execute("SELECT * FROM lost_found_claims WHERE id=%s", (claim_id,)).fetchone()
        if not claim: raise HTTPException(404, "Claim not found")
        c.execute("UPDATE lost_found_claims SET status='APPROVED' WHERE id=%s", (claim_id,))
        c.execute("UPDATE lost_found SET status='RESOLVED' WHERE id=%s", (claim["item_id"],))
        c.commit()
    return {"ok": True, "message": "Claim approved and item marked resolved."}

@app.post("/api/admin/lost-found/claims/{claim_id}/reject")
def reject_claim(claim_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE lost_found_claims SET status='REJECTED' WHERE id=%s", (claim_id,))
        c.commit()
    return {"ok": True, "message": "Claim rejected."}

@app.post("/api/admin/lost-found/{item_id}/resolve")
def resolve_lost_found(item_id: int, _: dict = Depends(admin)):
    with db() as c:
        c.execute("UPDATE lost_found SET status='RESOLVED' WHERE id=%s", (item_id,))
        c.commit()
    return {"ok": True}

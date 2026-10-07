import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
app = FastAPI(title='CampusFest API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['https://sai-student.onrender.com','https://sai-sa9l.onrender.com'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
JWT_SECRET=os.environ.get('SECURITY_JWT_SECRET','')
ADMIN_USERNAME=os.environ.get('ADMIN_USERNAME','SAI')
ADMIN_PASSWORD=os.environ.get('ADMIN_PASSWORD','campusfest')
class LoginRequest(BaseModel):
    username: str
    password: str
@app.get('/health')
def health(): return {'status':'ok','service':'CampusFest backend'}
@app.post('/api/auth/login')
def login(body: LoginRequest):
    if not JWT_SECRET: raise HTTPException(503,'Authentication is not configured')
    if body.username.casefold()!=ADMIN_USERNAME.casefold() or body.password!=ADMIN_PASSWORD: raise HTTPException(401,'Invalid credentials')
    now=datetime.now(timezone.utc)
    token=jwt.encode({'sub':ADMIN_USERNAME,'role':'ADMIN','iat':int(now.timestamp()),'exp':int((now+timedelta(hours=8)).timestamp())},JWT_SECRET,algorithm='HS256')
    return {'token':token,'username':ADMIN_USERNAME,'role':'ADMIN'}
def require_admin(authorization: Optional[str]=Header(default=None)):
    if not JWT_SECRET or not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'Authentication required')
    try: payload=jwt.decode(authorization[7:],JWT_SECRET,algorithms=['HS256'])
    except jwt.PyJWTError: raise HTTPException(401,'Invalid or expired token')
    if payload.get('role')!='ADMIN': raise HTTPException(403,'Admin access required')
    return payload
@app.get('/api/admin/dashboard')
def admin_dashboard(_:dict=Depends(require_admin)): return {'events':0,'registrations':0,'notifications':0,'message':'CampusFest admin API is ready'}

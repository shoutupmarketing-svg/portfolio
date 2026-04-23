from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Config
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = os.environ.get('JWT_ALGORITHM', 'HS256')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'shoutupmarketing@gmail.com')
ADMIN_SEED_EMAIL = os.environ.get('ADMIN_SEED_EMAIL', 'admin@shoutup.in')
ADMIN_SEED_PASSWORD = os.environ.get('ADMIN_SEED_PASSWORD', 'ShoutUp@2026')

resend.api_key = RESEND_API_KEY

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="SHOUTUP API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Models ----------
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    business: Optional[str] = ""
    message: str

class LeadRequest(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    city: Optional[str] = ""
    budget: Optional[str] = ""
    service: Optional[str] = ""
    notes: Optional[str] = ""


# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_jwt(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Auth Routes ----------
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": req.name,
        "email": req.email.lower(),
        "company": req.company or "",
        "role": "client",
        "password_hash": hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_jwt(user_id, req.email.lower(), "client")
    return AuthResponse(token=token, user={
        "id": user_id, "name": req.name, "email": req.email.lower(),
        "role": "client", "company": req.company or ""
    })

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_jwt(user["id"], user["email"], user["role"])
    return AuthResponse(token=token, user={
        "id": user["id"], "name": user["name"], "email": user["email"],
        "role": user["role"], "company": user.get("company", "")
    })

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Contact / Leads ----------
async def send_email_async(to: str, subject: str, html: str):
    if not RESEND_API_KEY:
        logger.warning("No RESEND_API_KEY; skipping email send")
        return None
    params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
    try:
        return await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.error(f"Resend send failed: {e}")
        return None

@api_router.post("/contact")
async def contact(req: ContactRequest):
    msg_id = str(uuid.uuid4())
    doc = {
        "id": msg_id,
        "name": req.name,
        "email": req.email.lower(),
        "phone": req.phone or "",
        "business": req.business or "",
        "message": req.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new",
    }
    await db.contact_messages.insert_one(doc)

    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0a0a0b;color:#e8e8ea;padding:24px;">
      <h2 style="color:#b8ff00;margin:0 0 16px 0;">New Contact Lead — SHOUTUP</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;color:#6b6e76;">Name</td><td style="padding:8px;">{req.name}</td></tr>
        <tr><td style="padding:8px;color:#6b6e76;">Email</td><td style="padding:8px;">{req.email}</td></tr>
        <tr><td style="padding:8px;color:#6b6e76;">Phone</td><td style="padding:8px;">{req.phone or '-'}</td></tr>
        <tr><td style="padding:8px;color:#6b6e76;">Business</td><td style="padding:8px;">{req.business or '-'}</td></tr>
        <tr><td style="padding:8px;color:#6b6e76;vertical-align:top;">Message</td><td style="padding:8px;">{req.message}</td></tr>
      </table>
      <p style="color:#6b6e76;font-size:12px;margin-top:24px;">SHOUTUP Performance Architecture</p>
    </div>
    """
    await send_email_async(ADMIN_EMAIL, f"New Lead: {req.name} ({req.business or 'SHOUTUP'})", html)
    return {"status": "success", "id": msg_id, "message": "We received your message. Our team will reach out soon."}

@api_router.post("/leads")
async def create_lead(req: LeadRequest, user: dict = Depends(get_current_user)):
    lead_id = str(uuid.uuid4())
    doc = {
        "id": lead_id,
        "user_id": user["id"],
        "name": req.name,
        "phone": req.phone,
        "email": (req.email or "").lower() if req.email else "",
        "city": req.city or "",
        "budget": req.budget or "",
        "service": req.service or "",
        "notes": req.notes or "",
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.leads.insert_one(doc)
    return {"status": "success", "id": lead_id}

@api_router.get("/leads/mine")
async def my_leads(user: dict = Depends(get_current_user)):
    leads = await db.leads.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"leads": leads}


# ---------- Admin ----------
@api_router.get("/admin/messages")
async def admin_messages(_: dict = Depends(require_admin)):
    msgs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"messages": msgs}

@api_router.get("/admin/leads")
async def admin_leads(_: dict = Depends(require_admin)):
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return {"leads": leads}

@api_router.get("/admin/users")
async def admin_users(_: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(2000)
    return {"users": users}

@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "leads": await db.leads.count_documents({}),
        "messages": await db.contact_messages.count_documents({}),
    }


# ---------- Public ----------
@api_router.get("/")
async def root():
    return {"service": "SHOUTUP API", "status": "running"}

@api_router.get("/stats/public")
async def public_stats():
    return {
        "leads_per_month": 1402,
        "avg_roas": 5.8,
        "partners": 50,
        "campaigns_active": 128,
    }


# ---------- Startup: seed admin ----------
@app.on_event("startup")
async def seed_admin():
    try:
        existing = await db.users.find_one({"email": ADMIN_SEED_EMAIL.lower()})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "name": "SHOUTUP Admin",
                "email": ADMIN_SEED_EMAIL.lower(),
                "company": "SHOUTUP",
                "role": "admin",
                "password_hash": hash_password(ADMIN_SEED_PASSWORD),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Seeded admin user: {ADMIN_SEED_EMAIL}")
        else:
            # ensure role is admin
            if existing.get("role") != "admin":
                await db.users.update_one({"email": ADMIN_SEED_EMAIL.lower()}, {"$set": {"role": "admin"}})
    except Exception as e:
        logger.error(f"Admin seed failed: {e}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

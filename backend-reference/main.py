# FastAPI Reference Implementation
# This shows how the actual Python backend would be structured

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, validator
from passlib.context import CryptContext
from jose import JWTError, jwt

from datetime import datetime
from typing import List, Optional
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
ollama_url = "http://localhost:11434/api/chat"

# FastAPI app initialization
app = FastAPI(title="Chat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup (SQLAlchemy)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5555/chatdb"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    content = Column(Text)
    role = Column(String)  # 'user' or 'assistant'
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "supersecretkey"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Pydantic Models (Request/Response schemas)
class UserCreate(BaseModel):
    email: str
    name: str
    password: str

    @validator('email')
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    created_at: datetime
    is_active: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatMessageCreate(BaseModel):
    content: str
    role: str = "user"

    @validator('content')
    def content_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message content cannot be empty')
        return v.strip()

class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    content: str
    role: str
    created_at: datetime

    model_config = {'from_attributes': True}

ollama_url = "http://localhost:11434/api/chat"

def get_ai_response(message: str, ollama_url: str) -> str:
    try:
        payload = {
            "model": "llama2",  # You can change to any model you have pulled (e.g., "mistral")
            "messages": [
                {"role": "user", "content": message}
            ]
        }
        response = requests.post(ollama_url, json=payload, timeout=60)
        response.raise_for_status()
        print("[Ollama raw response]:\n", response.text)  # Debug log
        # Handle streaming JSON lines
        full_message = ""
        for line in response.text.strip().splitlines():
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                if "message" in data and "content" in data["message"]:
                    full_message += data["message"]["content"]
            except Exception as e:
                print(f"[Ollama parse error]: {e} for line: {line}")
        if full_message:
            return full_message
        return "[No response from LLM]"
    except Exception as e:
        return f"[LLM error: {str(e)}]"

class ChatRequest(BaseModel):
    message: str
    user_id: int

class ChatResponse(BaseModel):
    user_message: ChatMessageResponse
    ai_response: ChatMessageResponse

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    from datetime import timedelta
    from datetime import datetime as dt
    to_encode = data.copy()
    expire = dt.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# API Endpoints
@app.post("/chat/", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    # Save user message
    user_message = ChatMessage(
        user_id=request.user_id,
        content=request.message,
        role="user"
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Get AI response (Ollama integration)
    try:
        ai_response_text = get_ai_response(request.message, ollama_url)

        # Save AI response
        ai_message = ChatMessage(
            user_id=request.user_id,
            content=ai_response_text,
            role="assistant"
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        return ChatResponse(
            user_message=ChatMessageResponse.model_validate(user_message),
            ai_response=ChatMessageResponse.model_validate(ai_message)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

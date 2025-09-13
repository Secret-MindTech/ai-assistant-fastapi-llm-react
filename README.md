# FastAPI + React Chat POC

This project demonstrates a full-stack chat application with AI integration following FastAPI, SQLAlchemy, and Pydantic patterns.

## Project Structure

```
/
├── src/                    # React frontend
├── supabase/
│   ├── functions/         # Edge functions (FastAPI-style endpoints)
│   └── migrations/        # Database migrations (SQLAlchemy-style)
├── backend-reference/     # Python FastAPI reference implementation
└── README.md
```

## Features

- 🤖 AI Chat Integration
- 💬 Real-time messaging
- 📝 Message history
- 🔐 User authentication
- 📊 RESTful API design
- 🎨 Modern UI/UX

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Supabase Client

### Backend (Edge Functions)
- Deno runtime
- Supabase Edge Functions
- OpenAI API integration

### Database
- PostgreSQL (Supabase)
- Row Level Security (RLS)

## Getting Started

1. Set up Supabase connection
2. Run migrations
3. Start the development server
4. Begin chatting with AI!
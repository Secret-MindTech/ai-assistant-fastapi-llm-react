/*
 * Edge Function: Chat History
 * Simulates FastAPI GET endpoint for retrieving chat history
 */

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock user ID (in real FastAPI, this would come from JWT)
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Validate query parameters (Pydantic-style)
    if (limit > 100) {
      return new Response(
        JSON.stringify({ error: 'Limit cannot exceed 100', type: 'ValidationError' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Mock chat history (in real FastAPI, this would query SQLAlchemy models)
    const mockHistory: ChatMessage[] = [
      {
        id: '1',
        user_id: userId,
        content: 'Hello, how are you?',
        role: 'user',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        user_id: userId,
        content: "Hello! I'm doing well, thank you for asking. How can I help you today?",
        role: 'assistant',
        created_at: '2024-01-15T10:30:05Z'
      },
      {
        id: '3',
        user_id: userId,
        content: 'Can you explain what FastAPI is?',
        role: 'user',
        created_at: '2024-01-15T10:31:00Z'
      },
      {
        id: '4',
        user_id: userId,
        content: 'FastAPI is a modern, fast web framework for building APIs with Python. It features automatic API documentation, type hints support, and high performance.',
        role: 'assistant',
        created_at: '2024-01-15T10:31:10Z'
      }
    ];
    
    // Apply pagination
    const paginatedHistory = mockHistory.slice(offset, offset + limit);
    
    return new Response(
      JSON.stringify({
        messages: paginatedHistory,
        total: mockHistory.length,
        limit,
        offset
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
    
  } catch (error) {
    console.error('Chat history error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});